# Upstash Redis runtime

The application shares one authenticated TLS connection per Node.js process. Concurrent cold requests wait for the same connection to become ready. Configure `UPSTASH_REDIS_URL` with a `rediss://` URL; credentials are never logged.

Connection attempts have a 2-second timeout with at most two reconnect retries. Individual commands have a 5-second timeout through node-redis `commandOptions`. There is no socket inactivity timeout, so an idle healthy connection is not closed every five seconds. Offline commands are rejected and the command queue is capped at 100.

Initial connection readiness, including authentication, has a separate 10-second deadline that destroys a stalled socket. Requests encountering a reconnecting client without a shared initial connection attempt fail fast into cooldown.

All application commands use `executeRedisCommand`. A failed command discards its connection and opens a 30-second cooldown. A delayed failure or connection completion from a discarded client cannot disable a newer client or clear its pending connection. Error listeners remain attached to discarded sockets to handle late events safely. Logs use bounded categories and omit command arguments, Redis URLs and credentials.

Rate limiting falls back to a bounded in-process counter when Redis is unavailable. Subscriber mutations and preference-email persistence instead fail closed because their correctness requires shared coordination. Redis command timeouts do not prove a write was rejected: timed-out writes are not automatically replayed. Subscriber leases expire naturally when their release cannot be confirmed.

`npm run test:unit` includes isolated connection lifecycle and concurrency tests. These tests use simulated clients and do not connect to the production database.
