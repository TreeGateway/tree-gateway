'use strict';

import { Proxy } from '../config/proxy';
import * as path from 'path';
import { ApiConfig } from '../config/api';
import * as Groups from '../group';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { Configuration } from '../configuration';
import {createFunction} from '../utils/functions';

const pathToRegexp = require('path-to-regexp');

@AutoWired
export class ProxyFilter {
    @Inject
    private config: Configuration;
    @Inject
    private logger: Logger;

    buildFilters(api: ApiConfig) {
        const filterChain = new Array<Function>();
        if (api.proxy.target.allow) {
            filterChain.push(this.buildAllowFilter(api));
        }
        if (api.proxy.target.deny) {
            filterChain.push(this.buildDenyFilter(api));
        }
        if (this.hasCustomFilter(api.proxy)) {
            filterChain.push(this.buildCustomFilter(api));
        }
        return filterChain;
    }

    private buildCustomFilter(api: ApiConfig) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Configuring custom filters for Proxy target [${api.path}]. Filters [${JSON.stringify(api.proxy.filter)}]`);
        }
        const body = new Array<string>();
        body.push(`var accepted = true;`);
        body.push(`accepted = (`);
        const proxy = api.proxy;
        proxy.filter.forEach((filter, index) => {
            if (index > 0) {
                body.push(`&&`);
            }
            body.push(`(`);
            if (filter.group) {
                body.push(`!(`);
                body.push(Groups.buildGroupAllowTest('req', api.group, filter.group));
                body.push(`) ? accepted :`);
            }
            const p = path.join(this.config.middlewarePath, 'filter', filter.name);
            body.push(`require('${p}')(req, res)`);
            body.push(`)`);
        });
        body.push(`);`);
        body.push(`return accepted;`);

        return createFunction({pathToRegexp: pathToRegexp}, 'req', 'res', body.join(''));
    }

    private buildAllowFilter(api: ApiConfig) {
        if (this.logger.isDebugEnabled()) {
            const groups = Groups.filter(api.group, api.proxy.target.allow);
            this.logger.debug(`Configuring allow filter for Proxy target [${api.path}]. Groups [${JSON.stringify(groups)}]`);
        }

        return Groups.buildGroupAllowFilter(api.group, api.proxy.target.allow);
    }

    private buildDenyFilter(api: ApiConfig) {
        if (this.logger.isDebugEnabled()) {
            const groups = Groups.filter(api.group, api.proxy.target.deny);
            this.logger.debug(`Configuring deny filter for Proxy target [${api.path}]. Groups [${JSON.stringify(groups)}]`);
        }
        return Groups.buildGroupDenyFilter(api.group, api.proxy.target.deny);
    }

    private hasCustomFilter(proxy: Proxy) {
        return (proxy.filter && proxy.filter.length > 0);
    }
}
