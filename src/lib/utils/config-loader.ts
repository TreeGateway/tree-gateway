"use strict";

import * as fs from "fs-extra-promise";
import * as _ from "lodash";
import * as path from "path";

import {GatewayConfig, validateGatewayConfig} from "../config/gateway";

export default function loadConfigFile(configFileName:string): Promise<GatewayConfig> {
    return new Promise((resolve, reject) => {
        try {
            configFileName = _.trim(configFileName);

            if (_.startsWith(configFileName, ".")) {
                configFileName = path.join(process.cwd(), configFileName);
            }

            let config:GatewayConfig = fs.readJsonSync(configFileName);

            validateGatewayConfig(config)
                .then((gatewayConfig:GatewayConfig) => {
                    gatewayConfig = _.defaults(gatewayConfig, {
                        rootPath : path.dirname(configFileName),
                    });

                    if (_.startsWith(gatewayConfig.rootPath, ".")) {
                        gatewayConfig.rootPath = path.join(path.dirname(configFileName), gatewayConfig.rootPath);
                    }

                    gatewayConfig = _.defaults(gatewayConfig, {
                        middlewarePath : path.join(gatewayConfig.rootPath, "middleware")
                    });

                    if (_.startsWith(gatewayConfig.middlewarePath, ".")) {
                        gatewayConfig.middlewarePath = path.join(gatewayConfig.rootPath, gatewayConfig.middlewarePath);                
                    }

                    resolve(gatewayConfig);
                })
                .catch(err => reject(err));
        } catch (error) {
            reject(new Error(`Error reading ${configFileName} config file: ${error}`));
        }
    });
}