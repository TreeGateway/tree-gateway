"use strict";

import "es6-promise";

import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return, Accept} from "typescript-rest";

import {Group, validateGroup} from "../../config/group";

import {RedisGroupService} from "../../service/redis";

import {RestController} from "./admin-util";

@Path('apis/:apiName/:apiVersion/groups')
export class GroupRest extends RestController {

    @GET
    list(@PathParam("apiName") apiName: string, @PathParam("apiVersion") apiVersion: string): Promise<Array<Group>>{
        return this.service.list(apiName, apiVersion);
    }

    @POST
    addGroup(@PathParam("apiName") apiName: string, @PathParam("apiVersion") apiVersion: string, group: Group): Promise<string> {
        return new Promise((resolve, reject) => {
            validateGroup(group)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiName, apiVersion, group))
                .then(cacheId => resolve(new Return.NewResource(`apis/${apiName}/${apiVersion}/groups/${group.name}`)))
                .catch(reject);
        });
    }

    @PUT
    @Path("/:groupName")
    updateGroup(@PathParam("apiName") apiName: string,
              @PathParam("apiVersion") apiVersion: string,
              @PathParam("groupName") groupName: string,
              group: Group): Promise<string> {
        return new Promise((resolve, reject) => {
            validateGroup(group)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiName, apiVersion, groupName, group))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    @Path("/:groupName")
    deleteGroup(@PathParam("apiName") apiName: string,
                @PathParam("apiVersion") apiVersion: string,
                @PathParam("groupName") groupName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(apiName, apiVersion, groupName)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @GET
    @Path("/:groupName")
    getGroup(@PathParam("apiName") apiName: string,
             @PathParam("apiVersion") apiVersion: string,
             @PathParam("groupName") groupName: string) : Promise<Group>{
        return new Promise((resolve, reject) => {
            this.service.get(apiName, apiVersion, groupName)
                .then(resolve)
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get serviceClass() {
        return RedisGroupService;
    }
}