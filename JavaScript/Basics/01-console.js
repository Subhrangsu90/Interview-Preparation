/*
 * ==============================
 * JavaScript Console API
 * ==============================
 * ==============================
 * The console object provides access to the debugging console in web browsers and Node.js.
 * It offers various methods to log information, warnings, errors, and more.
 * The console object is available in any global scope.
 * ==============================
 */

// --------------------------------
// 1. console.log()
// --------------------------------
// Used for normal informational output.
console.log("Hello World!");
// Output:
// Hello World!

// --------------------------------
// 2. console.warn()
// --------------------------------
// Used to display a warning message.
// Usually appears with a warning icon.
console.warn("This is a warning!");
// Output:
// This is a warning!

// --------------------------------
// 3. console.error()
// --------------------------------
// Used to display errors.
// Useful when debugging failed operations.
console.error("Something went wrong!");
// Output:
// Something went wrong!

// --------------------------------
// 4. console.table()
// --------------------------------
// Displays arrays or objects in a table format.
// Very useful for inspecting structured data.

const users = [
	{ id: 1, name: "Subhrangsu", role: "Developer" },
	{ id: 2, name: "Rahul", role: "Designer" },
	{ id: 3, name: "Priya", role: "Tester" },
];

console.table(users);

// --------------------------------
// 5. console.group()
// --------------------------------
// Groups multiple console messages together.
// The group can be collapsed/expanded in DevTools.

console.group("User Information");

console.log("Name: Subhrangsu");
console.log("Role: Developer");
console.log("Experience: 2+ years");
console.log("Skills: Angular, TypeScript, JavaScript");

console.groupEnd();

// --------------------------------
// 6. console.groupCollapsed()
// --------------------------------
// Same as console.group(), but starts collapsed.

console.groupCollapsed("More Details");

console.log("Framework: Angular");
console.log("Language: TypeScript");
console.log("Runtime: Node.js");
console.log("Database: PostgreSQL");

console.groupEnd();

// --------------------------------
// 7. console.time() / console.timeEnd()
// --------------------------------
// Used to measure how long a piece of code takes to execute.
//
// IMPORTANT:
// The label passed to console.time()
// must be the same label passed to console.timeEnd().

console.time("DNA Matching");

let dnaMatches = 0;

for (let i = 0; i < 100_000; i++) {
	dnaMatches++;
}

console.timeEnd("DNA Matching");

console.log("DNA Matches:", dnaMatches);

// --------------------------------
// 8. console.count()
// --------------------------------
// Counts how many times a particular
// label has been logged.

console.count("Button Click");
console.count("Button Click");
console.count("Button Click");

// Output:
// Button Click: 1
// Button Click: 2
// Button Click: 3

// --------------------------------
// 9. console.countReset()
// --------------------------------
// Resets the counter for a specific label.

console.countReset("Button Click");

console.count("Button Click");

// Output:
// Button Click: 1

// --------------------------------
// 10. console.assert()
// --------------------------------
// Logs a message only when the condition is FALSE.

const age = 15;

console.assert(age >= 18, "User must be 18 or older");

// Output:
// Assertion failed: User must be 18 or older

// --------------------------------
// 11. console.clear()
// --------------------------------
// Clears the console.
//
// Uncomment to use it.
// console.clear();

// --------------------------------
// 12. console.dir()
// --------------------------------
// Displays an object in an interactive,
// inspectable format.

const developer = {
	name: "Subhrangsu",
	skills: ["JavaScript", "TypeScript", "Angular"],
};

console.dir(developer);

// --------------------------------
// 13. console.info()
// --------------------------------
// Used for informational messages.
// Similar to console.log().

console.info("Application started successfully.");

// --------------------------------
// 14. console.trace()
// --------------------------------
// Prints the current call stack.
// Very useful for understanding
// where a function was called from.

function firstFunction() {
	secondFunction();
}

function secondFunction() {
	console.trace("How did we get here?");
}

firstFunction();

// --------------------------------
// 15. console.group() with nesting
// --------------------------------
// Groups can also be nested.

console.group("Application");

console.log("App started");

console.group("Authentication");

console.log("User logged in");
console.log("Token generated");

console.groupEnd();

console.group("Database");

console.log("Database connected");
console.log("Query executed");

console.groupEnd();

console.log("App running");

console.groupEnd();

/*

| Method                     | Purpose                  |
| -------------------------- | ------------------------ |
| `console.log()`            | Normal output            |
| `console.warn()`           | Warning                  |
| `console.error()`          | Error                    |
| `console.info()`           | Information              |
| `console.table()`          | Display data as a table  |
| `console.group()`          | Group related logs       |
| `console.groupCollapsed()` | Collapsed group          |
| `console.time()`           | Start performance timer  |
| `console.timeEnd()`        | Stop performance timer   |
| `console.count()`          | Count executions         |
| `console.assert()`         | Log when condition fails |
| `console.trace()`          | Show call stack          |
| `console.dir()`            | Inspect objects          |

*/
