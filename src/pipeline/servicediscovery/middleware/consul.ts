'use strict';

import * as consul from 'consul';
import * as Joi from 'joi';
import { ValidationError } from '../../../config/errors';
import { UnavailableError } from '../../error/errors';

interface ConsulConfig {
    clientAgent: consul.Consul;
    /**
     * Service name
     */
    serviceName: string;
    /**
     * True if the connection to service should use SSL (https)
     */
    ssl?: boolean;
    /**
     * datacenter (defaults to local for agent)
     */
    dc?: string;
    /**
     *  filter by tag
     */
    tag?: string;
    /**
     * The Load Balancer strategy used to choose one between the available service nodes. Defaults to random.
     */
    loadBalancer?: string;
}

const consulConfigSchema = Joi.object().keys({
    clientAgent: Joi.any().required(),
    dc: Joi.string(),
    loadBalancer: Joi.string().valid('random', 'round-robin'),
    serviceName: Joi.string().required(),
    ssl: Joi.boolean(),
    tag: Joi.string()
});

function validateConsulConfig(config: ConsulConfig) {
    const result = Joi.validate(config, consulConfigSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

function random(serviceInstances: Array<string>) {
    return serviceInstances[Math.floor(Math.random() * serviceInstances.length)];
}

function roundRobin(serviceInstances: Array<string>) {
    let next = (serviceInstances as any).next || 0;
    const index = next % serviceInstances.length;
    next++;
    (serviceInstances as any).next = next;
    return serviceInstances[index];
}

function observeService(serviceName: string, config: ConsulConfig, knownServiceInstances: Map<string, Array<string>>) {
    const options: any = {
        passing: true,
        service: serviceName
    };
    if (config.dc) {
        options.dc = config.dc;
    }
    if (config.tag) {
        options.tag = config.tag;
    }

    const watcher = config.clientAgent.watch({
        method: config.clientAgent.health.service,
        options: options
    });

    watcher.on('change', (data: any) => {
        const serviceInstances = new Array<string>();
        knownServiceInstances.set(serviceName, serviceInstances);
        data.forEach((entry: any) => {
            serviceInstances.push(`${config.ssl ? 'https' : 'http'}://${entry.Node.Address}:${entry.Service.Port}/`);
        });
    });
}

module.exports = function (config: ConsulConfig) {
    validateConsulConfig(config);

    const knownServiceInstances: Map<string, Array<string>> = new Map<string, Array<string>>();

    if (config.serviceName) {
        observeService(config.serviceName, config, knownServiceInstances);
    }

    let balance: (serviceInstances: Array<string>) => string = roundRobin;
    if (config.loadBalancer && config.loadBalancer === 'random') {
        balance = random;
    }

    return (serviceName?: string) => {
        return new Promise((resolve, reject) => {
            if (!serviceName) {
                serviceName = config.serviceName;
            }
            if (!serviceName) {
                return reject(new UnavailableError('Service name is missing for consul service discovery middleware.'));
            }
            const serviceInstances = knownServiceInstances.get(serviceName);
            if (!serviceInstances) {
                observeService(serviceName, config, knownServiceInstances);
                config.clientAgent.health.service({
                    service: serviceName
                }, (err: any, instances: any) => {
                    if (err) {
                        return reject(err);
                    }
                    if (instances && instances.length) {
                        const entry = instances[0];
                        resolve(`${config.ssl ? 'https' : 'http'}://${entry.Node.Address}:${entry.Service.Port}/`);
                    } else {
                        return reject(new UnavailableError(`No instance available for service '${serviceName}'`));
                    }
                });
            } else if (serviceInstances.length) {
                resolve(balance(serviceInstances));
            } else {
                return reject(new UnavailableError(`No instance available for service '${serviceName}'`));
            }
        });
    };
};
module.exports.factory = true;
