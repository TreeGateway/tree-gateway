'use strict';

import { StateHandler, State } from './express-circuit-breaker';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { Database } from '../database';
import { ConfigTopics } from '../config/events';

export class CircuitBreakerKeys {
    static CIRCUIT_BREAKER_FAILURES = '{circuitbreaker}:failures';
    static CIRCUIT_BREAKER_STATE = '{circuitbreaker}:state';
}

@AutoWired
export class RedisStateHandler implements StateHandler {
    @Inject private logger: Logger;
    @Inject private database: Database;

    private id: string;
    private state: State;
    halfOpenCallPending: boolean;
    private resetTimeout: number;
    private timeWindow: number;

    constructor(id: string, resetTimeout: number, timeWindow?: number) {
        this.id = id;
        this.resetTimeout = resetTimeout;
        if (timeWindow) {
            this.timeWindow = timeWindow / 1000;
        }
    }

    initialState() {
        this.database.redisClient.get(this.getRedisStateKey())
            .then((state: any) => {
                if (state === 'open') {
                    this.openState();
                } else {
                    this.closeState();
                }
            }).catch((err: any) => {
                this.forceClose();
            });
    }

    isOpen(): boolean {
        return this.state === State.OPEN;
    }

    isHalfOpen(): boolean {
        return this.state === State.HALF_OPEN;
    }

    isClosed(): boolean {
        return this.state === State.CLOSED;
    }

    forceOpen(): boolean {
        if (!this.openState()) {
            return false;
        }
        this.notifyCircuitOpen();
        return true;
    }

    forceClose(): boolean {
        if (!this.closeState()) {
            return false;
        }
        this.notifyCircuitClose();
        return true;
    }

    forceHalfOpen(): boolean {
        if (this.state === State.HALF_OPEN) {
            return false;
        }

        this.state = State.HALF_OPEN;
        this.halfOpenCallPending = false;
        return true;
    }

    incrementFailures(): Promise<number> {
        const rdskey = this.getRedisFailuresKey();
        if (this.timeWindow) {
            return new Promise<number>((resolve, reject) => {
                this.database.redisClient.multi()
                .incr(rdskey)
                .ttl(rdskey)
                .exec((err, replies) => {
                    if (err) {
                        return reject(err);
                    }

                    // if this is new or has no expire
                    if (replies[0][1] === 1 || replies[1][1] === -1) {
                        // then expire it after the timeout
                        this.database.redisClient.expire(rdskey, this.timeWindow);
                    }

                    resolve(replies[0][1]);
                });
            });
        } else {
            return this.database.redisClient.incr(rdskey);
        }
    }

    onStateChanged(state: string) {
        switch (state) {
            case 'open':
                if (this.logger.isDebugEnabled()) {
                    this.logger.debug(`Notification received: Circuit for API ${this.id} is open`);
                }
                this.openState();
                break;
            case 'close':
                if (this.logger.isDebugEnabled()) {
                    this.logger.debug(`Notification received: Circuit for API ${this.id} is closed`);
                }
                this.closeState();
                break;
            default:
            // Ignore
        }
    }

    private getRedisFailuresKey() {
        return `${CircuitBreakerKeys.CIRCUIT_BREAKER_FAILURES}:${this.id}`;
    }

    private getRedisStateKey() {
        return `${CircuitBreakerKeys.CIRCUIT_BREAKER_STATE}:${this.id}`;
    }

    private openState(): boolean {
        if (this.state === State.OPEN) {
            return false;
        }

        this.state = State.OPEN;
        // After reset timeout circuit should enter half open state
        setTimeout(() => {
            this.forceHalfOpen();
        }, this.resetTimeout);

        return true;
    }

    private closeState() {
        if (this.state === State.CLOSED) {
            return false;
        }

        this.halfOpenCallPending = false;
        this.state = State.CLOSED;
        return true;
    }

    private notifyCircuitOpen(): Promise<number> {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Notifying cluster that circuit for API ${this.id} is open`);
        }
        return this.database.redisClient.multi()
            .set(this.getRedisStateKey(), 'open')
            .publish(ConfigTopics.CIRCUIT_CHANGED, JSON.stringify({ state: 'open', id: this.id }))
            .exec();
    }

    private notifyCircuitClose(): Promise<number> {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Notifying cluster that circuit for API ${this.id} is closed`);
        }

        return this.database.redisClient.multi()
            .set(this.getRedisStateKey(), 'close')
            .del(this.getRedisFailuresKey(), this.id)
            .publish(ConfigTopics.CIRCUIT_CHANGED, JSON.stringify({ state: 'close', id: this.id }))
            .exec();
    }
}
