---
title: "When retries become the outage"
kind: note
mode: dive
date: 2026-06-20
hook: "One slow shard did not take us down. Our retries did."
tags: [reliability, distributed-systems]
order: 10
draft: false
featured: true
---

It did not start as an outage. It started as one Aerospike shard getting slow on a hot key.

Workers read the key. The shard times out. Every client is set to retry on timeout, which sounds fine in isolation. They all time out on roughly the same interval, so they all retry at roughly the same moment. The extra load makes the shard slower. More timeouts. Another wave of retries. The system was inventing its own traffic faster than it could shed it.

A local slowdown became a stampede. We were the herd.

## Two moves that worked

**Stop the bleeding first.** Skip the known bad keys so workers stop hammering the one shard that cannot answer. That buys room without a panicky full deploy in the middle of the page.

**Then fix the structure.** Exponential backoff with jitter. Backoff gives the shard air. Jitter is the part people skip. Without it, retries stay synchronized and land as a spike again.

## What I still believe

A retry is not free safety. It is load. A retry policy without jitter does not make you resilient. It makes failures correlated. That is how a small timeout becomes a large outage.

Idempotency, bounded retries, backoff, jitter, and a circuit breaker are not polish for later. They are the difference between a blip and a page.
