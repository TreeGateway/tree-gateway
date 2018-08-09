[![npm version](https://badge.fury.io/js/tree-gateway.svg)](https://badge.fury.io/js/tree-gateway)
[![Build Status](https://travis-ci.org/TreeGateway/tree-gateway.svg?branch=master)](https://travis-ci.org/TreeGateway/tree-gateway)
[![Coverage Status](https://coveralls.io/repos/github/TreeGateway/tree-gateway/badge.svg?branch=master)](https://coveralls.io/github/TreeGateway/tree-gateway?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/TreeGateway/tree-gateway/badge.svg?targetFile=package.json)](https://snyk.io/test/github/TreeGateway/tree-gateway?targetFile=package.json)

<p align="center">
<a href="http://treegateway.org"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAAwjAAAAJGFlNWE2MDI1LTM0OGItNDc2NC1hYmU5LTM2NmNkMDlmZjkxNQ.png"/></a>
</p>
<p align="center">
A full featured and free API Gateway in Node JS
</p>

## Why do I need an API Gateway?

An API gateway provides a single, unified entry point across one or more internal APIs. It is an important element in any microservice architecture.

<p align="center">
  <img src="https://raw.githubusercontent.com/TreeGateway/tree-gateway/gh-pages/img/presentation.png" />
</p>

## Why Tree Gateway?

Tree Gateway is a free and open source solution writen in Node JS that has a complete and customizable pipeline to handle your requests.
It provides:
  - **Authentication**: More than 480 strategies available through an easy [passportjs](http://passportjs.org/) integration, including support to JWT tokens, Oauth, Basic and many others.
  - A flexible and robust **Routing system** that allows any kind of customized request pipeline.
  - **Rate limits** - To control quotas for your customers and to define actions to be taken when any quota is exceeded.
  - **Caching system** - Allow you to easily inject and control caching behavior for your APIs. Tree Gateway provides two kinds of cache:
    - At browser level - Intercepting the responses and controling how the HTTP cache headers are used.
    - At a server level - Caching responses for your APIs in memory (using the redis database).
  - Easy **Service Discovery**, using your preffered registry.
  - **Integrated CircuitBreaker** - A fast [circuitbreaker](https://martinfowler.com/bliki/CircuitBreaker.html) to fast fail your responses when your API is having problems to work. It support custom handlers for events like "open" or "close" circuit.
  - Real Time **Monitoring and Analytics** - 
    - Collect statistics about any access to your APIs. Capture any event, like a cache hit on a cache entrance, a circuitbreaker open circuit or an authentication attempt.
    - A very flexible and powerfull log system, that can be integrated with any service like logstash, timescale, loggly or new relic.
  - **Easy Administration** - The gateway can be configured remotelly. And no restart is needed. Any API configuration can be "hot" changed and all configurations are propagated to other tree-gateway cluster nodes with no pain. The gateway can be configured through:
    - Admin API - A REST API that can be invoked through HTTP;
    - SDK - A Node JS SDK that can be used to configure the Gateway (or a cluster of gateways) programmatically;
    - CLI - A command line tool can be used to configure using shell commands or scripts.
  - Focused on **Performance** and **High Availability** - Turn easy the creation of big clusters.
    - Support clusters of redis to share configurations, circuitbreaker states, cached content and so on.
    - Automatically propagate events to all cluster nodes.
    - Auto discovery for cluster nodes.
    - Very low resources footprint.
  - Everything can be extended or customized **using only Javascript**. All plugins can be written in pure Javascript.
  
## Watch the Quickstart video

<a href="https://www.youtube.com/watch?v=FkAeEmt2wro"><img src="https://img.youtube.com/vi/FkAeEmt2wro/1.jpg"/></a>


## Quick Start

Install the gateway:

```sh
npm install -g tree-gateway
```

Run it:

```sh
treeGateway
```

Then map your first API. Just create an YML file (my-api.yaml):

```yaml
---
name: Test
version: 1.0.0
path: "/test"
proxy:
  target:
    host: http://httpbin.org
  timeout: five seconds
```

And use the Tree Gateway CLI to configure it into the gateway:

```sh
treeGatewayConfig apis --add ./my-api.yaml
```

And its done. You can test it accessing in your browser: `http://localhost:8000/test/get`


## Gateway Configuration Reference

Check the [Docs](https://github.com/TreeGateway/tree-gateway/wiki).


## Migrating from previous versions

Check our [migration guide](https://github.com/TreeGateway/tree-gateway/wiki/migrationGuide).
