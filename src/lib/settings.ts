"use strict";

import * as express from "express";
import {Scope, Scoped, Provided, Provider, AutoWired} from "typescript-ioc";

const provider: Provider = { 
  get: () => {
      const settings: Settings = new Settings();
      settings.app = express();
      return settings; 
  }
};


@AutoWired
@Scoped(Scope.Singleton)
@Provided(provider)
export class Settings {
    app: express.Application;
}