"use strict";

import {Path, GET} from "typescript-rest";
import {AutoWired, Inject} from "typescript-ioc";
import "es6-promise";
import {Gateway} from "../gateway";

@Path('apis')
@AutoWired
export class APIService {
    @Inject 
    private gateway: Gateway;

    @GET
    search() : Promise<Array<string>>{
        return new Promise<Array<string>>((resolve, reject) =>{
            console.log('API service called ');
            resolve(["Teste 1"]);
        });
    }
}