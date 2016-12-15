"use strict";

import {ApiConfig} from "../config/api";
import {AuthenticationConfig} from "../config/authentication";
import * as Utils from "underscore";
import * as pathUtil from "path"; 
import * as auth from "passport"; 
import {Gateway} from "../gateway";
import {Stats} from "../stats/stats";
import * as Groups from "../group";
import * as express from "express";

const providedStrategies = {
    'jwt': require('./strategies/jwt'),
    'basic': require('./strategies/basic'),
    'local': require('./strategies/local')
} 

class StatsController {
    failStats: Stats;
    successStats: Stats;
}

export class ApiAuth {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    authentication(apiKey: string, api: ApiConfig) {
        let path: string = api.proxy.path;
        let authentication: AuthenticationConfig =  api.authentication
        Utils.keys(authentication.strategy).forEach(key=>{
            try {
                let authConfig = authentication.strategy[key];
                let authStrategy: auth.Strategy;
                if (Utils.has(providedStrategies, key)) {
                    let strategy = providedStrategies[key];
                    authStrategy= strategy(authConfig, this.gateway);
                }
                else {
                    let p = pathUtil.join(this.gateway.middlewarePath, 'authentication', 'strategies' , key);                
                    let strategy = require(p);
                    authStrategy = strategy(authConfig);
                }
                if (!authStrategy) {
                    this.gateway.logger.error('Error configuring authenticator. Invalid Strategy');
                }
                else{
                    auth.use(apiKey, authStrategy);

                    let authenticator =  auth.authenticate(apiKey, { session: false, failWithError: true });
                    if (authentication.group) {
                        this.createAuthenticatorForGroup(api, authentication, authenticator);
                    }
                    else {
                        this.createAuthenticator(api, authentication, authenticator);
                    }
                    
                    
                    if (this.gateway.logger.isDebugEnabled) {
                        this.gateway.logger.debug(`Authentication Strategy [${key}] configured for path [${path}]`);
                    }
                }
            }
            catch(e) {
                this.gateway.logger.error(`Error configuring Authentication Strategy [${key}] for path [${path}]`, e);
            }
        });
    }
    
    private createAuthenticator(api: ApiConfig, authentication: AuthenticationConfig, 
                                authenticator: express.RequestHandler) {
        let path: string = api.proxy.path;
        let stats = this.createAuthStats(path, authentication);
        if (stats) {
            this.gateway.server.use(path, (req, res, next)=>{
                authenticator(req, res, (err)=>{
                    if (err) {
                        stats.failStats.registerOccurrence(req.path);
                        next(err);
                    }
                    else {
                        stats.successStats.registerOccurrence(req.path);
                        next();
                    }
                });
            });
        }
        else {
            this.gateway.server.use(path, authenticator);
        }
    }

    private createAuthenticatorForGroup(api: ApiConfig, authentication: AuthenticationConfig, 
                                        authenticator: express.RequestHandler) {
        let path: string = api.proxy.path;
        if (this.gateway.logger.isDebugEnabled()) {
            let groups = Groups.filter(api.group, authentication.group);
            this.gateway.logger.debug(`Configuring Group filters for Authentication on path [${api.proxy.target.path}]. Groups [${JSON.stringify(groups)}]`);
        }
        let f = Groups.buildGroupAllowFilter(api.group, authentication.group);
        let stats = this.createAuthStats(path, authentication);
        if (stats) {
            this.gateway.server.use(path, (req, res, next)=>{
                if (f(req, res)){
                    authenticator(req, res, (err)=>{
                        if (err) {
                            stats.failStats.registerOccurrence(req.path);
                            next(err);
                        }
                        else {
                            stats.successStats.registerOccurrence(req.path);
                            next();
                        }
                    });
                }
                else {
                    next(); 
                }
            });
        }
        else {
            this.gateway.server.use(path, (req, res, next)=>{
                if (f(req, res)){
                    authenticator(req, res, next);
                }
                else {
                    next(); 
                }
            });
        }
    }

    private createAuthStats(path: string, authentication: AuthenticationConfig) : StatsController {
        if ((!authentication.disableStats) && (this.gateway.statsConfig)) {
            let stats: StatsController = new StatsController();
            stats.failStats = this.gateway.createStats(Stats.getStatsKey('auth', 'fail', path));
            stats.successStats = this.gateway.createStats(Stats.getStatsKey('auth', 'success', path));
            
            return stats;
        }

        return null;
    }
}

