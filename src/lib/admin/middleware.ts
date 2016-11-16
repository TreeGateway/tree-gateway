"use strict";

import "es6-promise";
import * as fs from "fs-extra";
import * as path from "path";
import {AdminServer} from "./admin-server";

export class MiddlewareService { 
    static list(middleware: string) : Promise<Array<string>>{
        return new Promise<Array<string>>((resolve, reject) =>{
            fs.readdir(path.join(AdminServer.gateway.middlewarePath, middleware), (err, files) => {
                if (err) {
                    //TODO log err.
                    reject('Error reading installed middlewares.');
                }
                resolve(files);
            });
        });
    }

    static add(middlewareName: string, content: Buffer) : Promise<string>{
        return new Promise<string>((resolve, reject) =>{
            fs.writeFile(path.join(AdminServer.gateway.middlewarePath, middlewareName, '.js'), content, (err)=>{
                if (err) {
                    //TODO log err.
                    reject('Error saving middleware.');
                }
                resolve(middlewareName);
            })
        });
    }

    static save(middlewareName: string, content: Buffer) : Promise<void>{
        return new Promise<void>((resolve, reject) =>{
            fs.writeFile(path.join(AdminServer.gateway.middlewarePath, middlewareName, '.js'), content, (err)=>{
                if (err) {
                    //TODO log err.
                    reject('Error saving middleware.');
                }
                resolve();
            })
        });
    }

    static remove(folder: string, middlewareName: string) : Promise<void>{
        return new Promise<void>((resolve, reject) =>{
            fs.remove(path.join(AdminServer.gateway.middlewarePath, folder, middlewareName, '.js'), (err)=>{
                if (err) {
                    //TODO log err.
                    reject('Error removing middleware.');
                }
                resolve();
            })
        });
    }
}