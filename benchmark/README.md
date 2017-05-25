# Benchmarking ```tree-gateway```

The long-term goal of these scripts and documentation is to provide a consistent and well understood benchmarking process for ```tree-gateway``` so that performance does not degrade over time. 

## Pre-requisites

All benchmarking shall be done with [loadtest](https://www.npmjs.com/package/loadtest)

 **Make sure you have `loadtest` installed before continuing**.

## Benchmarks

1. [Simple HTTP benchmark](#simple-http)

### Simple HTTP

_This benchmark requires three terminals running:_

1. **A gateway server:** `node dist/app.js`
2. **A target API:** `node benchmark/scripts/hello.js`
3. **A wrk process:** `loadtest -c 20 -n 5000 -k http://localhost:8000/benchmark/hello

