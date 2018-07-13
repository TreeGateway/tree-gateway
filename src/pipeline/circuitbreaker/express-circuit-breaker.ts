'use strict';

import { EventEmitter } from 'events';
import * as express from 'express';
import { ProxyError } from '../error/errors';

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
    destroy(): void;
}

export class CircuitBreaker extends EventEmitter {
    private options: Options;

    constructor(options: Options) {
        super();
        this.options = options;
        this.options.stateHandler.initialState();
    }

    public isOpen() {
        return this.options.stateHandler.isOpen();
    }

    public isHalfOpen() {
        return this.options.stateHandler.isHalfOpen();
    }

    public isClosed() {
        return this.options.stateHandler.isClosed();
    }

    public forceOpen(req: express.Request) {
        if (!this.options.stateHandler.forceOpen()) {
            return;
        }

        this.emit('open', req);
    }

    public forceClosed(req: express.Request) {
        if (!this.options.stateHandler.forceClose()) {
            return;
        }
        this.emit('close', req);
    }

    public forceHalfOpen() {
        if (!this.options.stateHandler.forceHalfOpen()) {
            return;
        }
        this.emit('halfOpen');
    }

    public middleware(): express.RequestHandler {
        return (req, res, next) => {
            // this.emit('request');
            if (this.isOpen() || (this.isHalfOpen() && this.options.stateHandler.halfOpenCallPending)) {
                return this.fastFail(next);
            } else if (this.isHalfOpen() && !this.options.stateHandler.halfOpenCallPending) {
                this.options.stateHandler.halfOpenCallPending = true;
                return this.invokeApi(req, res, next);
            } else {
                return this.invokeApi(req, res, next);
            }
        };
    }

    public onStateChanged(state: string) {
        this.options.stateHandler.onStateChanged(state);
    }

    get id(): string {
        return this.options.id;
    }

    public destroy() {
        this.removeAllListeners();
        this.options.stateHandler.destroy();
    }

    private invokeApi(req: express.Request, res: express.Response, next: express.NextFunction) {
        let operationTimeout = false;
        const timeoutID = setTimeout(() => {
            operationTimeout = true;
            this.handleTimeout(req, res, next);
        }, this.options.timeout);
        const end = res.end;
        const self = this;
        res.end = function (...args: Array<any>) {
            if (!operationTimeout) {
                clearTimeout(timeoutID);
                if (res.statusCode >= 500) {
                    self.options.stateHandler.halfOpenCallPending = false;
                    self.handleFailure(req, new Error('Circuit breaker API call failure'));// TODO pegar mensagem e status do response
                } else {
                    self.handleSuccess(req);
                }
            }
            res.end = end;
            res.end.apply(res, arguments);
        };

        return next();
    }

    private fastFail(next: express.NextFunction) {
        const err = new ProxyError(this.options.rejectMessage, this.options.rejectStatusCode);
        next(err);
        // res.status(this.options.rejectStatusCode);
        // res.end(err.message);
        this.emit('rejected', err);
    }

    private handleTimeout(req: express.Request, res: express.Response, next: express.NextFunction) {
        const err = new ProxyError(this.options.timeoutMessage, this.options.timeoutStatusCode);
        this.handleFailure(req, err);
        // res.status(this.options.timeoutStatusCode);
        // res.end(err.message);
        next(err);
        // this.emit('timeout', (Date.now() - startTime));
    }

    private handleSuccess(req: express.Request) {
        this.forceClosed(req);

        // this.emit('success');
    }

    private handleFailure(req: express.Request, err: Error) {
        this.options.stateHandler.incrementFailures()
            .then(numFailures => {
                if (this.isHalfOpen() || numFailures >= this.options.maxFailures) {
                    this.forceOpen(req);
                }
            });

        // this.emit('failure', err);
    }
}
