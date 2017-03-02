import { Errors } from "typescript-rest";
import * as Joi from "joi";
import * as _ from "lodash";

export class ValidationError extends Errors.ForbidenError {
	entity: any;

	constructor(entity?: string | Joi.ValidationError) {
		let message 
        if (entity instanceof String || typeof(entity) == 'string') {
			message = <string> entity;
		}
		else {
            message = ValidationError.buildValidationErrorString(entity);
		}
        super(message);
		this.entity = {erro : message};
		Object["setPrototypeOf"](this, ValidationError.prototype);
	}

    private static buildValidationErrorString(err: Joi.ValidationError) {
        let requiredFields = []
        let unexpectedFields = []
        let invalidFields = []
        err.details.forEach(err => {
            if (_.endsWith(err.type, 'required')) {
                requiredFields.push(err.path);
            }
            else if (_.endsWith(err.type, 'Unknown')) {
                unexpectedFields.push(err.path);
            }
            else {
                invalidFields.push(err.path);
            }
        })

        let result = [];
        if (requiredFields.length > 0) {
            result.push(`Missing Required Fields: ${requiredFields.join(', ')}`);
        }
        if (unexpectedFields.length > 0) {
            result.push(`Unexpected Fields: ${unexpectedFields.join(', ')}`);
        }
        if (invalidFields.length > 0) {
            result.push(`Invalid value for Fields: ${invalidFields.join(', ')}`);
        }
        return result.join('\n');
    }    
}

export class UnauthorizedError extends Errors.UnauthorizedError {
    constructor(message?: string) {
        super(message);

		Object["setPrototypeOf"](this, UnauthorizedError.prototype);
    }
}

export class NotFoundError extends Errors.NotFoundError {
    constructor(message?: string) {
        super(message);

		Object["setPrototypeOf"](this, NotFoundError.prototype);
    }
}
