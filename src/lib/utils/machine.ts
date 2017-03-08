"use strict";

import * as os from "os";

export function getMachineId() {
    return (process.env.processNumber?`${os.hostname()}_${process.env.processNumber}`:`${os.hostname()}`);
}
