'use strict';

import { EventEmitter } from 'events';

export class Metrics {
    private static monitoring: any;
    private static events: EventEmitter = new EventEmitter();

    static initialize() {
        const appmetrics = require('appmetrics');
        appmetrics.configure({
            mqtt: 'off'
        });
        Metrics.monitoring = appmetrics.monitor();

        appmetrics.disable('socketio');
        appmetrics.disable('mongo');
        appmetrics.disable('mqlight');
        appmetrics.disable('postgresql');
        appmetrics.disable('mqtt');
        appmetrics.disable('mysql');
        appmetrics.disable('riak');
        appmetrics.disable('memcached');
        appmetrics.disable('oracledb');
        appmetrics.disable('oracle');
        appmetrics.disable('strong-oracle');
        appmetrics.disable('redis');
        appmetrics.disable('profiling');
        appmetrics.disable('requests');
        appmetrics.disable('trace');

        Metrics.monitoring.on('cpu', (data: any) => {
            Metrics.events.emit('cpu', data);
        });
        Metrics.monitoring.on('eventloop', (data: any) => {
            Metrics.events.emit('eventloop', data);
        });
        Metrics.monitoring.on('gc', (data: any) => {
            Metrics.events.emit('gc', data);
        });
        Metrics.monitoring.on('initialized', () => {
            Metrics.events.emit('initialized');
        });
        Metrics.monitoring.on('loop', (data: any) => {
            Metrics.events.emit('loop', data);
        });
        Metrics.monitoring.on('memory', (data: any) => {
            Metrics.events.emit('memory', data);
        });
        Metrics.monitoring.on('http', (data: any) => {
            Metrics.events.emit('http', data);
        });
        Metrics.monitoring.on('https', (data: any) => {
            Metrics.events.emit('https', data);
        });
        Metrics.monitoring.on('http-outbound', (data: any) => {
            Metrics.events.emit('http-outbound', data);
        });
        Metrics.monitoring.on('https-outbound', (data: any) => {
            Metrics.events.emit('https-outbound', data);
        });
    }

    static on(event: string | symbol, listener: (...args: any[]) => void) {
        Metrics.ensureEnabled();
        Metrics.events.on(event, listener);
        return this;
    }

    static removeListener(event: string | symbol, listener: (...args: any[]) => void) {
        Metrics.ensureEnabled();
        Metrics.events.removeListener(event, listener);
        return this;
    }

    static removeAllListeners(event?: string | symbol) {
        Metrics.ensureEnabled();
        Metrics.events.removeAllListeners(event);
        return this;
    }

    static get enabled() {
        return !!Metrics.monitoring;
    }

    private static ensureEnabled() {
        if (!Metrics.enabled) {
            throw new Error('To collect gateway metrics, you must run treeGateway passing the metrics parameter (treeGateway -m)');
        }
    }
}
