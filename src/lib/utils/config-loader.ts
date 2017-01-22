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

            fs.readJsonAsync(configFileName)
                .then((config:GatewayConfig) => {
                    if (process.env.NODE_ENV) {
                        let envConfigFileName = configFileName.replace(`.json`, `-${process.env.NODE_ENV}.json`);
                        if (fs.existsSync(envConfigFileName)) {
                            let envConfig = fs.readJsonSync(envConfigFileName);
                            config = <GatewayConfig>_.defaultsDeep(envConfig, config);
                        }                
                    }
                    return validateGatewayConfig(config);
                })
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

                    if (gatewayConfig.protocol.https) {
                        if (_.startsWith(gatewayConfig.protocol.https.privateKey, ".")) {
                            gatewayConfig.protocol.https.privateKey = path.join(gatewayConfig.rootPath, gatewayConfig.protocol.https.privateKey);                
                        }
                        if (_.startsWith(gatewayConfig.protocol.https.certificate, ".")) {
                            gatewayConfig.protocol.https.certificate = path.join(gatewayConfig.rootPath, gatewayConfig.protocol.https.certificate);                
                        }
                    }
                    resolve(gatewayConfig);
                })
                .catch(err => reject(err));
        } catch (error) {
            reject(new Error(`Error reading ${configFileName} config file: ${error}`));
        }
    });
}