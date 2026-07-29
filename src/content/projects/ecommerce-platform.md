---
title: "E-commerce Microservices Platform"
summary: "A production-oriented commerce backend demonstrating independently owned services, OAuth2 security, inventory reservations, payment workflows, reliable messaging and cloud-native operation."
status: "active"
featured: true
order: 1
technologies:
  - "Java 25"
  - "Spring Boot"
  - "Spring Cloud Gateway"
  - "PostgreSQL"
  - "MongoDB"
  - "Kafka"
  - "Redis"
  - "OAuth2/OIDC"
  - "Podman"
  - "Kubernetes"
problem: "Commerce workflows cross service and database boundaries, so ordinary local ACID transactions cannot guarantee that order, payment and inventory state remain consistent during partial failures."
responsibilities:
  - "Define service boundaries and API contracts."
  - "Design order, payment and inventory state transitions."
  - "Implement service-to-service authentication and authorisation."
  - "Establish resilience, testing and observability standards."
architectureHighlights:
  - "API gateway as the controlled external entry point."
  - "Database ownership per service with no cross-service table access."
  - "Synchronous APIs for immediate validation and asynchronous events for workflow progression."
  - "Transactional outbox planned for reliable event publication."
productionConcerns:
  - "Duplicate requests and event redelivery."
  - "Provider timeouts after successful remote processing."
  - "Inventory races and reservation expiry."
  - "Retry storms and cascading failure."
  - "Schema and API version compatibility."
securityControls:
  - "OAuth2/OIDC user authentication with JWT validation."
  - "Client-credentials authentication for service-to-service calls."
  - "Role and scope-based authorisation."
  - "Input validation, rate limiting and secret isolation."
observability:
  - "Structured logs with correlation and trace identifiers."
  - "Spring Boot Actuator health and readiness endpoints."
  - "Metrics for latency, errors, retries and circuit-breaker state."
  - "Distributed tracing across gateway and service boundaries."
tradeOffs:
  - "Service autonomy improves independent scaling but increases operational and consistency complexity."
  - "Asynchronous workflows reduce coupling but require idempotency, replay handling and eventual-consistency UX."
  - "Client-side service discovery is useful for the learning environment, while Kubernetes-native discovery would remove Eureka in a cluster deployment."
publishedAt: 2026-07-01
updatedAt: 2026-07-29
---

## System boundaries

The platform is decomposed around business ownership rather than technical layers:

```text
Client
  -> API Gateway
      -> Identity Service
      -> User Service
      -> Product Service
      -> Order Service
          -> Inventory Service
          -> Payment Service
          -> Kafka
              -> Notification Service
```

Each service owns its schema and exposes an explicit API or event contract. No service reads another service's database directly.

## Order workflow

A simplified order path is:

1. Authenticate the customer and validate the idempotency key.
2. Load a price snapshot and validate product state.
3. Create the order in a pending state.
4. Reserve inventory using deterministic product locking.
5. Authorise payment through the payment service.
6. Confirm the order and publish an event.
7. Consume the event in notification and downstream services.

Compensating actions release inventory and cancel payment authorisations when the workflow cannot complete.

## Failure model

The design assumes that every network call can produce four relevant outcomes: success, explicit failure, timeout with unknown remote outcome, or duplicate delivery. A timeout is therefore not treated as proof of failure. Provider lookups, idempotency records and reconciliation jobs are required to resolve ambiguous states.

## Data consistency

Local state transitions are protected by database transactions and optimistic or pessimistic concurrency where appropriate. Cross-service state converges through explicit workflow states and durable messages rather than distributed two-phase commit.

## Testing strategy

The testing pyramid includes domain unit tests, repository tests, Testcontainers-based integration tests, API contract tests and end-to-end workflow tests. Failure-path tests cover duplicate messages, timeouts, concurrent reservations and partially completed workflows.
