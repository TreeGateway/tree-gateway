'use strict';

import { EventEmitter } from 'events';
import * as express from 'express';

export enum State { OPEN, CLOSED, HALF_OPEN }

export interface Options {
    timeout: number;
    maxFailures: number;
    stateHandler: StateHandler;
    timeoutMessage: string;
    timeoutStatusCode: number;
    rejectMessage: string;
    rejectStatusCode: number;
    id: string;
}

export interface StateHandler {
    halfOpenCallPending: boolean;
    isOpen(): boolean;
    isHalfOpen(): boolean;
    isClosed(): boolean;
    forceOpen(): boolean;
    forceHalfOpen(): boolean;
    forceClose(): boolean;
    incrementFailures(): Promise<number>;
    initialState(): void;
    onStateChanged(state: string): void;
}

export class CircuitBreaker extends EventEmitter {
    private options: Options;

    constructor(options: Options) {
        super();
        this.options = options;
        this.options.stateHandler.initialState();
    }

    isOpen() {
        return this.options.stateHandler.isOpen();
    }

    isHalfOpen() {
        return this.options.stateHandler.isHalfOpen();
    }

    isClosed() {
        return this.options.stateHandler.isClosed();
    }

    forceOpen() {
        if (!this.options.stateHandler.forceOpen()) {
            return;
        }

        this.emit('open');
    }

    forceClosed() {
        if (!this.options.stateHandler.forceClose()) {
            return;
        }
        this.emit('close');
    }

    forceHalfOpen() {
        if (!this.options.stateHandler.forceHalfOpen()) {
            return;
        }
        this.emit('halfOpen');
    }

    middleware(): express.RequestHandler {
        const self = this;
        return (req, res, next) => {
            // self.emit('request');
            if (self.isOpen() || (self.isHalfOpen() && self.options.stateHandler.halfOpenCallPending)) {
                return self.fastFail(res);
            } else if (self.isHalfOpen() && !self.options.stateHandler.halfOpenCallPending) {
                self.options.stateHandler.halfOpenCallPending = true;
                return self.invokeApi(req, res, next);
            } else {
                return self.invokeApi(req, res, next);
            }
        };
    }

    onStateChanged(state: string) {
        this.options.stateHandler.onStateChanged(state);
    }

    get id(): string {
        return this.options.id;
    }

    private invokeApi(req: express.Request, res: express.Response, next: express.NextFunction) {
        const self = this;
        let operationTimeout = false;
        const timeoutID = setTimeout(() => {
            operationTimeout = true;
            self.handleTimeout(res);
        }, self.options.timeout);
        const end = res.end;
        res.end = function(...args: any[]) {
            if (!operationTimeout) {
                clearTimeout(timeoutID);
                if (res.statusCode >= 500) {
                    self.options.stateHandler.halfOpenCallPending = false;
                    self.handleFailure(new Error('Circuit breaker API call failure'));// TODO pegar mensagem e status do response
                } else {
                    self.handleSuccess();
                }
            }
            res.end = end;
            res.end.apply(res, arguments);
        };

        return next();
    }

    private fastFail(res: express.Response) {
        res.status(this.options.rejectStatusCode);
        const err = new Error(this.options.rejectMessage);
        res.end(err.message);
        this.emit('rejected', err);
    }

    private handleTimeout(res: express.Response) {
        const err = new Error(this.options.timeoutMessage);
        this.handleFailure(err);
        res.status(this.options.timeoutStatusCode);
        res.end(err.message);
        // this.emit('timeout', (Date.now() - startTime));
    }

    private handleSuccess() {
        this.forceClosed();

        // this.emit('success');
    }

    private handleFailure(err: Error) {
        this.options.stateHandler.incrementFailures()
            .then(numFailures => {
                if (this.isHalfOpen() || numFailures >= this.options.maxFailures) {
                    this.forceOpen();
                }
            });

        // this.emit('failure', err);
    }
}
