"use strict";

import {AuthenticationConfig} from "../config/authentication";
import * as Utils from "underscore";
import * as pathUtil from "path"; 
import * as auth from "passport"; 
import {Gateway} from "../gateway";

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

    authentication(apiKey: string, path: string, authentication: AuthenticationConfig) {
        Utils.keys(authentication).forEach(key=>{
            try {
                let authConfig = authentication[key];
                if (Utils.has(providedStrategies, key)) {
                    let strategy = providedStrategies[key];
                    strategy(apiKey, authConfig, this.gateway);
                }
                else {
                    let p = pathUtil.join(this.gateway.middlewarePath, 'authentication', 'strategies' , key);                
                    let strategy = require(p);
                    strategy(apiKey, authConfig);
                }
                this.gateway.server.use(path, auth.authenticate(apiKey, { session: false }));
                if (this.gateway.logger.isDebugEnabled) {
                    this.gateway.logger.debug("Authentication Strategy [%s] configured for path [%s]", key, path);
                }
            }
            catch(e) {
                this.gateway.logger.error("Error configuring Authentication Strategy [%s] for path [%s]", key, path, e);
            }
        });
    }
}
