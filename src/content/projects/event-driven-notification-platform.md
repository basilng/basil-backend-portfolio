---
title: "Event-driven Notification Platform"
summary: "A resilient notification pipeline that consumes domain events, applies user preferences, renders templates and delivers email or messaging notifications with retry, deduplication and dead-letter handling."
status: "planned"
featured: true
order: 3
technologies:
  - "Java 25"
  - "Spring Boot"
  - "Kafka"
  - "PostgreSQL"
  - "Redis"
  - "OpenTelemetry"
  - "Kubernetes"
problem: "Notification delivery is inherently unreliable and bursty, while upstream services should not block on email or messaging providers and duplicate events must not produce repeated user messages."
responsibilities:
  - "Design event contracts and consumer groups."
  - "Model delivery attempts, templates and user preferences."
  - "Define retry, deduplication and dead-letter policies."
  - "Plan throughput controls and provider failover."
architectureHighlights:
  - "Kafka-based ingestion decoupled from provider delivery."
  - "Persistent delivery state and idempotent event consumption."
  - "Provider adapters behind a stable internal interface."
  - "Partitioning by recipient or aggregate when ordering is required."
productionConcerns:
  - "Traffic bursts after large domain events."
  - "Poison messages and permanently invalid addresses."
  - "Provider rate limits and temporary outages."
  - "Template compatibility and localisation."
securityControls:
  - "Minimal personally identifiable data in events."
  - "Encrypted provider credentials and restricted template administration."
  - "Output encoding to prevent template injection."
  - "Unsubscribe and preference enforcement before delivery."
observability:
  - "Consumer lag, retry volume and dead-letter depth."
  - "Delivery latency and outcome by provider and template."
  - "Trace correlation from source event to delivery attempt."
  - "Alerts for backlog growth and provider throttling."
tradeOffs:
  - "At-least-once delivery is operationally practical but requires end-to-end idempotency."
  - "Per-recipient ordering can constrain partition scalability and should be used only where required."
  - "Provider abstraction improves portability while hiding some provider-specific optimisation features."
publishedAt: 2026-07-10
updatedAt: 2026-07-29
---

## Delivery pipeline

```text
Domain event
  -> Kafka topic
      -> Notification consumer
          -> preference check
          -> template rendering
          -> delivery record
          -> provider adapter
              -> delivered / retry / dead letter
```

The upstream business service publishes a domain event and completes without waiting for an external notification provider.

## Retry policy

Only transient failures are retried. Retries use exponential backoff with jitter and a bounded attempt count. Invalid recipients, rejected templates and other permanent failures are not retried indefinitely.

## Deduplication

The event identifier and notification type form a unique delivery key. A repeated Kafka event therefore resolves to the existing delivery record instead of creating a second notification.

## Backpressure

Consumer concurrency and provider-specific rate limiters prevent a burst from overwhelming the outbound provider. Kafka lag is treated as an operational signal and is included in alerting and capacity planning.
