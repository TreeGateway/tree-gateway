"use strict";

import * as path from "path";
import * as StringUtils from "underscore.string";

let args = require("args");

let parameters = args
  .option('dir', 'The root directory where apis and middlewares are placed.', __dirname)
  .option('port', 'The gateway listen port.', 8000)
  .option('adminPort', 'The gateway admin server listen port.', 8001)
  .parse(process.argv);

export class Parameters {
    static rootDir: string;
    static port: number;
    static adminPort: number;
}

Parameters.rootDir = parameters.dir;
Parameters.port = parameters.port;
Parameters.adminPort = parameters.adminPort;

if (StringUtils.startsWith(Parameters.rootDir, '.')) {
  Parameters.rootDir = path.join(process.cwd(), Parameters.rootDir);                
}

