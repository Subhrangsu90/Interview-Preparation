/* ============================================================
 * 📘 JAVASCRIPT VARIABLES — COMPLETE NOTES
 * ============================================================
 *
 * WHAT is a variable?
 * --------------------
 * A variable is a "named storage" (a labeled box) for data.
 * It lets you store, retrieve, update, and reuse data anywhere
 * in your program instead of typing raw values again and again.
 *
 * WHY do we need variables?
 * --------------------------
 * - To store data temporarily in memory (numbers, text, objects...)
 * - To make code readable   (age vs 25)
 * - To make code reusable   (change value in ONE place)
 * - To make code dynamic    (values can change while program runs)
 *
 * WHERE are variables declared?
 * -------------------------------
 * Variables can be declared:
 *   - At the top of a file        (global scope)
 *   - Inside a function           (function scope)
 *   - Inside a block { }          (block scope: if, for, while, {})
 *
 * HOW do we declare a variable? (3 keywords)
 * --------------------------------------------
 *   var    -> old way (ES5 and before)  -> function-scoped
 *   let    -> modern way (ES6+)         -> block-scoped, updatable
 *   const  -> modern way (ES6+)         -> block-scoped, NOT reassignable
 *
 * ============================================================
 */

/* ============================================================
 * 🔹 SECTION 1: var
 * ============================================================
 *
 * WHAT: var is the original way to declare variables in JS (since 1995).
 *
 * KEY PROPERTIES:
 *   1. Function-scoped   -> only visible inside the function it's declared in
 *                           (NOT block-scoped -> visible outside if/for blocks)
 *   2. Can be RE-DECLARED -> declaring the same var name twice is allowed
 *   3. Can be updated     -> value can change anytime
 *   4. Gets HOISTED       -> moved to the top of its scope during
 *                           compilation, initialized as `undefined`
 *
 * WHY avoid var in modern JS?
 *   - It leaks outside blocks (if/for), causing accidental bugs
 *   - Re-declaration can silently overwrite variables
 *   - Hoisting behavior is confusing/unsafe for beginners
 */

console.log("Ship Name before declaration:", shipName);
// Output: undefined
// WHY? Because of HOISTING (explained in detail in Section 4 below).
// JS moves "var shipName;" to the top automatically, but NOT its value.
// So at this point, shipName EXISTS but has no value yet -> undefined.

var shipName = "Black Pearl"; // Declaring + assigning a value
console.log("Ship Name:", shipName);
// Output: Black Pearl

var shipName = "Flying Dutchman"; // Re-declaring the SAME variable (allowed with var)
console.log("Updated Ship Name:", shipName);
// Output: Flying Dutchman
// NOTE: With `let` or `const`, doing this again would throw:
//       SyntaxError: Identifier 'shipName' has already been declared

/* ============================================================
 * 🔹 SECTION 2: let
 * ============================================================
 *
 * WHAT: let was introduced in ES6 (2015) as a safer replacement for var.
 *
 * KEY PROPERTIES:
 *   1. Block-scoped        -> only exists inside the { } it was created in
 *   2. CANNOT be re-declared in the same scope (throws SyntaxError)
 *   3. CAN be updated/reassigned
 *   4. Gets hoisted too, BUT stays in the "Temporal Dead Zone" (TDZ)
 *      until the line where it's declared is executed
 *      -> accessing it before declaration throws a ReferenceError
 *         (NOT undefined like var)
 */

// console.log("Captain Name before declaration:", captainName);
// Output if uncommented: ReferenceError: Cannot access 'captainName' before initialization
// WHY? let is hoisted but placed in the "Temporal Dead Zone" (TDZ) —
// it exists in memory but JS blocks access until the declaration line runs.

let captainName = "Jack Sparrow"; // Declaring using let
console.log("Captain Name:", captainName);
// Output: Jack Sparrow

captainName = "Davy Jones"; // Updating (reassigning) is allowed
console.log("Updated Captain Name:", captainName);
// Output: Davy Jones

// ---------------- Block Scope Example ----------------
// WHAT is block scope? A "block" is anything inside { } — if, for, while, etc.
// A `let`/`const` declared inside a block ONLY exists inside that block.
if (true) {
	let captainName = "Will Turner";
	// This is a DIFFERENT variable from the outer captainName above,
	// because it's declared inside a NEW block scope { }.
	console.log("Block Scoped Captain Name:", captainName);
	// Output: Will Turner
}
console.log("Outer Captain Name:", captainName);
// Output: Davy Jones
// WHY? The outer captainName was never touched — the inner one
// only lived and died inside the if-block.

// ---------------- Loop Scope Example (let vs var) ----------------
// WHY THIS MATTERS: This is the #1 real-world reason `let` replaced `var`.

for (let i = 0; i < 3; i++) {
	console.log("Loop iteration:", i);
}
// Output: 0, 1, 2
console.log("Final value of i after loop:", typeof i);
// Output: undefined
// WHY? `i` was declared with `let` INSIDE the for(...) parentheses,
// which is treated as a block. Once the loop ends, `i` is destroyed —
// it does not exist outside the loop at all (typeof safely returns "undefined").

for (var j = 0; j < 3; j++) {
	console.log("Loop iteration with var:", j);
}
// Output: 0, 1, 2
console.log("Final value of j after loop:", j);
// Output: 3
// WHY? `var` is FUNCTION-scoped, not block-scoped.
// The for-loop is just a block, so `j` "leaks" out of the loop
// and keeps its final value (3) even after the loop finishes.

/* ============================================================
 * 🔹 SECTION 3: const
 * ============================================================
 *
 * WHAT: const (short for "constant") was also introduced in ES6.
 *
 * KEY PROPERTIES:
 *   1. Block-scoped        -> same as let
 *   2. CANNOT be re-declared in the same scope
 *   3. CANNOT be reassigned after declaration (must be assigned a value
 *      at the time of declaration — it cannot be declared empty)
 *   4. Also hoisted into the Temporal Dead Zone (like let)
 *
 * IMPORTANT MISCONCEPTION:
 *   const does NOT make the VALUE immutable — it only makes the
 *   VARIABLE BINDING immutable (you can't reassign the variable
 *   to point to something new). If the value is an object/array,
 *   its CONTENTS can still be changed.
 */

// console.log("Value of PI before declaration:", PI);
// Output if uncommented: ReferenceError: Cannot access 'PI' before initialization
// (Same TDZ reason as let)

const PI = 3.14159; // Must assign a value immediately — const cannot be left empty
console.log("Value of PI:", PI);
// Output: 3.14159

// PI = 3.14;
// Output if uncommented: TypeError: Assignment to constant variable.
// WHY? Once bound, a const variable can never point to a new value.

// ----------------- const with Objects -----------------
// WHY this works: `shipDetails` is a constant REFERENCE (a fixed address
// in memory pointing to an object). The object's properties can still
// change — only the reference itself is locked.

const shipDetails = {
	name: "Black Pearl",
	captain: "Jack Sparrow",
	crew: 100,
};
console.log("Ship Details:", shipDetails);
// Output: { name: 'Black Pearl', captain: 'Jack Sparrow', crew: 100 }

shipDetails.crew = 150; // ✅ Allowed: modifying a PROPERTY, not reassigning the variable
console.log("Updated Ship Details:", shipDetails);
// Output: { name: 'Black Pearl', captain: 'Jack Sparrow', crew: 150 }

// shipDetails = { name: "Flying Dutchman", captain: "Davy Jones", crew: 200 };
// Output if uncommented: TypeError: Assignment to constant variable.
// WHY? This tries to make `shipDetails` point to a BRAND NEW object,
// which breaks the const rule (reassigning the reference itself).

// ----------------- const with Arrays -----------------
// Same rule as objects: array CONTENTS can change, but the variable
// itself can never be reassigned to a new array.

const shipNames = ["Black Pearl", "Flying Dutchman", "Queen Anne's Revenge"];
console.log("Ship Names:", shipNames);
// Output: [ 'Black Pearl', 'Flying Dutchman', "Queen Anne's Revenge" ]

shipNames.push("Jolly Roger"); // ✅ Allowed: modifying array contents
console.log("Updated Ship Names:", shipNames);
// Output: [ 'Black Pearl', 'Flying Dutchman', "Queen Anne's Revenge", 'Jolly Roger' ]

shipNames[0] = "HMS Victory"; // ✅ Allowed: modifying an element by index
console.log("Modified Ship Names:", shipNames);
// Output: [ 'HMS Victory', 'Flying Dutchman', "Queen Anne's Revenge", 'Jolly Roger' ]

// shipNames = ["HMS Victory"];
// Output if uncommented: TypeError: Assignment to constant variable.
// WHY? This reassigns the WHOLE array reference — not allowed with const.

/* ============================================================
 * 🔹 SECTION 4: SCOPE — Deep Explanation
 * ============================================================
 *
 * WHAT is scope?
 * -----------------
 * Scope determines WHERE in your code a variable is accessible.
 * Think of scope as a set of nested "rooms" — code inside an inner
 * room can see variables from outer rooms, but code in an outer
 * room CANNOT see variables declared inside an inner room.
 *
 * WHY does scope matter?
 * -------------------------
 * - Prevents naming collisions (two variables with the same name
 *   in different scopes don't clash)
 * - Keeps data private/contained to where it's needed
 * - Helps memory management (variables are cleaned up once their
 *   scope ends and nothing references them anymore)
 *
 * TYPES OF SCOPE IN JAVASCRIPT:
 *
 *   1. GLOBAL SCOPE
 *      - Declared outside any function or block
 *      - Accessible from ANYWHERE in the program
 *      - Example:
 *          var oceanName = "Atlantic"; // global
 *          function showOcean() {
 *              console.log(oceanName); // ✅ accessible here too
 *          }
 *
 *   2. FUNCTION SCOPE
 *      - Created every time a function runs
 *      - Variables declared with var/let/const INSIDE a function
 *        are only visible inside that function
 *      - Example:
 *          function sailShip() {
 *              var speed = "fast"; // function-scoped
 *              console.log(speed); // ✅ accessible
 *          }
 *          // console.log(speed); ❌ ReferenceError: speed is not defined
 *
 *   3. BLOCK SCOPE
 *      - Created by any { } — if, for, while, or a standalone block
 *      - ONLY applies to let and const (NOT var, which ignores blocks)
 *      - Example:
 *          {
 *              let treasure = "gold";
 *              console.log(treasure); // ✅ accessible
 *          }
 *          // console.log(treasure); ❌ ReferenceError: treasure is not defined
 *
 *   4. LEXICAL SCOPE (a.k.a. Static Scope)
 *      - Inner functions/blocks automatically have access to variables
 *        declared in their OUTER (parent) scope, based on WHERE the
 *        code is physically written, not where it's called from.
 *      - Example:
 *          function outerCrew() {
 *              let captain = "Jack Sparrow";
 *              function innerCrew() {
 *                  console.log(captain); // ✅ can "see" outer variable
 *              }
 *              innerCrew();
 *          }
 *
 * SCOPE CHAIN:
 *   When JS looks for a variable, it searches:
 *     current block scope -> outer block scope -> function scope
 *     -> global scope -> (not found = ReferenceError)
 *   This search path is called the "scope chain".
 *
 * VARIABLE SHADOWING:
 *   When an inner scope declares a variable with the SAME name as
 *   an outer scope, the inner one "shadows" (temporarily hides)
 *   the outer one, ONLY within that inner scope.
 *   (This is exactly what happened with `captainName` inside the
 *   if-block in Section 2 above — the inner `let captainName`
 *   shadowed the outer one without changing it.)
 */

/* ============================================================
 * 🔹 SECTION 5: TEMPORAL DEAD ZONE (TDZ) — Deep Explanation
 * ============================================================
 *
 * WHAT is the Temporal Dead Zone?
 * ----------------------------------
 * The TDZ is the time period between:
 *   (a) the start of a variable's scope (where it gets hoisted to), AND
 *   (b) the exact line where it is actually declared/initialized
 * During this window, the variable technically EXISTS in memory
 * (because of hoisting) but JS BLOCKS you from reading or writing
 * to it. Trying to access it throws a ReferenceError.
 *
 * WHY does the TDZ exist?
 * --------------------------
 * It exists ONLY for `let` and `const` (never for `var`). It was
 * introduced to catch bugs early — instead of silently giving you
 * `undefined` (like var does), JS forces you to declare a variable
 * BEFORE using it, making code more predictable and easier to debug.
 *
 * WHERE does the TDZ apply?
 * ----------------------------
 * Every `let`/`const` variable has its own TDZ, starting from the
 * top of its enclosing block/scope and ending at its declaration line.
 *
 * EXAMPLE:
 *   {
 *       // <-- TDZ for `treasure` starts here (top of block)
 *       console.log(treasure);
 *       // ❌ ReferenceError: Cannot access 'treasure' before initialization
 *       let treasure = "gold";
 *       // <-- TDZ for `treasure` ends here (declaration line)
 *       console.log(treasure); // ✅ "gold" — safe to use now
 *   }
 *
 * TDZ vs var (side-by-side):
 *   console.log(a); // undefined   (var: hoisted + auto-initialized)
 *   var a = 1;
 *
 *   console.log(b); // ReferenceError (let: hoisted but in TDZ)
 *   let b = 2;
 *
 * console.log(typeof undeclaredVar); // "undefined" — no error
 * console.log(typeof tdzVar); // ReferenceError: tdzVar is not defined — TDZ variables are the ONE exception
 * let tdzVar = 5;
 *
 * WHY THIS IS USEFUL:
 *   The TDZ turns a silent, hard-to-spot bug (using a variable
 *   before it has a real value, which happens with var) into a
 *   loud, immediate error — so you catch the mistake instantly
 *   instead of chasing a mysterious `undefined` later in your code.
 *
 * KEY TAKEAWAY:
 *   Hoisting happens for var, let, AND const.
 *   The DIFFERENCE is what happens during that "gap" before the
 *   declaration line:
 *     var          -> usable immediately, value = undefined
 *     let / const  -> NOT usable at all until declared (TDZ)
 */

/* ============================================================
 * 🔹 SECTION 6: HOISTING — Deep Explanation
 * ============================================================
 *
 * WHAT is hoisting?
 * -------------------
 * Before running your code, the JavaScript engine does a "compilation"
 * pass where it scans the whole scope and registers all variable and
 * function declarations in memory BEFORE actually executing any code
 * line by line. This behavior is called HOISTING — as if the
 * declarations were "lifted" (hoisted) to the top of their scope.
 *
 * WHY does hoisting exist?
 * --------------------------
 * JavaScript is NOT purely top-to-bottom interpreted like some languages.
 * It has a two-phase process:
 *   Phase 1 (Memory Creation / Compile Phase):
 *       - Scans code, finds all `var`, `let`, `const`, and function declarations
 *       - Allocates memory for them BEFORE execution starts
 *   Phase 2 (Execution Phase):
 *       - Runs the code line by line, assigning actual values
 *
 * HOW each keyword behaves differently during hoisting:
 *
 *   var:
 *     - Hoisted AND auto-initialized with `undefined`
 *     - So accessing it before the declaration line gives `undefined`,
 *       NOT an error (as shown in Section 1's shipName example)
 *
 *   let / const:
 *     - Hoisted, but NOT initialized
 *     - They sit in the "Temporal Dead Zone" (TDZ) — a period from the
 *       start of the block until the declaration line executes
 *     - Accessing them in the TDZ throws:
 *       ReferenceError: Cannot access 'x' before initialization
 *     - This is actually SAFER than var's silent `undefined` behavior,
 *       because it forces you to declare before use.
 *
 *   function declarations:
 *     - Fully hoisted WITH their entire body/definition
 *     - Can be called before they appear in the code
 *
 * VISUAL SUMMARY (what the engine effectively does behind the scenes):
 *
 *   // Your code:
 *   console.log(shipName);   // undefined
 *   var shipName = "Black Pearl";
 *
 *   // What JS engine does internally:
 *   var shipName;             // <-- hoisted declaration (memory phase)
 *   console.log(shipName);    // undefined (declared, not yet assigned)
 *   shipName = "Black Pearl"; // <-- assignment happens here (execution phase)
 */

/* ============================================================
 * 🔹 SECTION 7: COMPARISON TABLE
 * ============================================================
 *
 *  Feature              |   var          |   let          |   const
 *  ---------------------|----------------|----------------|----------------
 *  Scope                | Function-scoped| Block-scoped   | Block-scoped
 *  Re-declaration        | ✅ Allowed     | ❌ Not allowed | ❌ Not allowed
 *  Re-assignment         | ✅ Allowed     | ✅ Allowed     | ❌ Not allowed
 *  Hoisting               | ✅ Yes (as undefined) | ✅ Yes (TDZ) | ✅ Yes (TDZ)
 *  Must initialize at declaration | ❌ No  | ❌ No          | ✅ Yes
 *  Has a Temporal Dead Zone (TDZ) | ❌ No  | ✅ Yes         | ✅ Yes
 *  Attached to global `window` obj (browser, top-level) | ✅ Yes | ❌ No | ❌ No
 *  Introduced in          | ES1 (1997)    | ES6 (2015)     | ES6 (2015)
 *  Recommended usage       | Avoid (legacy)| Use for values that change | Use by default for everything else
 */

/* ============================================================
 * 🔹 SECTION 8: WHEN TO USE WHAT (Best Practice)
 * ============================================================
 *
 *   ✅ Use `const` by DEFAULT for everything
 *      (objects, arrays, functions, values that won't be reassigned)
 *
 *   ✅ Use `let` ONLY when you know the variable's value
 *      will change later (counters, loop variables, flags)
 *
 *   ❌ Avoid `var` in modern JavaScript
 *      (kept only for understanding legacy codebases)
 *
 *   RULE OF THUMB:
 *     "const unless you need let. Never var."
 */
