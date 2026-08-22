# How JS Handles Async: The Event Loop

## A visual guide to the Call Stack, Web APIs, the Callback Queue, and the Microtask Queue

In the last post, we built the full mental model of synchronous JavaScript: one thread, one call stack, everything pushed and popped in strict order. We ended on this line:

> "Nothing runs in parallel; everything is a controlled sequence of pushing contexts on, running them, and taking them back off."

That raises an obvious question. If JavaScript really can only do one thing at a time, how does it handle a `setTimeout`, a `fetch` request, or a click handler — all seemingly waiting "in the background" — without freezing your entire page while it waits?

The answer is that **JavaScript itself never waits for anything.** The waiting is outsourced. This post is about who it's outsourced to, and the traffic-cop system — the **event loop** — that decides when outsourced work gets to come back and run.

By the end, you'll understand exactly why this logs in this order, not the order it's written in:

```js
console.log("1: Start");

setTimeout(() => console.log("2: Timeout"), 0);

Promise.resolve().then(() => console.log("3: Promise"));

console.log("4: End");

// Actual output:
// 1: Start
// 4: End
// 3: Promise
// 2: Timeout
```

## 1. The problem: JS is single-threaded, but the browser isn't

Recall from the last post: the call stack can only hold one thing at a time, and it runs to completion before moving on. If `setTimeout`'s callback, or a `fetch`'s response handling, had to sit and block the call stack until they were ready, your entire program — scrolling, clicking, rendering, everything — would freeze for however long that operation took.

That's not what happens. Instead, JavaScript hands time-consuming or "wait for something external" work off to the environment running it — the **browser** (or, in Node, the runtime itself) — and keeps executing the rest of your code immediately. When that outsourced work finishes, the environment doesn't just barge in and interrupt whatever's currently on the call stack. It politely gets in line, and waits for its turn.

That whole system — outsourcing, waiting in line, getting a turn — is what we're about to unpack, piece by piece.

## 2. Meet the four pieces

### The call stack

Same one from the last post. Still LIFO, still the only place code actually _executes_, still can only run one thing at a time.

### Web APIs (the "outsourcing department")

These are **not part of the JavaScript engine at all** — they're provided by the browser (or Node's C++ bindings under the hood). Things like:

- `setTimeout` / `setInterval` — timers
- `fetch` / `XMLHttpRequest` — network requests
- DOM event listeners — `click`, `scroll`, `keydown`
- File and geolocation APIs

When your code calls one of these, JavaScript doesn't execute the waiting itself. It hands the job to the Web API environment and immediately moves on to the next line — the call stack never blocks for it.

### The callback queue (a.k.a. the macrotask queue)

Once a Web API finishes its job — the timer expires, the network response arrives — it doesn't run the callback immediately. It places that callback into the **callback queue**, a simple first-in-first-out line, and waits for permission to run.

`setTimeout` callbacks, DOM event callbacks, and `setInterval` ticks all land here.

### The microtask queue

Promises use a **separate, higher-priority queue.** `.then()`, `.catch()`, `.finally()` callbacks, and `queueMicrotask()` all land here instead of the regular callback queue.

This second queue is the key detail most people miss, and it's the entire reason the example at the top of this post logs in the order it does.

## 3. The event loop: the traffic cop

Here's the rule that ties all four pieces together, and it's simpler than people expect:

> **The event loop's only job is to check: "Is the call stack empty? If so, is there anything waiting to run?" — and if yes, push the next thing onto the stack.**

It runs this check constantly, in a loop (hence the name), and it always follows the same priority order:

1. Run everything currently on the call stack, top to bottom, until it's completely empty.
2. Once the stack is empty, drain the **entire microtask queue** — run every microtask waiting there, one at a time. If a microtask itself queues another microtask, that new one also gets run before moving on. The queue must be fully empty before step 3.
3. Only once the microtask queue is completely empty, take **one single task** from the callback queue and push it onto the stack.
4. Once that one task finishes and the stack is empty again, go back to step 2 — check the microtask queue again — before taking the next callback queue task.

This is the whole mechanism. Microtasks always cut in front of the callback queue, and they get to fully empty out before a single macrotask is allowed to run.

## 4. Walking the opening example, line by line

```js
console.log("1: Start");

setTimeout(() => console.log("2: Timeout"), 0);

Promise.resolve().then(() => console.log("3: Promise"));

console.log("4: End");
```

**Step 1 — `console.log("1: Start")` runs**
Pushed onto the call stack, runs immediately, logs `1: Start`, popped off.

**Step 2 — `setTimeout(..., 0)` is called**
This is a Web API call. Even with a delay of `0`, JavaScript doesn't run the callback now — it hands the timer off to the Web API environment and moves on immediately. The callback function is _not_ on any queue yet; it's waiting on the timer.

**Step 3 — `Promise.resolve().then(...)` is called**
`Promise.resolve()` creates an already-resolved promise. `.then()` schedules its callback — but not on the call stack directly. It goes straight into the **microtask queue**, waiting for the stack to clear.

**Step 4 — `console.log("4: End")` runs**
Pushed, runs, logs `4: End`, popped.

**Step 5 — the call stack is now empty**
This is where the event loop's real work begins. It checks: microtask queue first. It finds the `.then()` callback waiting there, pushes it onto the stack, runs it — logs `3: Promise` — and pops it off. It checks the microtask queue again: empty now.

**Step 6 — only now does the callback queue get a turn**
By this point, the `0`ms timer has long since expired (the Web API environment finished waiting on it back around step 2) and its callback has been sitting in the callback queue this whole time. The event loop takes it, pushes it, runs it — logs `2: Timeout`.

**Final output:**

```
1: Start
4: End
3: Promise
2: Timeout
```

Notice that `setTimeout(..., 0)` doesn't mean "run in 0 milliseconds." It means "run as soon as possible, but only after the current call stack is empty AND the entire microtask queue has been drained." That's a subtle but important distinction — the delay is a _minimum_, not a guarantee.

## 5. A bigger trace: mixing multiple microtasks and macrotasks

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve()
	.then(() => console.log("C"))
	.then(() => console.log("D"));

setTimeout(() => console.log("E"), 0);

Promise.resolve().then(() => console.log("F"));

console.log("G");
```

Walking it the same way:

- `A` and `G` run synchronously first — they're plain call stack work with nothing to outsource.
- Both `setTimeout` calls hand their callbacks off to the Web API environment immediately; `B` and `E` land in the callback queue once their (instant) timers expire, and just wait their turn.
- Both `.then()` chains queue their first callbacks as microtasks straight away.

Once the stack clears after `G`, the event loop drains the microtask queue completely: `C` runs, and _because_ it's a microtask that queues another microtask (`D`), that gets drained too — all before a single macrotask is touched. Then `F` runs, since it was already sitting in the microtask queue alongside `C`.

Only after the microtask queue is fully empty does the callback queue get a turn, one item at a time: `B`, then (after the stack clears again and the microtask queue is re-checked and found empty) `E`.

**Final output:**

```
A
G
C
F
D
B
E
```

If that `D` position surprised you — it runs before `F`'s neighbours settle but the key rule holds: any microtask, however it was scheduled, jumps ahead of every macrotask, for as long as the microtask queue keeps producing more work.

## 6. `async`/`await` is just microtasks in disguise

This trips a lot of people up because `async`/`await` _looks_ synchronous — no `.then()` chains in sight. Under the hood, it's exactly the same machinery from section 5.

```js
async function getData() {
	console.log("1: Before await");
	await Promise.resolve();
	console.log("3: After await");
}

console.log("Start");
getData();
console.log("2: End");

// Output:
// Start
// 1: Before await
// 2: End
// 3: After await
```

When execution hits an `await`, the rest of that `async` function — everything after it — is effectively scheduled as a microtask, exactly like a `.then()` callback would be. The function pauses right there, control returns immediately to whoever called it (which is why `"2: End"` logs before `"3: After await"`), and the remainder only resumes once the call stack is empty and it's the microtask queue's turn.

There's no new mechanism here — `await` is syntax sugar over promises, and promises are always microtasks.

## 7. Common misconceptions, cleared up

**"`setTimeout(fn, 0)` runs immediately."**
Not quite — it runs as soon as the call stack is clear _and_ the microtask queue is fully drained, which in practice always means "after everything else currently queued," not "right now."

**"Promises are faster than `setTimeout` because they resolve instantly."**
Not necessarily true because of speed — it's true because of _priority_. Both go through the exact same "wait for the stack to clear" gate; promises just get to skip ahead of the callback queue every single time, regardless of how fast either operation actually was.

**"The event loop runs code in parallel."**
No — the call stack is still single-threaded, exactly as covered in the last post. The event loop doesn't run two things at once; it just decides, in strict order, _what gets pushed onto that one stack next_. The Web APIs are what actually do work outside the main thread — the event loop itself is purely a scheduler.

**"Microtasks and macrotasks are basically the same thing, just named differently."**
They're not interchangeable — microtasks (promises, `queueMicrotask`) always fully drain before even one macrotask (`setTimeout`, DOM events) is allowed to run. This priority difference is the entire reason ordering examples like the ones above don't run top-to-bottom.

## 8. The one-paragraph summary

JavaScript is single-threaded and never actually waits for anything itself — it hands off timers, network requests, and event listeners to Web APIs provided by the browser or runtime, and immediately keeps executing the rest of the call stack. When that outsourced work finishes, its callback doesn't interrupt the stack directly; it waits in one of two queues — the high-priority microtask queue for promises, or the callback queue for everything else — until the event loop notices the stack is empty. The event loop's entire job is repeating one check, forever: drain the call stack, then fully drain the microtask queue, then let exactly one callback-queue item in, then repeat. `async`/`await` doesn't break this pattern — it's syntax sugar over exactly the same promise-and-microtask machinery. Once you can trace that priority order — stack, then microtasks (fully), then one macrotask, then back to microtasks — every "weird" async ordering you'll ever run into stops being weird and starts being exactly what you'd predict.
