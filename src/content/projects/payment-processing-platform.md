---
title: "Payment Processing and Reconciliation Platform"
summary: "A payment-domain reference service covering authorisation, capture, cancellation, refund, provider idempotency, webhook verification, audit history and reconciliation of ambiguous outcomes."
status: "active"
featured: true
order: 2
technologies:
  - "Java 25"
  - "Spring Boot"
  - "PostgreSQL"
  - "Kafka"
  - "Resilience4j"
  - "OAuth2"
  - "Testcontainers"
  - "OpenTelemetry"
problem: "Payment APIs must avoid duplicate financial effects while handling provider timeouts, webhook redelivery, concurrent operations and local-versus-provider state divergence."
responsibilities:
  - "Model payment and refund state machines."
  - "Define idempotent command handling and provider request keys."
  - "Design reconciliation and audit workflows."
  - "Implement secure webhook processing and operational metrics."
architectureHighlights:
  - "Separate authorise, capture, cancel and refund commands."
  - "Immutable payment-attempt and provider-reference history."
  - "Transactional outbox for payment-domain events."
  - "Scheduled reconciliation for unknown or inconsistent states."
productionConcerns:
  - "Provider success followed by a client timeout."
  - "Duplicate capture or refund requests."
  - "Out-of-order and repeated webhooks."
  - "Concurrent state transitions and double spending."
  - "Provider outage and delayed reconciliation."
securityControls:
  - "OAuth2 scopes for internal payment commands."
  - "Webhook HMAC/signature verification and replay-window validation."
  - "No storage of raw card credentials."
  - "Redacted logs and restricted audit access."
observability:
  - "Metrics by operation, provider, outcome and latency percentile."
  - "Alerts for unknown states, reconciliation backlog and provider error rate."
  - "Trace linkage between order, payment and provider requests."
  - "Audit events for every financial state transition."
tradeOffs:
  - "Strong idempotency adds storage and lifecycle management but is essential for safe client retries."
  - "Reconciliation provides eventual correctness but means some transactions remain temporarily unresolved."
  - "Pessimistic locking simplifies conflicting commands at the cost of database contention under hot-account workloads."
publishedAt: 2026-07-05
updatedAt: 2026-07-29
---

## State model

The payment aggregate uses explicit transitions rather than independent boolean flags:

```text
CREATED -> AUTHORISED -> CAPTURED
   |           |
   |           -> CANCELLED
   -> FAILED
CAPTURED -> PARTIALLY_REFUNDED -> REFUNDED
```

Every command validates both the current state and the requested amount before producing a provider operation.

## Idempotency

The service persists an idempotency record containing the caller, operation, key, request fingerprint and final response. Reusing a key with a different payload is rejected. Reusing it with the same payload returns the original result.

Provider calls also receive a stable provider idempotency key so that a retry after a network timeout cannot create a second financial effect.

## Ambiguous outcomes

When the local service times out, the transaction moves to an `UNKNOWN` operational state rather than `FAILED`. A provider status lookup or later webhook resolves the final state. A reconciliation worker periodically scans unresolved attempts and compares local records with provider data.

## Webhooks

Webhook processing verifies the signature before parsing business fields, checks timestamp tolerance, stores the provider event identifier and processes each event idempotently. The HTTP response is returned quickly; heavier processing is moved to a durable queue.

## Audit and compliance boundary

Sensitive payment credentials are tokenised and handled by the provider. Application logs contain payment identifiers and safe metadata only. Administrative access to audit history is separately authorised and monitored.
