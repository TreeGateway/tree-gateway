"use strict";

import {UserAdminArgs} from "./user-admin-args";
import {UserService, loadUserService} from "../service/users";
import loadConfigFile from "../utils/config-loader";
import * as redis from "ioredis";
import * as dbConfig from "../redis";
import {UserData, validateUser} from "../config/users";


class UserAdmin {
    private redisClient : redis.Redis;
    private userService: UserService;

    processCommand() {
        loadConfigFile(UserAdminArgs.config)
        .then((gatewayConfig) => {
            this.redisClient = dbConfig.initializeRedis(gatewayConfig.database);
            if (!gatewayConfig.admin) {
                throw new Error("Admin is not configurated on gateway config file.")
            }
            this.userService = loadUserService(this.redisClient, gatewayConfig.admin.users);
            return this.doCommand();
        }).then(() => {
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

            validateUser(user).then((validUser: UserData) =>
                self.userService.create(validUser)
            )
            .then(resolve)
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
        if (this.redisClient) {
            this.redisClient.disconnect();
            this.redisClient = null;
        }
    }
}

new UserAdmin().processCommand();
