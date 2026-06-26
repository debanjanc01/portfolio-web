---
# Drafted from the facts already shown in the homepage "retry storm · aerospike"
# figure. Verify the specifics against what actually happened and enrich with any
# real numbers (shard count, request rate, recovery time) before relying on it —
# then it's ready. Set draft:false to publish (it already builds and renders).
title: "When retries become the outage"
kind: note
date: 2026-06-20
hook: "A single slow shard didn't take the system down. Our retries did."
tags: [reliability, distributed-systems]
order: 10
draft: false
---

The incident didn't start with an outage. It started with one Aerospike shard getting slow on a single hot key.

Here is the shape of it. Workers read a key; that key's shard starts timing out. Every client is configured to retry on timeout — sensibly, in isolation. But they all time out at roughly the same interval, so they all retry at roughly the same moment. The retries arrive in lockstep, the extra load makes the shard slower, which makes more requests time out, which triggers another synchronized wave of retries. The system was now manufacturing its own load faster than it could shed it. A localized slowdown had become a self-inflicted stampede — a thundering herd, except the herd was us.

## The fix, in two moves

**First, stop the bleeding.** Skip the known-bad keys so workers stopped hammering the one shard that couldn't answer. That bought headroom immediately, without a deploy-everything scramble in the middle of an incident.

**Then, fix the structural cause.** Add exponential backoff *with jitter* to the retry policy. Backoff gives the shard room to recover. Jitter is the part people leave out, and it's the part that matters: it desynchronizes the herd so retries spread across time instead of landing as a spike.

## The lesson I keep

A retry is not a free safety net — it's load. A retry policy without jitter doesn't add resilience; it adds *correlation*, and correlation is how a small timeout turns into a large outage. Idempotency, bounded retries, backoff, jitter, and a circuit breaker aren't niceties you add later. They're the difference between a blip and a page.
