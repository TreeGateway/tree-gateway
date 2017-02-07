"use strict";

import {NotFoundError, DuplicatedError} from "../../service/api";
import {Errors} from "typescript-rest";

export abstract class RestController {
    handleError(err: Error) {
        if (err instanceof NotFoundError) {
            return new Errors.NotFoundError(err.message);
        } else if (err instanceof DuplicatedError) {
            return new Errors.ConflictError(err.message);
        } else if(err instanceof Errors.ForbidenError) {
            return err;
        } else {
            return new Errors.InternalServerError(err.message);
        }
    }
}