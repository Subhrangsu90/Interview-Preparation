/*
 * ==============================
 * JavaScript Variables
 * ==============================
 * ==============================
 * A variable is a “named storage” for data. It allows you to store, retrieve, and manipulate data in your programs.
 * In JavaScript, variables can hold different types of data, such as numbers, strings, objects, and more.
 * Variables are declared using the keywords var, let, or const.
 * 1. var: Used to declare variables with function scope. It is function-scoped and can be re-declared and updated.
 * 2. let: Introduced in ES6, it is block-scoped and can be updated but not re-declared within the same scope.
 * 3. const: Also introduced in ES6, it is block-scoped and cannot be updated or re-declared. It is used for constants.
 * ==============================
 */

// --------------------------------
// 1. var
// --------------------------------

console.log("Ship Name before declaration:", shipName); // Output: Ship Name before declaration: undefined because of hoisting

var shipName = "Black Pearl"; // Declaring a variable using var
console.log("Ship Name:", shipName); // Output: Ship Name: Black Pearl

var shipName = "Flying Dutchman"; // Re-declaring the variable
console.log("Updated Ship Name:", shipName); // Output: Updated Ship Name: Flying Dutchman

// --------------------------------
// 2. let
// --------------------------------

// console.log("Captain Name before declaration:", captainName); // Output: Captain Name before declaration: ReferenceError: captainName is not defined because let does not hoist the variable in the same way as var

let captainName = "Jack Sparrow"; // Declaring a variable using let
console.log("Captain Name:", captainName); // Output: Captain Name: Jack Sparrow

captainName = "Davy Jones"; // Updating the variable
console.log("Updated Captain Name:", captainName); // Output: Updated Captain Name: Davy Jones

// --------------- Block Scope -----------------
if (true) {
	let captainName = "Will Turner"; // This captainName is block-scoped and different from the outer captainName
	console.log("Block Scoped Captain Name:", captainName); // Output: Block Scoped Captain Name: Will Turner
}
console.log("Outer Captain Name:", captainName); // Output: Outer Captain Name: Davy Jones

// ---------------- Loop Scope ----------------
for (let i = 0; i < 3; i++) {
	console.log("Loop iteration:", i); // Output: Loop iteration: 0, 1, 2
}
console.log("Final value of i after loop:", typeof i); // Output: Final value of i after loop: undefined because i is block-scoped

for (var j = 0; j < 3; j++) {
	console.log("Loop iteration with var:", j); // Output: Loop iteration with var: 0, 1, 2
}
console.log("Final value of j after loop:", j); // Output: Final value of j after loop: 3 because j is function-scoped

// --------------------------------
// 3. const
// --------------------------------

// console.log("Value of PI before declaration:", PI); // Output: Value of PI before declaration: ReferenceError: PI is not defined
const PI = 3.14159; // Declaring a constant
console.log("Value of PI:", PI); // Output: Value of PI: 3.14159

// PI = 3.14; // TypeError: Assignment to constant variable.

// ----------------- Objects and Arrays -----------------
const shipDetails = {
	name: "Black Pearl",
	captain: "Jack Sparrow",
	crew: 100,
};

console.log("Ship Details:", shipDetails); // Output: Ship Details: { name: 'Black Pearl', captain: 'Jack Sparrow', crew: 100 }

// Modifying properties of a const object is allowed
shipDetails.crew = 150;
console.log("Updated Ship Details:", shipDetails); // Output: Updated Ship Details: { name: 'Black Pearl', captain: 'Jack Sparrow', crew: 150 }

// shipDetails = { // TypeError: Assignment to constant variable.
// 	name: "Flying Dutchman",
// 	captain: "Davy Jones",
// 	crew: 200,
// };

// Modifying properties of a const object is allowed, but completely re-refrancing not allowed.

const shipNames = ["Black Pearl", "Flying Dutchman", "Queen Anne's Revenge"];
console.log("Ship Names:", shipNames); // Output: Ship Names: [ 'Black Pearl', 'Flying Dutchman', "Queen Anne's Revenge" ]

shipNames.push("Jolly Roger"); // Modifying the array is allowed
console.log("Updated Ship Names:", shipNames); // Output: Updated Ship Names: [ 'Black Pearl', 'Flying Dutchman', "Queen Anne's Revenge", 'Jolly Roger' ]

shipNames[0] = "HMS Victory"; // Modifying an element of the array is allowed
console.log("Modified Ship Names:", shipNames); // Output: Modified Ship Names: [ 'HMS Victory', 'Flying Dutchman', "Queen Anne's Revenge", 'Jolly Roger' ]

// shipNames = ["HMS Victory"]; // TypeError: Assignment to constant variable.
