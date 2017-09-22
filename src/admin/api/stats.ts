'use strict';

import { Path, GET, PathParam, Errors, QueryParam } from 'typescript-rest';
import { Stats } from '../../stats/stats';
import { Monitors } from '../../monitor/monitors';
import { Inject } from 'typescript-ioc';
import { StatsRecorder } from '../../stats/stats-recorder';
import * as swagger from 'typescript-rest-swagger';

@Path('stats')
@swagger.Tags('Stats')
@swagger.Security('Bearer')
export class StatsRest {
    @Inject private monitors: Monitors;
    @Inject private statsRecorder: StatsRecorder;

    @GET
    @Path('auth/fail/:apiId')
    getAuthFail( @PathParam('apiId') apiId: string,
        @QueryParam('path') path: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'auth', path, 'fail', count);
    }

    @GET
    @Path('auth/success/:apiId')
    getAuthSuccess( @PathParam('apiId') apiId: string,
        @QueryParam('path') path: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'auth', path, 'success', count);
    }

    @GET
    @Path('cache/hit/:apiId')
    getCahcheHit( @PathParam('apiId') apiId: string,
        @QueryParam('path') path: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'cache', path, 'hit', count);
    }

    @GET
    @Path('cache/miss/:apiId')
    getCahcheMiss( @PathParam('apiId') apiId: string,
        @QueryParam('path') path: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'cache', path, 'miss', count);
    }

    @GET
    @Path('cache/error/:apiId')
    getCahcheError( @PathParam('apiId') apiId: string,
        @QueryParam('path') path: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'cache', path, 'error', count);
    }

    @GET
    @Path('throttling/exceeded/:apiId')
    getThrottlingExceeded( @PathParam('apiId') apiId: string,
        @QueryParam('path') path: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'throttling', path, 'exceeded', count);
    }

    @GET
    @Path('circuitbreaker/open/:apiId')
    getCircuitBreakerOpen( @PathParam('apiId') apiId: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'circuitbreaker', 'total', 'open', count);
    }

    @GET
    @Path('circuitbreaker/close/:apiId')
    getCircuitBreakerClose( @PathParam('apiId') apiId: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'circuitbreaker', 'total', 'close', count);
    }

    @GET
    @Path('circuitbreaker/rejected/:apiId')
    getCircuitBreaker( @PathParam('apiId') apiId: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'circuitbreaker', 'total', 'rejected', count);
    }

    @GET
    @Path('access/request/:apiId')
    getAccessRequest( @PathParam('apiId') apiId: string,
        @QueryParam('path') path: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'access', path, 'request', count);
    }

    @GET
    @Path('access/status/:code/:apiId')
    getAccessStatus( @PathParam('apiId') apiId: string,
        @PathParam('code') code: number,
        @QueryParam('path') path: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getStats(apiId, 'access', path, 'status', count || 24, `${code}`);
    }

    @GET
    @Path('monitors/machines')
    getMachines(): Promise<Array<string>> {
        return this.monitors.getActiveMachines();
    }

    @GET
    @Path('monitors/cpu/:machineId')
    getCpuMonitor( @PathParam('machineId') machineId: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getMonitorStats('cpu', machineId, count);
    }

    @GET
    @Path('monitors/mem/:machineId')
    getMemMonitor( @PathParam('machineId') machineId: string,
        @QueryParam('count') count: number): Promise<Array<Array<number>>> {
        return this.getMonitorStats('mem', machineId, count);
    }

    protected getStats(apiId: string,
        prefix: string,
        path: string,
        key: string,
        count?: number,
        ...extra: string[]): Promise<Array<Array<number>>> {
        return new Promise<Array<Array<number>>>((resolve, reject) => {
            if (path) {
                const stats = this.statsRecorder.createStats(Stats.getStatsKey(prefix, apiId, key));
                stats.getLastOccurrences(count || 24, path, ...extra)
                    .then(resolve)
                    .catch(reject);
            } else {
                return reject(new Errors.ForbidenError('Path parameter is required.'));
            }
        });
    }

    protected getMonitorStats(
        name: string,
        machineId: string,
        count?: number): Promise<Array<Array<number>>> {
        return new Promise<Array<Array<number>>>((resolve, reject) => {
            const stats = this.statsRecorder.createStats(name);
            stats.getLastOccurrences(count || 24, machineId)
                .then(resolve)
                .catch(reject);
        });
    }
}
