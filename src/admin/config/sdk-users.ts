'use strict';

import { UserData } from '../../config/users';

export interface Users {
    list(filters: any): Promise<Array<UserData>>;
    addUser(user: UserData): Promise<string>;
    updateUser(login: string, user: UserData): Promise<void>;
    removeUser(login: string): Promise<void>;
    getUser(login: string): Promise<UserData>;
    changeUserPassword(login: string, password: string): Promise<void>;
}

export class UsersClient implements Users {
    private swaggerClient: any;

    constructor(swaggerClient: any) {
        this.swaggerClient = swaggerClient;
    }

    list(filters: any): Promise<Array<UserData>> {
        return new Promise<Array<UserData>>((resolve, reject) => {
            this.swaggerClient.apis.Users.UsersRestList(filters)
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    addUser(user: UserData): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.swaggerClient.apis.Users.UsersRestAddUser({ user })
                .then((response: any) => {
                    if (response.status === 201) {
                        return resolve(response.headers['location'].substring(6));
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    updateUser(login: string, user: UserData): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            user.login = login;
            this.swaggerClient.apis.Users.UsersRestUpdateUser({ login, user })
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeUser(login: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Users.UsersRestRemoveUser({ login })
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getUser(login: string): Promise<UserData> {
        return new Promise<UserData>((resolve, reject) => {
            this.swaggerClient.apis.Users.UsersRestGetUser({ login })
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    changeUserPassword(login: string, password: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Users.UsersRestChangePassword({ login, password })
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }
}
