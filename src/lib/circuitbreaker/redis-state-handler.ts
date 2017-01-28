"use strict";

import {StateHandler, State} from "./express-circuit-breaker";
import {Gateway} from "../gateway";

export class RedisStateHandler implements StateHandler {
    private id: string;
    private gateway: Gateway;
    private state: State;
    halfOpenCallPending: boolean;
    
    constructor(id: string, gateway: Gateway) {
        this.id = id;
        this.gateway = gateway;
        // this.prefix = config.prefix;
        // this.duration = humanInterval(config.granularity.duration)/1000;
        // this.ttl = humanInterval(config.granularity.ttl)/1000;
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
        let self = this;

        if(this.state === State.OPEN) {
            return false;
        }

        this.state = State.OPEN;
        return true;
    }

    forceClose(): boolean {
        this.gateway.redisClient.hdel(`circuitbreaker:failures`, this.id);
        this.halfOpenCallPending = false;

        if(this.state === State.CLOSED) {
            return false;
        }

        this.state = State.CLOSED;
        return true;
    }

    forceHalfOpen(): boolean {
        if(this.state === State.HALF_OPEN) {
            return false;
        }

        this.state = State.HALF_OPEN;
        return true;
    }

    incrementFailures(): Promise<number> {
        return this.gateway.redisClient.hincrby(`circuitbreaker:failures`, this.id, 1);
    }
}