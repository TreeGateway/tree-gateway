"use strict";

import {ApiConfig} from "../config/api";
import {AuthenticationConfig} from "../config/authentication";
import * as Utils from "underscore";
import * as pathUtil from "path"; 
import * as auth from "passport"; 
import {Gateway} from "../gateway";
import * as Groups from "../group";

const providedStrategies = {
    'jwt': require('./strategies/jwt'),
    'basic': require('./strategies/basic'),
    'local': require('./strategies/local')
} 

export class ApiAuth {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    authentication(apiKey: string, api: ApiConfig) {
        let path: string =api.proxy.path;
        let authentication: AuthenticationConfig=  api.authentication
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

                    let authenticator =  auth.authenticate(apiKey, { session: false });
                    if (authentication.group) {
                        if (this.gateway.logger.isDebugEnabled()) {
                            let groups = Groups.filter(api.group, authentication.group);
                            this.gateway.logger.debug('Configuring Group filters for Authentication on path [%s]. Groups [%s]', 
                                api.proxy.target.path, JSON.stringify(groups));
                        }
                        let f = Groups.buildGroupAllowFilter(api.group, authentication.group);
                        this.gateway.server.use(path, (req, res, next)=>{
                            if (f(req, res)){
                                authenticator(req, res, next);
                            }
                            else {
                                next(); 
                            }
                        });
                    }
                    else {
                        this.gateway.server.use(path, authenticator);
                    }
                    
                    
                    if (this.gateway.logger.isDebugEnabled) {
                        this.gateway.logger.debug("Authentication Strategy [%s] configured for path [%s]", key, path);
                    }
                }
            }
            catch(e) {
                this.gateway.logger.error("Error configuring Authentication Strategy [%s] for path [%s]", key, path, e);
            }
        });
    }
}
