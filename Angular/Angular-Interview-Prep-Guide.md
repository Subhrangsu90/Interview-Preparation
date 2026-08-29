# Angular Interview Preparation Guide (4+ Years Experience Level)

> For each topic, aim to cover: **What it is → Why we use it → How it works internally → When to use it → Real-world example → Performance/optimization notes.** That's the lens interviewers use at this level — definitions alone won't cut it.

---

## PART 1 — CORE ANGULAR ARCHITECTURE

### 1. Standalone Components vs Module-Based (NgModule) Structure
- **Standalone components** (default since Angular 14/19) declare their own dependencies via the `imports` array instead of relying on an `NgModule`. No `declarations`, no `NgModule` wiring.
- **Why:** simpler mental model, smaller bundles (better tree-shaking), faster to scaffold, no more "forgot to declare/export" bugs.
- **Module-based:** still valid for large legacy codebases; groups related declarations/providers/exports together; useful for lazy-loaded feature modules pre-v14 style.
- **Interview angle:** be ready to explain migration strategy (`ng generate @angular/core:standalone`), how `bootstrapApplication()` replaces `platformBrowserDynamic().bootstrapModule()`, and how providers move to `app.config.ts` (`ApplicationConfig`, `provideRouter`, `provideHttpClient`, etc.).

### 2. Component Communication
- **Parent → Child:** `@Input()` (or `input()` signal-based input in modern Angular).
- **Child → Parent:** `@Output()` + `EventEmitter` (or `output()` function).
- **Unrelated / sibling components:**
  - Shared service with a `Subject`/`BehaviorSubject` (pub-sub pattern) — most common in interviews.
  - Signals in a shared service (modern approach).
  - `@ViewChild`/`@ContentChild` when a direct parent-child DOM reference is available.
  - State management (NgRx/Akita/Signal Store) for app-wide shared state.
- **Real-world example:** a header "notification bell" component and a "cart" component that don't share a parent — both inject a `CartService` that exposes a `BehaviorSubject<number>` for item count.

### 3. HTTP Interceptors
- **What:** functions/classes that intercept every outgoing `HttpRequest` and incoming `HttpResponse`, letting you transform them centrally.
- **Common uses:** attaching auth tokens, adding custom headers, global error handling, loading spinners, logging, retry logic.
- **Functional interceptors (modern, v15+):**
  ```ts
  export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = inject(AuthService).token;
    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(cloned);
  };
  ```
  Registered via `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`.
- **Execution order:** interceptors run in the order they're provided for the *request* path, and in **reverse order** for the *response* path (they wrap around `next()` like middleware/an onion). If `[A, B]` are registered, request flow is `A → B → server`, response flow is `server → B → A`.
- **Multiple interceptors working together:** each one calls `next(req)` to pass control down the chain; you can short-circuit (e.g., return a cached response) by not calling `next()`.
- **Error handling pattern:** a dedicated interceptor catches errors via `catchError`, checks status codes (401 → redirect to login / trigger refresh-token flow, 403 → show forbidden message, 5xx → generic toast), then rethrows via `throwError()`.
- **Token refresh nuance (senior-level question):** how do you avoid firing multiple refresh calls when several requests 401 at once? Typically use a `BehaviorSubject<boolean>` flag + `switchMap`/queueing so only one refresh call happens and other requests wait for it.

### 4. Reusable Components
- `@Input()`/`@Output()` for data in/events out.
- **Passing HTML/content into a reusable component:** `<ng-content>` (content projection).
  - Single-slot: `<ng-content></ng-content>`
  - Multi-slot: `<ng-content select="[header]"></ng-content>` matched by attribute/class/tag selector.
- **Real-world example:** a generic `<app-modal>` where the header, body, and footer are all projected by the consumer, or a generic `<app-card>` wrapping arbitrary content.
- Also worth mentioning: `@ContentChild`/`@ContentChildren` to query projected content from within the reusable component.

### 5. ViewChild | ng-template | ng-container
- **`@ViewChild`:** gets a reference to a DOM element, directive, or child component instance from the template. Available after `ngAfterViewInit` (use `{ static: true }` if you need it in `ngOnInit` and it's not inside `*ngIf`).
- **`ng-template`:** a template that isn't rendered by default — a blueprint. Used with structural directives, `TemplateRef`, `ngTemplateOutlet`, or passed to components (e.g., custom table cell templates).
- **`ng-container`:** a logical grouping element that renders **no actual DOM element** — useful to apply a structural directive without adding an extra `<div>`, or to group multiple `ng-template`s.
- **Real-world example:** a reusable data-table component that accepts a `TemplateRef` per column so consumers can customize cell rendering without the table component knowing the content in advance.

### 6. Lifecycle Hooks
- Order: `ngOnChanges → ngOnInit → ngDoCheck → ngAfterContentInit → ngAfterContentChecked → ngAfterViewInit → ngAfterViewChecked → ... → ngOnDestroy`.
- **`ngOnChanges`:** fires whenever an `@Input()` reference changes (before `ngOnInit`, and again on every subsequent input change). Critical for reusable components — this is how you react to a parent updating input data.
- **`ngOnInit`:** one-time init logic, fetch initial data.
- **`ngDoCheck`:** custom change detection logic (use sparingly — runs very often).
- **`ngAfterViewInit`:** view (including `@ViewChild` refs) is fully initialized — safe to interact with child component APIs or DOM measurements here.
- **`ngOnDestroy`:** cleanup — unsubscribe from subscriptions, detach event listeners, clear intervals, complete `Subject`s used for `takeUntil`.
- **Interview trap:** explain *why* `ngOnChanges` only fires for `@Input()`-bound properties and only when the reference changes (not on mutation of an object/array in place) — this ties directly into `OnPush` change detection.

### 7. Pure vs Impure Pipes
- **Pure pipes (default):** re-evaluated only when the input reference changes (primitive value change, or a *new* object/array reference). Cheap, predictable, cacheable.
- **Impure pipes** (`pure: false`): re-evaluated on *every* change detection cycle, regardless of whether the input actually changed. Needed when a pipe must react to internal mutation (e.g., filtering an array that's mutated in place) — but expensive if overused.
- **Built-in example of impure pipe:** `AsyncPipe`.
- **Custom pipe example:**
  ```ts
  @Pipe({ name: 'truncate' })
  export class TruncatePipe implements PipeTransform {
    transform(value: string, limit = 20): string {
      return value.length > limit ? value.slice(0, limit) + '…' : value;
    }
  }
  ```
- **Performance note:** prefer pure pipes + immutable data patterns over impure pipes wherever possible.

### 8. Custom Directives
- **Attribute directives** change appearance/behavior of an element (`ngClass`, `ngStyle`, or your own like `appHighlight`).
- **Structural directives** change the DOM layout (`*ngIf`, `*ngFor`, `*ngSwitch`, or a custom one using `TemplateRef`/`ViewContainerRef`).
- **`@HostListener`:** binds to a DOM event on the host element (e.g., `@HostListener('mouseenter')`).
- **`ElementRef`:** direct reference to the native DOM element — but Angular recommends avoiding direct DOM manipulation through it for security (XSS) and platform-portability (SSR) reasons.
- **`Renderer2`:** the safe, platform-agnostic abstraction for DOM manipulation (works with SSR/Web Workers, sanitizes where relevant). Prefer `Renderer2.setStyle()`/`addClass()` over `elementRef.nativeElement.style...`.
- **Real-world example:** a `appHighlight` directive that changes background color on hover, or an `appDebounceClick` directive to throttle rapid button clicks.

---

## PART 2 — RXJS (Heavy interview focus at this level)

### 9. Subject vs BehaviorSubject
| | Subject | BehaviorSubject |
|---|---|---|
| Initial value | None required | Requires an initial value |
| Late subscriber | Gets nothing until next emission | Immediately gets the **current/last** value |
| Use case | Event bus (e.g., "button clicked") | State holder (e.g., "current user", "cart count") |

Also worth knowing: `ReplaySubject` (replays last N values to new subscribers) and `AsyncSubject` (emits only the last value, only on completion).

### 10. Key RxJS Operators
- **`map`** — transform each emitted value.
- **`tap`** — side effects without altering the stream (logging, debugging).
- **`switchMap`** — cancels the previous inner observable when a new source value arrives. Best for: search-as-you-type, route param changes — anything where only the *latest* request matters.
- **`mergeMap` (`flatMap`)** — runs all inner observables concurrently, no cancellation. Best for: firing multiple independent parallel operations where order/cancellation doesn't matter (e.g., uploading multiple files).
- **`concatMap`** — queues inner observables and runs them **sequentially**, one at a time. Best for: operations that must happen in order (e.g., sequential form-save steps).
- **`forkJoin`** — waits for **multiple observables to each complete once**, then emits the last value of each as an array/object — like `Promise.all()`. Best for: firing several independent API calls in parallel and proceeding only once *all* have finished (e.g., loading a dashboard that needs user profile + settings + notifications together).
  - **Difference from other combination operators:**
    - `forkJoin` → all sources must **complete**; emits once, at the end.
    - `combineLatest` → emits every time *any* source emits (after all have emitted once) — doesn't require completion, good for reactive forms combining multiple streams.
    - `zip` → pairs emissions by index across sources.
    - `merge` → simply interleaves emissions from multiple sources as they arrive.
- **`retry`** — resubscribes to the source on error, up to N times — useful for flaky network calls.
- **`take(n)`** — takes the first n emissions then completes.
- **`takeUntil(notifier)`** — the standard unsubscribe pattern (see below).
- **Debouncing (`debounceTime`)** — waits for a pause in emissions before emitting the latest value; classic use: search input, resize/scroll handlers. Often paired with `distinctUntilChanged()` to skip duplicate values.

### 11. Avoiding Memory Leaks
- **The problem:** subscriptions that outlive the component (e.g., an HTTP polling stream, a router event subscription) keep references alive and can cause duplicate logic/leaks.
- **Solutions, from older to modern:**
  1. Manual `.unsubscribe()` in `ngOnDestroy`.
  2. A `Subscription` and adding to it (`this.sub.add(...)`), then one `.unsubscribe()` call.
  3. `takeUntil(this.destroy$)` pattern — a `Subject` that emits/completes in `ngOnDestroy`.
  4. `take(1)` for observables you know only need to fire once.
  5. **`AsyncPipe`** in the template — Angular auto-subscribes/unsubscribes with the component lifecycle; the recommended default whenever you don't need the value in the class.
  6. **`DestroyRef`** (modern, v16+) — inject `DestroyRef` and call `destroyRef.onDestroy(() => ...)`, or use the `takeUntilDestroyed()` operator, which needs no manual `Subject` bookkeeping and works outside components too (e.g., in services).
- **Interview tip:** mention that HTTP calls via `HttpClient` complete automatically after one emission, so they technically don't "leak" — the real leak risk is with long-lived streams (`interval`, WebSocket, router events, DOM events via `fromEvent`).

---

## PART 3 — ROUTING

### 12. Routing — Query Params & Navigation
- **Navigate with query params:**
  ```ts
  this.router.navigate(['/products'], { queryParams: { category: 'shoes', page: 2 } });
  ```
- **Read query params:**
  ```ts
  this.route.queryParams.subscribe(params => this.category = params['category']);
  // or as a signal (modern): toSignal(this.route.queryParams)
  ```
- **`queryParamsHandling`:** `'merge'` vs `'preserve'` when navigating without losing existing query params.
- **Multiple `<router-outlet>`s:** yes — **named outlets** allow multiple simultaneous views (e.g., a "primary" outlet and an "aux"/"sidebar" outlet):
  ```html
  <router-outlet></router-outlet>
  <router-outlet name="sidebar"></router-outlet>
  ```
  ```ts
  { path: 'chat', component: ChatComponent, outlet: 'sidebar' }
  ```
  Navigate to both simultaneously with `router.navigate([{ outlets: { primary: ['home'], sidebar: ['chat'] } }])`. Common in dashboard/master-detail layouts.
- **`canMatch` vs `canLoad`:**
  - `canLoad` (deprecated in favor of `canMatch`) only controlled whether a **lazy-loaded module** would load.
  - `canMatch` is the modern replacement — it decides whether a route **configuration matches** at all, which also lets you define multiple routes for the *same path* and pick between them based on a condition (e.g., feature flag, role) — something `canActivate` can't do since it runs after matching.
- **Resolvers:** a function (`ResolveFn`) that pre-fetches data **before** the route activates, so the component loads with data already available (no loading spinner flash in the component itself). Registered per-route via `resolve: { user: userResolver }`, accessed via `route.data` or `input()` binding (`withComponentInputBinding()`).

---

## PART 4 — REACTIVE FORMS

### 13. Dynamic Forms (`FormArray`, Stepper Forms)
- **`FormArray`:** a dynamic, resizable collection of `FormControl`/`FormGroup` instances — used when the number of fields isn't fixed (e.g., "add another phone number", multi-step order items).
  ```ts
  addresses = new FormArray<FormGroup>([]);
  addAddress() { this.addresses.push(this.fb.group({ street: '', city: '' })); }
  ```
- **`setControl(index, control)`:** replaces the control at a given index in a `FormArray` (or `FormGroup`) entirely — useful when you need to swap out validators/structure for an existing slot rather than just updating its value.
- **`setValue` vs `patchValue`:**
  - `setValue` requires you to provide a value for **every** control in the group/array — strict, throws if any key is missing. Good for ensuring you never silently miss a field.
  - `patchValue` updates only the fields you provide — partial updates, more forgiving, commonly used when populating a form from an API response that may be partial.
- **Stepper forms:** typically one parent `FormGroup` split visually across steps (e.g., Angular Material `mat-stepper`, or PrimeNG Steps), each step mapped to a nested `FormGroup`, with per-step validation gating the "Next" button.

---

## PART 5 — SIGNALS & CHANGE DETECTION

### 14. Signals
- **What:** a reactive primitive holding a value that notifies consumers on change — `signal()`, read via `mySignal()`.
- **Types:**
  - `signal(initialValue)` — writable.
  - `computed(() => ...)` — derived, read-only, memoized, recalculates only when a dependency changes.
  - Signal inputs (`input()`), model inputs (`model()` — two-way bindable), signal outputs (`output()`).
- **`effect()`:** runs a side effect automatically whenever any signal it reads changes — used for things like syncing to `localStorage`, logging, or imperative DOM work. **Not** meant for state derivation (use `computed` for that) — a common interview trap is asking "why not just use `effect` to set another signal?" (answer: causes unnecessary re-runs/cycles, `computed` is the correct tool since it's pull-based and memoized).
- **Computed Signal vs Effect:**
  - `computed` → **pure, synchronous, returns a value**, lazily recalculated and cached, has no side effects.
  - `effect` → runs **side effects**, doesn't return a value used elsewhere, runs asynchronously after change detection in a microtask, can create infinite loops if misused (writing to a signal it also reads).
- **Why signals over Zone.js/RxJS for local component state:** fine-grained reactivity — Angular can, with signals + zoneless mode, skip full-tree change detection and update only the DOM bindings that actually depend on the changed signal.

### 15. Change Detection
- **How it works (Zone.js-based, the traditional model):** Zone.js monkey-patches async browser APIs (`setTimeout`, `addEventListener`, `Promise`, XHR, etc.). Whenever any of these fire, Zone.js notifies Angular, which runs change detection across the **entire component tree** (top-down), checking bindings for changes via dirty-checking.
- **Role of Zone.js:** it's the mechanism that tells Angular *when* to run change detection — without it, Angular wouldn't know an async event happened. Angular is moving toward **zoneless** change detection (signals-based) where components explicitly notify Angular of changes instead of relying on monkey-patching.
- **Default strategy:** checks every component in the tree on every trigger, regardless of whether that particular component's data actually changed.
- **`OnPush`:** a component only re-checks when:
  1. An `@Input()` **reference** changes (not internal mutation),
  2. An event originates from within the component or its children,
  3. An `Observable` bound via `async` pipe emits,
  4. A signal it reads changes,
  5. Change detection is manually triggered (`ChangeDetectorRef.markForCheck()`).
- **When to use `OnPush`:** almost always, for performance — especially in large lists, dashboards, or any component that receives inputs and doesn't mutate them internally. Forces good practice (immutable data patterns).
- **Interview trap:** "Why doesn't `OnPush` detect a mutated array?" — because Angular compares by reference; mutating `.push()` on the same array reference doesn't trigger anything. You must replace the reference (`this.items = [...this.items, newItem]`) or use signals.

---

## PART 6 — STATE MANAGEMENT (NGRX)

### 16. NgRx Overview
- **Pattern:** Redux-style unidirectional data flow — a single immutable store, updated only via pure reducer functions in response to dispatched actions.
- **Actions:** plain objects describing "what happened" (`createAction('[Cart] Add Item', props<{ item: Item }>())`).
- **Reducers:** pure functions `(state, action) => newState` — no side effects, no mutation (`on(addItem, (state, { item }) => ({ ...state, items: [...state.items, item] }))`).
- **Effects:** handle side effects (API calls) — listen for an action, perform async work, dispatch a new action with the result. Built on RxJS (`createEffect`, typically using `switchMap`/`mergeMap`/`concatMap` depending on the semantics needed).
- **Selectors:** pure, memoized functions to read/derive slices of state (`createSelector`) — memoization avoids recomputation unless the relevant state slice changed.
- **Dispatching:** `store.dispatch(addItem({ item }))` from a component/service; components read state via `store.select(selectCartItems)` (often combined with the `async` pipe or `toSignal`).
- **When to reach for NgRx vs a simpler service+Subject pattern:** NgRx pays off in larger apps with complex, cross-cutting shared state, time-travel debugging needs, and a team that benefits from an enforced, predictable pattern. For smaller apps, a signal-based store or a plain service is often enough — a good senior-level talking point is knowing *when NgRx is overkill*.

---

## PART 7 — AUTH, SECURITY & ROLE-BASED APPS

### 17. Authentication & Authorization
- **Guards:** `CanActivateFn`/`CanMatchFn` functions that check auth state (e.g., token present, role matches) before allowing navigation; redirect to login otherwise.
- **Role-based directives:** a custom structural directive (e.g., `*appHasRole="'admin'"`) that conditionally renders content using `ViewContainerRef`/`TemplateRef`, checking the user's role from an auth service/signal.
- **Role-based guard:** same idea applied at the route level, blocking navigation entirely for unauthorized roles.
- **Dynamic menu based on role:** menu items filtered from a config array against the current user's roles/permissions before rendering (often combined with lazy loading so unauthorized feature code isn't even downloaded).

### 18. Securing an Angular Application
- **Guards** — as above, for route-level protection.
- **CSRF protection:** Angular's `HttpClient` has built-in XSRF support — reads a cookie (default name `XSRF-TOKEN`) and automatically attaches it as a header (`X-XSRF-TOKEN`) on same-origin requests; configure via `withXsrfConfiguration()`.
- **Avoid exposing secrets:** never put API keys/secrets in frontend code or `environment.ts` for anything sensitive — frontend code is always publicly inspectable; secrets belong server-side.
- **Token security:**
  - Prefer **`HttpOnly` cookies** over `localStorage` for storing auth tokens — `localStorage` is readable by any injected JS, making it vulnerable to XSS-based token theft; `HttpOnly` cookies aren't accessible to JS at all.
  - If you must use `localStorage`/`sessionStorage`, mitigate XSS risk aggressively (sanitization, CSP headers, no `innerHTML` with untrusted content).
- **Encryption for storage:** if sensitive data must be cached client-side, encrypt it (though note: any client-side encryption key is also exposed, so this is defense-in-depth, not a true secret store).
- **XSS defense:** Angular auto-sanitizes bindings by default; avoid `bypassSecurityTrustHtml` unless absolutely necessary and the source is trusted.

---

## PART 8 — PERFORMANCE, ARCHITECTURE AT SCALE

### 19. Performance Optimization
- **`trackBy`** (or the built-in track expression in the new `@for` control flow) — gives Angular a unique identity per list item so it can diff efficiently instead of destroying/recreating DOM nodes on every list update.
- **`OnPush`** — see above.
- **Pipes over method calls in templates** — a method call in a template re-executes on *every* change detection cycle; a pure pipe only re-executes when its input reference changes.
- **Lightweight components / smart-dumb (container-presentational) pattern** — keep business logic in services, keep components focused on presentation; makes components easier to test and to make `OnPush`.
- **Lazy loading** feature routes/components (`loadComponent`, `loadChildren`) to shrink the initial bundle.
- **`@defer` blocks** (modern Angular, v17+) — declarative deferred loading of template sections based on triggers (viewport, interaction, idle, timer) without manual lazy-component wiring.
- **Virtual scrolling** (`cdk-virtual-scroll-viewport`) for very long lists.

### 20. Micro Frontends
- **What:** splitting a large frontend into independently built/deployed applications ("micro apps"), composed together at runtime (or build time) into one experience — the frontend equivalent of microservices.
- **Why:** independent team ownership, independent deploy cadence, tech/version isolation (e.g., different apps can even run different Angular versions), reduces the "one giant monorepo blocks everyone" problem at scale.
- **How Angular apps can be structured this way:**
  - **Module Federation** (via `@angular-architects/module-federation`) — Webpack-based runtime composition; a "shell" app dynamically loads remotes exposed by other independently-built Angular apps.
  - **Angular Elements/Web Components** — expose a component as a framework-agnostic custom element that any shell (even non-Angular) can embed.
  - **Native Federation** (newer, esbuild/Vite-friendly alternative to Webpack Module Federation).
  - Considerations to mention: shared dependency versions (avoiding duplicate Angular/RxJS bundles), routing across micro-apps, shared design system, cross-app communication (custom events, shared state via a shell-level store).

### 21. Angular Libraries
- **Angular Elements:** `createCustomElement()` wraps an Angular component as a standard Web Component (`<my-widget>`), usable in any framework or plain HTML.
- **Creating your own library:** `ng generate library my-lib` (via Angular CLI + `ng-packagr`) scaffolds a publishable package with its own `public-api.ts` barrel export.
- **Publishing to npm:** `ng build my-lib` → `cd dist/my-lib` → `npm publish` (after `npm login`); versioning via semver, and typically CI-automated on merge to main/tag push.

### 22. Web Workers
- **What:** run JS on a separate background thread, off the main UI thread — for CPU-heavy work (large data processing, image manipulation, complex calculations) so the UI doesn't freeze/jank.
- **Angular support:** `ng generate web-worker <name>` scaffolds a `.worker.ts` file and the boilerplate to `postMessage`/`onmessage` between main thread and worker.
- **Real-world example:** parsing/transforming a huge CSV/Excel file client-side, or running a heavy search/filter over a large in-memory dataset.

---

## PART 9 — TESTING & TOOLING

### 23. Testing
- **Unit testing:** Jasmine + Karma is the Angular CLI default (being phased toward **Jest** or **Vitest** in newer setups — faster, no real browser needed for most tests). Know `TestBed`, `ComponentFixture`, spies (`jasmine.createSpyObj`), and mocking services/HTTP (`HttpClientTestingModule`/`provideHttpClientTesting`).
- **E2E testing:** **Cypress** is the current common choice (Protractor is deprecated/removed from CLI defaults). Know the difference between unit tests (isolated, fast, mock dependencies) and e2e tests (real browser, full app flow, slower).
- Be ready to discuss: testing pyramid, what you actually unit test (component logic, services, pipes, guards) vs what you leave to e2e (critical user flows).

### 24. Third-Party Library Integration
- Be ready to speak concretely about libraries you've used: **PrimeNG**, **Angular Material**, **AG Grid**, **Syncfusion**, **Chart.js** — theming approach, form integration (`ControlValueAccessor` for custom form controls), performance considerations (e.g., AG Grid virtualization for large datasets), and how you customized/extended a component beyond its defaults.

### 25. Deployment & CI/CD
- **Build:** `ng build --configuration production` — outputs optimized, minified, tree-shaken, hashed-filename bundles.
- **Deployment targets:** static hosting (Azure Static Web Apps, AWS S3 + CloudFront, Netlify/Vercel), or containerized (Docker + Nginx serving the `dist/` output) behind Azure App Service/AWS ECS/Kubernetes.
- **CI/CD pipeline basics:** typical stages — install deps → lint → unit tests → build → (optionally e2e) → deploy to environment (dev/staging/prod) with approval gates.
- **YAML:** Azure Pipelines (`azure-pipelines.yml`) or GitHub Actions (`.github/workflows/*.yml`) define these stages declaratively — know the basic structure (`trigger`, `jobs`, `steps`, `pool`) and be able to sketch a simple pipeline from memory.

---

## PART 10 — TYPESCRIPT & JAVASCRIPT FUNDAMENTALS

### 26. `type` vs `interface`
| | `type` | `interface` |
|---|---|---|
| Can represent | Objects, unions, tuples, primitives, mapped types | Objects/classes shapes only |
| Declaration merging | ❌ Not allowed | ✅ Multiple `interface` declarations with the same name merge |
| Extending | Via intersection (`&`) | Via `extends` |
| Implements (classes) | ✅ | ✅ |

Practical rule of thumb often cited: use `interface` for public object/class shapes (especially library APIs, since they support declaration merging), use `type` when you need unions, tuples, or utility-type composition.

### 27. Generics in TypeScript
- Allow writing reusable, type-safe functions/classes/components that work over a range of types while preserving type information, e.g.:
  ```ts
  function wrap<T>(value: T): { data: T } { return { data: value }; }
  ```
- **Angular relevance:** `HttpClient.get<User>()`, a generic reusable `DataTableComponent<T>`, generic `ApiService<T>` base classes.

### 28. Deep Copy vs Shallow Copy
- **Shallow copy** duplicates only the top-level structure — nested objects/arrays still reference the *same* underlying objects (`{ ...obj }`, `Object.assign()`, `Array.prototype.slice()`).
- **Deep copy** recursively duplicates every nested level so there's no shared reference at any depth (`structuredClone(obj)` — modern native API, or `JSON.parse(JSON.stringify(obj))` — simple but loses functions/`Date`/`undefined`/circular refs, or a deep-clone utility like lodash's `cloneDeep`).
- **Why it matters in Angular:** directly ties to `OnPush`/pure pipes — mutating a nested object inside a shallow-copied structure won't trigger reference-based change detection unless you deep-copy or immutably rebuild the changed path.

### 29. Inheritance in JavaScript
- Prototype-based: every object has an internal `[[Prototype]]` link (accessible via `Object.getPrototypeOf(obj)`, informally `__proto__`) forming a **prototype chain** that property lookups traverse.
- `class`/`extends`/`super` in modern JS is syntactic sugar over this prototype mechanism.
- **`prototype` vs `__proto__`:**
  - `prototype` is a property that exists on **constructor functions/classes** — it's the object that instances will inherit from.
  - `__proto__` (or `Object.getPrototypeOf()`) is the actual link an **instance** holds to its constructor's `prototype` — i.e., `instance.__proto__ === Constructor.prototype`.

### 30. Event Delegation
- Attaching a **single** event listener to a common ancestor instead of individual listeners on many child elements, relying on event **bubbling** and checking `event.target` to determine which child triggered it.
- **Why:** far fewer listeners (memory/performance), automatically works for dynamically added children without rebinding.
- **Angular relevance:** Angular's event binding system + Zone.js patching means this is less manually necessary in Angular templates, but it's a foundational JS concept interviewers still probe, and it underlies things like a single `@HostListener` on a container handling clicks for many dynamic child rows.

### 31. Encapsulation in Angular
- OOP concept: bundling data + behavior and restricting external access (`private`/`protected`/`public` class members in TypeScript).
- **Angular-specific meaning:** **View/style encapsulation** — by default (`ViewEncapsulation.Emulated`), Angular scopes a component's CSS to that component only by adding unique attributes to elements and CSS selectors, so styles don't leak out or get overridden by global styles unintentionally. Other modes: `ViewEncapsulation.None` (styles become global) and `ViewEncapsulation.ShadowDom` (true native Shadow DOM isolation).

### 32. Flexbox (CSS)
- A one-dimensional layout model (row or column) for distributing space and aligning items within a container.
- Container properties: `display: flex`, `flex-direction`, `justify-content` (main-axis alignment), `align-items` (cross-axis alignment), `flex-wrap`, `gap`.
- Item properties: `flex-grow`, `flex-shrink`, `flex-basis` (shorthand `flex`), `align-self`, `order`.
- Interview angle: know when to reach for Flexbox (1D layouts — navbars, toolbars, centering) vs CSS Grid (2D layouts — full page/dashboard structure).

---

## PART 11 — TOOLING / MISC

### 33. `package.json` vs `package-lock.json`
- **`package.json`:** declares your project's *intended* dependency versions (often as ranges, e.g., `^18.0.0`), scripts, metadata.
- **`package-lock.json`:** records the **exact, resolved** version tree (every dependency and sub-dependency) that was actually installed.
- **Why `package-lock.json` matters:** guarantees reproducible installs across machines/CI — without it, two installs at different times could pull different minor/patch versions (since `^`/`~` allow ranges), causing "works on my machine" bugs. Always commit it; never manually edit it.

### 34. AI Tools / Copilot Modes (be ready with a genuine answer, not scripted)
- **GitHub Copilot modes:**
  - **Ask** — conversational Q&A about code, no file edits made directly.
  - **Edit/Agent (edit mode)** — Copilot proposes and applies changes directly to files you specify, iteratively.
  - **Agent mode** — more autonomous: can plan multi-step changes, run terminal commands, iterate across multiple files toward a goal with less step-by-step confirmation.
  - **Plan mode** (also relevant in Claude Code) — the assistant first proposes an approach/plan before making any changes, useful for larger or riskier changes where you want to review the strategy first.
- Be ready to talk about **your own actual experience**: which tools (Copilot, Claude Code, Cursor), what you use them for (boilerplate, code review, debugging, test generation), and where you *don't* trust them blindly (business logic correctness, security-sensitive code).

### 35. Coding Round — Character Frequency
Classic warm-up problem. Two standard approaches:
```ts
function charFrequency(str: string): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const ch of str) {
    freq[ch] = (freq[ch] ?? 0) + 1;
  }
  return freq;
}
```
- **Time complexity:** O(n) — single pass, one hash-map insert/update per character.
- **Space complexity:** O(k) where k = number of distinct characters (bounded, e.g., ≤ 256 for ASCII).
- Follow-ups interviewers often ask: "find the first non-repeating character" (same map, then a second pass preserving insertion order), or "find the most frequent character" (track max while building the map, O(n) single pass, no extra iteration needed).

---

## How to Use This Guide
1. Go topic by topic and explain it out loud in the **what/why/how/when/example/performance** structure from the top.
2. For RxJS operators, actually sketch marble diagrams from memory (`switchMap` vs `concatMap` vs `mergeMap` especially — this is the #1 tripping point at the 4+ YOE level).
3. Have one real project story ready per major area (interceptors, NgRx, performance fix, security incident, CI/CD pipeline you built/fixed) — interviewers weight concrete war stories heavily at this experience level.
4. Re-derive the `OnPush` + signals + change detection story until you can explain it without notes — it comes up in almost every senior Angular interview.
