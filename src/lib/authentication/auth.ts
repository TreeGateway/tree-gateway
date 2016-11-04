"use strict";

import * as config from "../config";
import * as Utils from "underscore";
import {AutoWired, Inject} from "typescript-ioc";
import {Settings} from "../settings";
import * as pathUtil from "path"; 
import * as auth from "passport"; 

const providedStrategies = {
    'jwt': require('./strategies/jwt'),
    'basic': require('./strategies/basic'),
    'local': require('./strategies/local')
} 

@AutoWired
export class ApiAuth {
    @Inject
    private settings: Settings;

    authentication(apiKey: string, path: string, authentication: config.Authentication) {
        Utils.keys(authentication).forEach(key=>{
            try {
                let authConfig = authentication[key];
                if (Utils.has(providedStrategies, key)) {
                    let strategy = providedStrategies[key];
                    strategy(apiKey, authConfig, this.settings);
                }
                else {
                    let p = pathUtil.join(this.settings.middlewarePath, 'authentication', 'strategies' , key);                
                    let strategy = require(p);
                    strategy(apiKey, authConfig);
                }
                this.settings.app.use(path, auth.authenticate(apiKey, { session: false }));
                this.settings.logger.debug("Authentication Strategy [%s] configured for path [%s]", key, path);
            }
            catch(e) {
                this.settings.logger.error("Error configuring Authentication Strategy [%s] for path [%s]", key, path, e);
            }
        });
    }
}
