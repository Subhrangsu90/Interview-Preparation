# Angular Interview Preparation Guide (2+ Years Experience Level)

> At 2+ years, interviewers mostly check that your **fundamentals are solid and you can explain how things work**, not deep architecture (NgRx internals, micro frontends, library publishing are 4–5+ YOE topics — skip those for now). For every topic below: know **what it is → why we use it → a simple real example**. That's enough depth at this level.

---

## PART 1 — ANGULAR CORE FUNDAMENTALS

### Component Basics & Communication
- **Parent → Child:** `@Input()` — passes data down.
- **Child → Parent:** `@Output()` + `EventEmitter` — emits events up.
- **Unrelated components:** a shared service, often exposing a `Subject`/`BehaviorSubject` that both components inject.
- **Real example:** a search box component emits a search term via `@Output()`; the parent page passes it down as `@Input()` to a results-list component.

### Directives
- **Structural directives** change the DOM structure — add/remove elements: `*ngIf`, `*ngFor`, `*ngSwitch` (or the modern `@if`/`@for`/`@switch` control-flow syntax).
- **Attribute directives** change appearance/behavior of an existing element without adding/removing DOM: `ngClass`, `ngStyle`, or a custom one.
- **Custom directive example:** an `appHighlight` directive using `@HostListener('mouseenter')` / `@HostListener('mouseleave')` to change background color on hover, applying styles via `Renderer2` (safer than touching `ElementRef.nativeElement` directly).
- **Real-world use case:** a `appAutofocus` directive, or a permission directive like `*appIfRole="'admin'"` that hides/shows a button.

### Services & Dependency Injection
- **Service:** a plain TypeScript class marked `@Injectable()` that holds reusable logic/data (API calls, shared state, utilities) — kept separate from components so components stay focused on the view.
- **Dependency Injection (DI):** instead of a class creating its own dependencies (`new SomeService()`), Angular's injector creates and hands them in — via constructor injection or the modern `inject()` function. This makes classes easier to test (swap in a mock) and decouples them from concrete implementations.
- **Provider scopes:**
  - `providedIn: 'root'` — a single app-wide singleton (most common, tree-shakable).
  - Provided in a specific component's `providers` array — a new instance per component instance (and shared with its children) — used when you want isolated state per component tree (e.g., a wizard/stepper that needs its own fresh state each time it's opened).
  - `providedIn: 'any'` — a separate instance per lazy-loaded module.
- **Real example:** a single `AuthService` (root-scoped, one shared login state) vs a `WizardStateService` provided at the wizard component level so every time the wizard opens fresh, it gets a clean instance.

### Lifecycle Hooks
- Order: `ngOnChanges → ngOnInit → ngDoCheck → ngAfterContentInit → ngAfterContentChecked → ngAfterViewInit → ngAfterViewChecked → ngOnDestroy`.
- **`ngOnInit`:** one-time setup/initial data fetch, runs once after the first `ngOnChanges`.
- **`ngOnChanges`:** fires whenever a bound `@Input()` **reference** changes — useful in reusable components to react whenever the parent passes new data.
- **`ngAfterViewInit`:** the view and any `@ViewChild` references are ready — safe place to read/measure DOM or call a child component's method.
- **`ngOnDestroy`:** cleanup — unsubscribe from subscriptions, clear timers, detach listeners. Critical to avoid memory leaks.
- **`ngDoCheck`:** rarely needed manual change-detection hook — mention it exists, but say you'd reach for it only in rare custom scenarios since it runs on every CD cycle.

### package.json vs package-lock.json
- **`package.json`** declares intended dependencies (often as version *ranges*, e.g. `^17.0.0`) plus scripts and metadata.
- **`package-lock.json`** records the **exact resolved versions** of every dependency and sub-dependency that got installed.
- **Why the lock file matters:** guarantees everyone on the team (and CI) installs the *identical* dependency tree, avoiding "works on my machine" bugs caused by two installs silently resolving different minor/patch versions. Always commit it, never hand-edit it.

**❓ Questions to expect in this part**
- What's the difference between `@Input`/`@Output` and a shared service for communication — when would you use each?
- Structural vs attribute directives — give one example of each.
- How does `@HostListener` work? What's the difference between `ElementRef` and `Renderer2`, and why is `Renderer2` preferred?
- What is a service in Angular? How does Dependency Injection work?
- What are the different provider scopes (`providedIn: 'root'` vs component-level) and when would you use each?
- Walk through the Angular component lifecycle. What's the difference between `ngOnInit` and `ngOnChanges`?
- Why is `package-lock.json` important? What happens if it's missing or out of sync?

---

## PART 2 — HTTP, INTERCEPTORS & AUTH

### HTTP Interceptors
- **What:** a function that sits in the middle of every outgoing request/incoming response, letting you modify or react to it centrally instead of repeating logic in every service call.
- **Common uses:** attaching an auth token header, adding custom headers (e.g., `Content-Type`, correlation IDs), centralized error handling, logging, loading indicators.
- **Basic token-attaching example:**
  ```ts
  export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = inject(AuthService).token;
    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
    return next(authReq);
  };
  ```
- **Registering multiple interceptors:**
  ```ts
  provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ```
- **Execution order:** they run in the order given for the *request* path, and unwind in reverse for the *response* path — think of them as layers wrapped around the actual HTTP call.
- **Handling unauthorized responses:** in an error interceptor, use `catchError` to check `error.status === 401` — typically redirect to the login page (or trigger a token-refresh flow) and rethrow the error via `throwError()` so the calling code still knows the request failed.

### Basics of Auth in Angular Apps
- **Attaching JWT/tokens:** via the interceptor above — token usually comes from an `AuthService` that stores it after login (ideally in an `HttpOnly` cookie set by the backend rather than `localStorage`, for XSS safety — good to mention even at this level).
- **Guards:** `CanActivateFn` checks something (e.g., "is the user logged in?") before allowing navigation to a route, redirecting to `/login` if not.
  ```ts
  export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.isLoggedIn() ? true : router.parseUrl('/login');
  };
  ```

**❓ Questions to expect in this part**
- What is an HTTP interceptor and why would you use one?
- How do multiple interceptors work together — what's the execution order?
- How would you attach a JWT token to every outgoing request?
- How do you handle a 401 Unauthorized response globally?
- What is a route guard? Have you implemented `CanActivate`?

---

## PART 3 — RXJS ESSENTIALS

### Subject vs BehaviorSubject
- **`Subject`** has no initial value — late subscribers get nothing until the next emission. Good for one-off events ("button clicked", "refresh triggered").
- **`BehaviorSubject`** requires an initial value and always gives new subscribers the **current/latest** value immediately. Good for holding state that components read at any time ("current logged-in user", "cart item count").

### Core Operators
- **`map`** — transforms each emitted value.
- **`tap`** — side effects (e.g., logging) without changing the stream.
- **`switchMap`** — cancels the previous inner call when a new value arrives; best for search-as-you-type or anything where only the latest request matters.
- **`mergeMap`** — runs all inner observables in parallel, no cancellation; best for independent operations that can run at the same time.
- **`concatMap`** — runs inner observables one after another, in order; best when sequence matters (e.g., save step 1 must finish before step 2 starts).
- **`forkJoin`** — like `Promise.all()`: waits for several observables to each **complete**, then emits their final values together — good for firing a few independent API calls in parallel and proceeding only once all are done.
- **`retry`** — automatically resubscribes on error, up to N times — useful for flaky calls.
- **`take(n)`** — takes the first n values then completes.
- **`takeUntil(notifier$)`** — the standard way to auto-unsubscribe when a component is destroyed.
- **Debouncing:** `debounceTime(300)`, usually paired with `distinctUntilChanged()`, to wait for a pause in fast-firing events (typing, scrolling) before reacting.

### Avoiding Memory Leaks
- Every subscription that isn't automatically cleaned up can leak. Options:
  1. Store a `Subscription`, call `.unsubscribe()` in `ngOnDestroy`.
  2. `takeUntil(this.destroy$)` pattern with a `Subject` completed in `ngOnDestroy`.
  3. **`AsyncPipe`** in the template — Angular subscribes/unsubscribes automatically; prefer this whenever you don't need the value in the TS class.
  4. **`DestroyRef`**/`takeUntilDestroyed()` (modern Angular) — no manual `Subject` bookkeeping needed.
- Good to mention: `HttpClient` calls complete automatically after one emission, so the real leak risk is long-lived streams (intervals, router events, DOM events, WebSockets).

**❓ Questions to expect in this part**
- Difference between `Subject` and `BehaviorSubject`, with an example of when you'd use each.
- Difference between `switchMap`, `mergeMap`, and `concatMap` — give a real scenario for each.
- When would you use `forkJoin`?
- How do you debounce a search input in Angular?
- How do you avoid memory leaks from subscriptions? What's `takeUntil` vs the `async` pipe?

---

## PART 4 — CHANGE DETECTION, PIPES & PERFORMANCE

### Change Detection
- Angular checks component bindings and updates the DOM when data changes. By default (Zone.js-based), any async event (click, HTTP response, timer) tells Angular to re-check the **entire component tree**.
- **`ChangeDetectionStrategy.OnPush`:** a component only re-checks when its `@Input()` **reference** changes, an event fires from within it, or an `async`-piped observable emits. Big performance win for large apps.
- **When to use `OnPush`:** whenever a component's data comes purely from `@Input()`s and isn't mutated internally — good default habit to build early, since it also nudges you toward cleaner, immutable data patterns.
- **Common gotcha:** mutating an array/object in place (`this.items.push(x)`) won't trigger `OnPush` re-check — you need a new reference (`this.items = [...this.items, x]`).

### Pure vs Impure Pipes
- **Pure (default):** re-runs only when the input reference changes — efficient.
- **Impure** (`pure: false`): re-runs on every change detection cycle — expensive, use sparingly (e.g., `AsyncPipe` is a built-in impure pipe).
- **Custom pipe example:**
  ```ts
  @Pipe({ name: 'truncate' })
  export class TruncatePipe implements PipeTransform {
    transform(value: string, limit = 20) {
      return value.length > limit ? value.slice(0, limit) + '…' : value;
    }
  }
  ```

### Basic Performance Habits
- **`trackBy`** in `*ngFor` (or the built-in `track` in `@for`) — gives Angular an identity per list item so it doesn't destroy/recreate DOM nodes unnecessarily on updates.
- Prefer pipes over calling a method directly in the template (methods re-run every CD cycle; pure pipes don't).
- Keep components focused on presentation; push logic into services.

**❓ Questions to expect in this part**
- How does Angular's change detection work by default?
- What is `OnPush` and when should you use it?
- Why doesn't `OnPush` pick up a mutated array?
- Difference between a pure and an impure pipe?
- What does `trackBy` do and why does it matter for lists?

---

## PART 5 — FORMS & ROUTING BASICS

### Reactive Forms Basics
- `FormControl`, `FormGroup`, `FormBuilder` — build forms in the component class rather than the template, giving full control over validation and state.
- **`setValue` vs `patchValue`:** `setValue` requires a value for *every* control (throws if you miss one); `patchValue` updates only the fields you provide — handy when populating a form from a partial API response.
- **`FormArray`:** a resizable list of controls, used for dynamic "add another item" style fields.

### Routing Basics
- **Navigating with query params:**
  ```ts
  this.router.navigate(['/products'], { queryParams: { category: 'shoes' } });
  ```
- **Reading query params:**
  ```ts
  this.route.queryParams.subscribe(params => this.category = params['category']);
  ```
- **Route guards** for protecting routes (`CanActivate`), as covered in Part 2.

**❓ Questions to expect in this part**
- Difference between `setValue` and `patchValue`?
- What is `FormArray` used for?
- How do you navigate with query parameters and read them back on the destination page?
- How would you protect a route so only logged-in users can access it?

---

## PART 6 — TYPESCRIPT & JAVASCRIPT FUNDAMENTALS

### `type` vs `interface`
- `interface` — best for describing object/class shapes; supports declaration merging (multiple `interface Foo {}` blocks combine).
- `type` — more flexible: can express unions, tuples, and primitives, not just object shapes; can't be re-opened/merged.
- Rule of thumb often used: `interface` for public object shapes, `type` for unions/utility compositions.

### Generics
- Let you write reusable, type-safe code that works across multiple types while keeping type information:
  ```ts
  function wrap<T>(value: T): { data: T } { return { data: value }; }
  ```
- Angular example: `HttpClient.get<User>('/api/user')` — the generic tells TypeScript what shape the response will be.

### Deep Copy vs Shallow Copy
- **Shallow copy** (`{ ...obj }`, `Object.assign()`) copies only the top level — nested objects/arrays are still shared references.
- **Deep copy** (`structuredClone(obj)`, or `JSON.parse(JSON.stringify(obj))` for simple cases) duplicates every nested level, no shared references.
- **Why it matters in Angular:** ties directly to `OnPush`/pure pipes — a shallow copy with a mutated nested object won't be detected as "changed" by reference comparison.

### Coding Round — Character Frequency
```ts
function charFrequency(str: string): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const ch of str) {
    freq[ch] = (freq[ch] ?? 0) + 1;
  }
  return freq;
}
```
- **Time complexity:** O(n) — one pass, one map lookup/update per character.
- **Space complexity:** O(k), k = number of distinct characters.
- Common follow-up: "find the first non-repeating character" — build the frequency map first, then do a second pass over the original string (to preserve order) and return the first character with count 1.

**❓ Questions to expect in this part**
- Difference between `type` and `interface` in TypeScript?
- What are generics and why would you use them?
- Difference between deep copy and shallow copy — give an example of each.
- Write a function to find character frequency in a string. What's the time complexity?
- (Follow-up) Find the first non-repeating character in a string.

---

## PART 7 — SIGNALS (Modern Angular Basics)

### What Are Signals?
- A reactive value container: `const count = signal(0)`; read it by calling `count()`, update with `count.set(1)` or `count.update(v => v + 1)`.
- **`computed()`** — a read-only, derived signal that recalculates only when a signal it depends on changes: `const doubled = computed(() => count() * 2)`.
- **`effect()`** — runs a side effect automatically whenever a signal it reads changes (e.g., logging, syncing to `localStorage`). Not meant to derive new state — use `computed` for that.
- **Why they matter even at 2+ YOE:** newer Angular projects default to signals for component state and inputs (`input()`, `output()`, `model()`), so interviewers now expect at least a working knowledge even from mid-level candidates.

**❓ Questions to expect in this part**
- What is a signal in Angular? How is it different from a regular variable or a `BehaviorSubject`?
- What does `computed()` do, and how is it different from `effect()`?
- Have you used signal-based inputs/outputs (`input()`, `output()`)?

---

## PART 8 — PRACTICAL / EXPERIENCE QUESTIONS

These aren't concept questions — have short, honest, specific answers ready:

- Which Angular versions have you worked on? (Be specific — e.g., "started on Angular 12, currently on Angular 17/18, standalone components and signals in my recent projects.")
- Have you used any AI coding tools (Copilot, Claude, Cursor)? What for, and where do you still double-check the output yourself?
- Have you worked with or debugged a CI/CD pipeline (even just fixing a broken build step)?
- Which third-party UI libraries have you used (Angular Material, PrimeNG, Bootstrap, AG Grid, Chart.js)? What did you customize?
- Tell me about a bug you found and fixed that taught you something about how Angular works internally.

---

## How to Use This Guide
1. Go part by part and explain each item **out loud** in your own words — if you can't explain `switchMap` vs `mergeMap` verbally with an example, you don't know it well enough yet.
2. The **Questions to Expect** list under each part is your self-check — cover the section, then try to answer each question cold.
3. Prioritize Parts 1–4 (fundamentals, HTTP, RxJS, change detection) — these get asked in almost every Angular interview at this level. Parts 5–7 come up often but slightly less consistently. Part 8 is about having a real story ready, not memorizing facts.
4. Once this feels solid, the companion **4+ years guide** (already generated) is a natural next step for deeper/senior-level topics (NgRx, micro frontends, security hardening, library publishing).
