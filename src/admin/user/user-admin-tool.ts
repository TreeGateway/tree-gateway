'use strict';

import { UserService } from '../../service/users';
import { UserData, validateUser } from '../../config/users';
import { AutoWired, Inject } from 'typescript-ioc';
import { Database } from '../../database';

@AutoWired
export class UserAdmin {
    @Inject private database: Database;
    @Inject private userService: UserService;

    private args: any;
    constructor(userAdminArgs: any) {
        this.args = userAdminArgs;
    }

    processCommand() {
        this.doCommand()
            .then(() => {
                console.info(`Command ${this.args.command} completed.`);
                this.closeDB();
            }).catch(err => {
                console.error(`${err}`);
                process.exit(1);
            });
    }

    private doCommand(): Promise<void> {
        switch (this.args.command) {
            case 'add':
                return this.addUser();
            case 'remove':
                return this.removeUser();
            case 'list':
                return this.listUsers();
            case 'password':
                return this.changePassword();
            default:
                return new Promise<void>((resolve, reject) => reject(`Command not found: ${this.args.command}`));
        }
    }

    private addUser(): Promise<void> {
        const self = this;
        return new Promise<void>((resolve, reject) => {
            const user: UserData = {
                email: this.args.email,
                login: this.args.user,
                name: this.args.name,
                password: this.args.pass,
                roles: ['tree-gateway-config', 'tree-gateway-admin']
            };

            validateUser(user)
                .then((validUser: UserData) => self.userService.create(validUser))
                .then(() => resolve())
                .catch(reject);
        });
    }

    private changePassword(): Promise<void> {
        return this.userService.changePassword(this.args.user, this.args.pass);
    }

    private removeUser(): Promise<void> {
        return this.userService.remove(this.args.user);
    }

    private listUsers(): Promise<void> {
        const self = this;
        return new Promise<void>((resolve, reject) => {
            self.userService.list()
                .then(users => {
                    if (users) {
                        users.forEach((user, index) => console.info(`${index + 1})\t${user.login} - ${user.name}`));
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
