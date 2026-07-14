---
title: "The questions that made me less junior"
kind: note
mode: career
date: 2026-07-08
hook: "I stopped asking only 'does it work?' and started asking what happens twice, late, and when it fails halfway."
tags: [early-career, design-review, judgment]
order: 12
draft: false
featured: true
---

Early on I optimized for looking smart in design review. Name the pattern. Sketch the happy path. Get the merge.

I was not missing more patterns. I was missing better questions. The ones seniors ask quietly while juniors are still defending the diagram.

## The questions that changed my work

I still use these. Not as theater. As a way to catch designs that look finished on the whiteboard and dangerous after they ship.

- **What happens twice?** Retries, double clicks, redelivery, two workers on the same job. If you need exactly once, say so and prove it.
- **What happens late?** Backfill, delayed jobs, clock skew, a consumer that was down for an hour. Does the system converge, or invent ghosts?
- **What happens partially?** Half the replicas updated. Write succeeded, side effect did not. User saw success, ledger did not.
- **Who pays when this is wrong?** On-call, support, the junior who inherits the code, the customer who stops trusting the product. If the answer is "someone else," the design is incomplete.
- **How will we know?** Not "we'll add metrics later." Which count, at which stage, would make a lie visible in week one?

## What I wish I'd known earlier

Speed without those questions is not senior speed. It is debt with a demo.

Looking clever in a meeting is cheap. Being able to explain the system after a bad Tuesday is expensive. That is the job.

If you are early: you do not need permission to ask these in review. Ask them about your own designs first. Write the answers down. That habit compounds faster than any framework tutorial.

## What I still believe

Growth is less about collecting tools and more about expanding the failure modes you refuse to hand-wave. The whiteboard is where a design looks finished. Production is where it becomes visible, including the parts of you that wanted to ship before you were ready to operate.
