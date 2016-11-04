"use strict";

import * as express from "express";
import {Scope, Scoped, Provided, Provider, AutoWired} from "typescript-ioc";
import * as redis from "ioredis";
import * as Winston from "winston";

const provider: Provider = { 
  get: () => {
      const settings: Settings = new Settings();
      settings.app = express();
      settings.redisClient = new redis(6379, 'localhost');
      settings.apiPath = (__dirname +'/apis');
      settings.middlewarePath = (__dirname +'/middleware');
      settings.logger = new Winston.Logger({
        level: 'info',
        transports: [
            new Winston.transports.Console({
                timestamp: true
            })
        ]          
      });
      return settings; 
  }
};

@AutoWired
@Scoped(Scope.Singleton)
@Provided(provider)
export class Settings {
    app: express.Application;
    redisClient: redis.Redis;
    apiPath: string;
    middlewarePath: string;
    logger: Winston.LoggerInstance;
}
