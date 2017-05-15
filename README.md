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

## Why do I need an API Gateway?

// TODO

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

For more about redis clusters, read [cluster-tutorial](https://redis.io/topics/cluster-tutorial)

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

// TODO

We are accepting Pull Requests!
