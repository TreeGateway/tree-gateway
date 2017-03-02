# tree-gateway
A full featured and free API Gateway in node JS

It is a work in progress. 

## Implemented Features
 - API Proxy
   - Filters
     - Custom Filters
   - Interceptors
     - Request Interceptors
     - Response Interceptors
 - Throttling (Rate Limits)
   - Redis
 - Authentication
   - Passport integration
   - JWT
   - Basic
   - Local
   - Custom
 - Caching
   - Client Cache (via cache control)
   - Server Cache
     - Redis 
 - Circuit Breaker
   - Redis cluster can handle circuit state     
 - Monitoring and Analytics
   - Accesses / status codes
   - Authentication attempts / fails
   - quota exceeded
   - cache hits / misses / errors
   - CPU usage
   - Memory Usage
   - Circuitbreaker state changes
 - Admin API
   - Hot reloading of changes
   - Multi process notifications
 - Cluster support
   - Huge clusters of gateways
   - Clustered Redis
   - Monitoring for cluster nodes

## In progress Features
 - Alarms (when stats collected by gateway reaches some thresholds)
 - Service Discovery
 - Load Balancing
 - Authorization
 - Dockering

## Future work
  - Debug / Trace
  - Mocks
  - API composition
  - Virtual Paths
  - Protocol Transformations


We are accepting Pull Requests!
