"use strict";

import {EventEmitter} from "events";
import * as express from "express";

enum State {OPEN, CLOSED, HALF_OPEN};

interface Options {
    timeout: number;
    resetTimeout: number;
    maxFailures: number;    
}

export class CircuitBreaker extends EventEmitter {
    private options: Options;
    private numFailures: number;
    private state: State;
    private halfOpenCallPending: boolean;

    constructor(options: Options) {
        super();
        this.options = options;
        this.forceClosed();
    }
    
    isOpen() {
        return this.state === State.OPEN;
    }

    isHalfOpen() {
        return this.state === State.HALF_OPEN;
    }

    isClosed() {
        return this.state === State.CLOSED;
    }

    forceOpen() {
        let self = this;

        if(this.state === State.OPEN) {
            return;
        }

        this.state = State.OPEN;

        // After reset timeout circuit should enter half open state
        setTimeout(function () {
            self.forceHalfOpen();
        }, self.options.resetTimeout);

        self.emit('open');
    }

    forceClosed() {
        this.numFailures = 0;

        if(this.state === State.CLOSED) {
            return;
        }

        this.state = State.CLOSED;
        this.emit('close');
    }

    forceHalfOpen() {
        if(this.state === State.HALF_OPEN) {
            return;
        }

        this.state = State.HALF_OPEN;

        this.emit('halfOpen');
    }

    middleware(): express.RequestHandler {
        let self = this;
        return (req, res, next) => {
            self.emit('request');
            if(self.isOpen() || (self.isHalfOpen() && self.halfOpenCallPending)) {
                return self.fastFail(res);
            } 
            else if(self.isHalfOpen() && !self.halfOpenCallPending) {
                self.halfOpenCallPending = true;
                return self.invokeApi(req, res, next);                
            } 
            else {
                return self.invokeApi(req, res, next);                
            }
        };
    }

    private invokeApi(requ, res, next) {
        let self = this;
        let startTime = Date.now();
        let timeoutID = setTimeout(()=>{
            self.handleTimeout(res, startTime);
        }, self.options.timeout);
        let end = res.end;
        res.end = function(...args) {
            self.halfOpenCallPending = false;
            if (res.statusCode >= 500) {
                self.handleFailure(new Error("Circuit breaker API call failure"));//TODO pegar mensagem e status do response
            }
            else {
                self.handleSuccess();
            }
            res.end = end;
            res.end.apply(res, arguments);
        };
        
        return next();                
    }

    private fastFail(res: express.Response) {
        res.status(503);
        let err = new Error('CircuitBreaker open');
        res.end(err.message);
        this.emit('rejected', err);
    }

    private handleTimeout (res: express.Response, startTime: number) {
        let err = new Error('CircuitBreaker timeout');
        this.handleFailure(err);
        res.status(503);
        res.end(err.message);
        this.emit('timeout', (Date.now() - startTime));
    }

    private handleSuccess() {
        this.forceClosed();

        this.emit('success');
    }

    private handleFailure(err: Error) {
        ++this.numFailures;

        if(this.isHalfOpen() || this.numFailures >= this.options.maxFailures) {
            this.forceOpen();
        }

        this.emit('failure', err);
    }
}   

