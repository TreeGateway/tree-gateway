[![npm version](https://badge.fury.io/js/tree-gateway.svg)](https://badge.fury.io/js/tree-gateway)
[![Build Status](https://travis-ci.org/Leanty/tree-gateway.svg?branch=master)](https://travis-ci.org/Leanty/tree-gateway)
[![Coverage Status](https://coveralls.io/repos/github/Leanty/tree-gateway/badge.svg?branch=master)](https://coveralls.io/github/Leanty/tree-gateway?branch=master)


# tree-gateway
This is a full featured and free API Gateway in node JS

**Table of Contents** 

- [Tree Gateway](#)
  - [Why do I need an API Gateway?](#why-do-i-need-an-api-gateway)
  - [Why Tree Gateway?](#why-tree-gateway)
  - [Installation](#installation)
  - [Configuration](#configuration)
    - [Database](#database)
    - [Environments](#environments)
    - [Gateway](#gateway)
  - [Usage](#usage)
    - [Create an Admin User](#create-an-admin-user)
    - [Admin Rest API](#admin-rest-api)
    - [CLI Interface](#cli-interface)
    - [Node SDK](#node-sdk)

## Why do I need an API Gateway?

An API gateway provides a single, unified API entry point across one or more internal APIs. It is an important element in any microservice architecture.


## Why Tree Gateway?

Tree Gateway is a free and open source solution writen in Node JS that has a complete and customizable pipeline to handle your requests.
It provides:
  - **Authentication**: More than 300 strategies available through an easy [passportjs](http://passportjs.org/) integration, including support to JWT tokens, Oauth, Basic and many others. Custom strategies can also be writen directly in Javascript.
  - A flexible and robust **Routing system**: Our proxy system allows you to create 
    - multiple versions of APIs.
    - request filters - That allow you to filter which request should be processed.
    - request or response interceptors - That allow transformations on requests to be sent to your APIs or responses received from them. All of those interceptors can be written as common javascript modules.
  - **Rate limits** - To control quotas for your customers and to define actions to be taken when any quota is exceeded (And again, all customizations can be written as simple javascript functions).
  - **Caching system** - Allow you to easily inject and control caching behaviour for your APIs. Tree Gateway provides two kinds of cache:
    - At browser level - Intercepting the responses and controling how the HTTP cache headers are used.
    - At a server level - Caching responses for your APIs in memory (using the redis database).
  - **Integrated CircuitBreaker** - A fast [circuitbreaker](https://martinfowler.com/bliki/CircuitBreaker.html) to fast fail your responses when your API is having problems to work. It support custom handlers for events like "open" or close circuit.
  - Real Time **Monitoring and Analytics** - 
    - Collect statistics about any access to your APIs. Capture any event, like a cache hit on a cache entrance, a circuitbreaker open circuit or an authentication attempt.
    - Use an existing monitor (or define your own monitor) to capture periodic information about the server or about your APIs. Ex: CPU monitor, MEM Monitor etc.
    - A very flexible and powerfull log system, that can be integrated with any service like logstash, loggly or new relic.
  - **Easy Administration** - The gateway can be configured remotelly. And no restart is needed. Any API configuration can be "hot" changed and all configurations are propagated to other tree-gateway cluster nodes with no pain. The gateway can be configured through:
    - Admin API - A REST API that can be invoked through HTTP;
    - SDK - A Node JS SDK that can be used to configure the Gateway (or a cluster of gateways) through programmatically;
    - CLI - A command line tool can be used to configure through shell commands or scripts.
  - Focused on **Performance** and **High Availability** - Turn easy the creating of big clusters.
    - Support clusters of redis to share configurations, circuitbreaker states, cached content etc.
    - Automatically propagate events to all cluster nodes.
    - Auto discovery for cluster nodes.
    - Very low resources footprint.

## Installation

Via NPM:

```bash
$ npm install tree-gateway -g
```

Via Docker:

```sh
$ docker run --name tree-gateway -p 8000:8000 -d tree-gateway
```

Tree Gateway needs a [redis](https://redis.io/) database to store its configuration and temporary data. Install it first, or use docker to quickly put a redis instance running:

```sh
$ docker run -p 6379:6379 -d --name redis redis:3.0.7-alpine
```

And you can link the tree-gateway container to the redis, running the gateway container as:

```sh
$ docker run --name tree-gateway -p 8000:8000 --link redis:redis -d tree-gateway
```

## Configuration

By default, Tree gateway reads a file called tree-gateway.json when it is started. That file contains: 

  - database: Configurations for gateway database (REDIS).;
  - middlewarePath (optional): Folder where the gateway will store the installed middleware functions.
  - rootPath(optional): The work directory for the gateway. The base folder for logs records and other things;
  - gateway: A JSON object contaning the gateway configurations. These configurations are read from redis database, but the JSON object configured here is used as default for any option that is not stored into the database.

  You can also specify the config file to be used when starting the gateway:

  ```sh
  $ treeGateway -c ./myConfigFile.json
  ```

### Database

The only required property is the database. You need to inform the gateway how to access redis. You can configure a standalone redis or a cluster of redis here. Some examples:

```json
{
    "rootPath": ".",
    "database": {
        "standalone": {
            "host": "localhost",
            "port": 6379
        }
    }
}
```

Or a cluster:

```json
{
    "database": {
        "cluster": [
          {
            "host": "localhost",
            "port": 6379
          }
        ]
    }
}
```

In a cluster configuration, you can inform any number of start nodes. The gateway will find these start nodes to discover the rest of the cluster nodes.


You can also use redis sentinels:

```json
{
    "database": {
        "sentinel": {
            "name": "redis1",
            "nodes": [
              {
                "host": "localhost",
                "port": 6379
              }
            ]
        }
    }
}
```

For more about redis clusters, read [cluster](https://redis.io/topics/cluster-tutorial) and [sentinel](https://redis.io/topics/sentinel)

You can also inform aditional options for redis connection or use environment variables to configure the databse, like:

```json
{
    "rootPath": ".",
    "database": {
        "standalone": {
            "host": "{REDIS_PORT_6379_TCP_ADDR}",
            "port": "{REDIS_PORT_6379_TCP_PORT}"
        }, 
        "options": {
            "db": 1
        }
    }
}
```

### Environments

If you want to use different configurations for your environments, you can create additional configuration files with the sufix naming an environment, like:

 - tree-gateway.json (the default configurations to be applied to all environments).
 - tree-gateway-test.json (overrides the default configuration with anything declared here if NODE_ENV = 'test').

The name of the environment config file, must match the name of the mais configuration file including the sufix.

For example, tree-gateway.json

```json
{
    "rootPath": ".",
    "database": {
        "standalone": {
            "host": "localhost",
            "port": 6379
        }
    }
}
```

And a tree-gateway-test.json:
```json
{
    "database": {
        "options": {
            "db": 1
        }
    }
}
```

The above setup will connect to database on host "localhost" and port "6379" for any environment, but will connect to database "1" if the NODE_ENV=test variable is set.

### Gateway

This sections configures some important properties to be applied to the gateway server. You can configure the following properties:

  - protocol - The gateway protocol configuration.
  - underProxy(optional) - If we are behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc).
  - logger(optional) - Configurations for gateway logger.
  - accessLogger(optional) - Configurations for gateway access logger.
  - statsConfig(optional) - Defaut configurations for gateway stats collector.
  - monitor(optional) - A list of monitors to be started with the gateway
  - admin(optional) - If provided, configure the admin API for the gateway

Example configuration:

```json
{
    "rootPath": ".",
    "database": {
        "standalone": {
            "host": "{REDIS_PORT_6379_TCP_ADDR}",
            "port": "{REDIS_PORT_6379_TCP_PORT}"
        }
    },
    "gateway": {
        "underProxy": false,
        "protocol": {
            "http": {
                "listenPort": 8000
            }
        },
        "admin": {
            "protocol": {
                "http": {
                    "listenPort": 8001
                }
            },
            "accessLogger": {
                "msg": "HTTP {{req.method}} - {{res.statusCode}} - {{req.url}} ({{res.responseTime}}ms) ",
                "console": {
                    "timestamp": true,
                    "colorize": true
                },
                "file": {
                    "timestamp": true,
                    "json": false,
                    "prettyPrint": true,
                    "outputDir": "./logs"
                }
            },
            "userService": {
                "jwtSecret": "secret"
            },
            "apiDocs": "api-docs",
            "cors" : {
                "origin": {
                    "allow": [{
                        "value": "*"
                    }]
                }
            }
        },
        "logger": {
            "level": "debug",
            "console": {
                "colorize": true
            },
            "file": {
                "timestamp": true,
                "outputDir": "./logs",
                "json": false, 
                "prettyPrint": true 
            }
        },
        "accessLogger": {
            "msg": "HTTP {{req.method}} - {{res.statusCode}} - {{req.url}} ({{res.responseTime}}ms) ",
            "console": {
                "timestamp": true,
                "colorize": true
            },
            "file": {
                "timestamp": true,
                "json": false,
                "prettyPrint": true,
                "outputDir": "./logs"
            }
        },
        "statsConfig": {
            "granularity": {
                "duration": "1 hour",
                "ttl": "2 days"
            }
        }, 
        "monitor": [
            {
                "name": "cpu",
                "statsConfig": {
                    "granularity": {
                        "duration": "1 minute",
                        "ttl": "2 days"
                    }
                }            
            }, 
            {
                "name": "mem",
                "statsConfig": {
                    "granularity": {
                        "duration": "1 minute",
                        "ttl": "2 days"
                    }
                }            
            }
        ]
    } 
}
```

To see all gateway configuration options, consult the configuration interfaces [here](https://github.com/Leanty/tree-gateway/tree/master/src/config).

All configurations for the gateway provided here in the tree-gateway.json file can be overriden by configurations stored into the database. So it acts like a default configuration for the gateway.

You can configure the gateway using the database through the Admin Rest API, through the SDK or through the CLI program.

# Usage

To start using tree-gateway, run:

```sh
$ treeGateway
```

It will start the server in a cluster mode, using one process for each available CPU on the current machine.

## Create an Admin User

Before you create any API configuration or install any middleware into the gateway, you need to create one first user to you into the gateway.

It can be done via a command line tool called 'userAdmin':

Just run something like this in your terminal:

```sh
$ userAdmin add -u <userName> -p <password> -n <User Name> -e <User email>
```

The gateway will use the redis database to propagate the user configuration to other nodes of the cluster, so you just need to create this first user once.

## Admin Rest API

If you configured an admin service on your tree-gateway.json file (like shown in the previous section), you can now access the Admin API documentation:

```
http://localhost:8001/api-docs
```

You can also access the API swagger file through: 
```
http://localhost:8001/api-docs/json
or
http://localhost:8001/api-docs/yaml
```

You can use the swagger-ui interface (opened by http://localhost:8001/api-docs) to test the gateway Admin API.

Note that you need to provide an access token to all methods on the Admin API. To obtain this token, you must authenticate with the user you created in the previous step, by calling the endpoint:

```
http://localhost:8001/users/authentication
```

Note that you can authenticate through the swagger-ui interface.


## CLI Interface

Another way to configure the gateway, install middleware and route APIs is through the ```treeGatewayConfi``` command line tool.

Ex: Configuring gateway object via cli:

```sh
$ treeGatewayConfig gateway -u <userName> -p <password> -s http://localhost:8001/api-docs/json --update ./myGateway.config.json
```

To see all supported command, execute:

```sh
$ treeGatewayConfig -h
```

Nte that for all commands available, you always need to provide:
  - -u (or --username): your admin username
  - -p (or --password): your admin user's password
  - -s (or --swagger): The address of the swagger file on the target tree-gateway instance you want to configure.

Note that once you configure one instance of the tree-gateway cluster, it propagates all changes for the other nodes on the same cluster (through redis pub / sub).


## Node SDK

You can use the node js sdk to configure the gateway:

```typescript
const fs = require('fs-extra')
const SDK = require('tree-gateway/admin/config/sdk')
const swaggerUrl = "http://localhost:8001/api-docs/json";

SDK.initialize(swaggerUrl, 'username', 'password'))
  .then(sdk => {
        const pathApi = './test/data/apis/';
        
        // read all apis config files from a test folder and install it 
        fs.readdirAsync(pathApi)
            .then((files) => { 
                const promises = files.map(file => fs.readJsonAsync(pathApi+file));
                return Promise.all(promises);
            })
            .then((apis: any[]) => {
                const promises = apis.map(apiConfig => sdk.apis.addApi(apiConfig));
                return Promise.all(promises);
            })
            .then((apis) => {
                console.log('All APIs found on folder '+pathApi+' installed.');
            })
            .catch(reject);
  })
  .catch(error => {
      console.error('Error initializing Tree Gateway SDK': error.message);
  });
```

The Node SDK also include typescript definitions (*.d.ts files) for Typescript users.

# Contribute

We are accepting Pull Requests!
If you want to contribute, feel free to clone the repository and send us a PR. 
