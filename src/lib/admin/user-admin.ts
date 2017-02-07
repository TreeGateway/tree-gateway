"use strict";

import {UserAdminArgs} from "./user-admin-args";
import {UserService} from "../service/users";
import {Configuration} from "../configuration";
import * as redis from "ioredis";
import * as dbConfig from "../redis";
import {UserData, validateUser} from "../config/users";
import {Logger} from "../logger";
import {AutoWired, Inject} from "typescript-ioc";
import {Database} from "../database";


class UserAdmin {
    @Inject private database : Database;
    @Inject private userService: UserService;
    @Inject private config: Configuration;

    processCommand() {
        this.doCommand()
        .then(() => {
            console.log(`Command ${UserAdminArgs.command} completed.`);
            this.closeDB();
        }).catch(err => {
            console.error(`${err}`);
            process.exit(1);
        })
    }

    private doCommand(): Promise<void> {
        switch (UserAdminArgs.command) {
            case 'add': 
                return this.addUser();
            case 'remove': 
                return this.removeUser();
            case 'list': 
                return this.listUsers();
            case 'password': 
                return this.changePassword();
            default:

        }
    }

    private addUser() : Promise<void>{
        let self = this;
        return new Promise<void>((resolve, reject) => {
            const user: UserData = {
                name: UserAdminArgs.name,
                login: UserAdminArgs.user,
                password: UserAdminArgs.pass,
                email: UserAdminArgs.email,
                roles: ["tree-gateway-config", "tree-gateway-admin"]
            };

            validateUser(user)
                .then((validUser: UserData) => self.userService.create(validUser))
                .then(() => resolve())
                .catch(reject);
        });
    }

    private changePassword() : Promise<void>{
        return this.userService.changePassword(UserAdminArgs.user, UserAdminArgs.pass);
    }

    private removeUser() : Promise<void>{
        return this.userService.remove(UserAdminArgs.user);
    }

    private listUsers() : Promise<void>{
        let self = this;
        return new Promise<void>((resolve, reject) => {
            self.userService.list()
            .then(users=>{
                if (users) {
                   users.forEach((user, index) => console.log(`${index+1})\t${user.login} - ${user.name}`));
                }
                resolve();
            })
            .catch(reject);
        });
    }

    private closeDB() {
        if (this.database.redisClient) {
            this.database.disconnect();
        }
    }
}

new UserAdmin().processCommand();
