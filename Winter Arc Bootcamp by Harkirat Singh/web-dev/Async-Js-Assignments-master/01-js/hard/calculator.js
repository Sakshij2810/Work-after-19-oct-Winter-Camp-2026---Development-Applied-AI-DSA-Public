/*
  Implement a class `Calculator` having below methods
    - initialise a result variable in the constructor and keep updating it after every arithmetic operation
    - add: takes a number and adds it to the result
    - subtract: takes a number and subtracts it from the result
    - multiply: takes a number and multiply it to the result
    - divide: takes a number and divide it to the result
    - clear: makes the `result` variable to 0
    - getResult: returns the value of `result` variable
    - calculate: takes a string expression which can take multi-arithmetic operations and give its result
      example input: `10 +   2 *    (   6 - (4 + 1) / 2) + 7`
      Points to Note: 
        1. the input can have multiple continuous spaces, you're supposed to avoid them and parse the expression correctly
        2. the input can have invalid non-numerical characters like `5 + abc`, you're supposed to throw error for such inputs

  Once you've implemented the logic, test your code by running
  - `npm run test-calculator`
*/

class Calculator {
  constructor() {
    this.result = 0;
  }
  add(num) {
    this.result += num;
  }
  subtract(num) {
    this.result -= num;
  }
  multiply(num) {
    this.result *= num;
  }
  divide(num) {
    if (num === 0) throw new Error("Cannot divide by zero");
    this.result /= num;
  }
  clear() {
    this.result = 0;
  }
  getResult() {
    return this.result;
  }

  calculate(expression) {
    if (typeof expression !== "string" || expression.trim() === "") {
      throw new Error("Invalid expression");
    }

    // Allow only numbers, arithmetic operators, parentheses and whitespace.
    if (!/^[\d+\-*/().\s]+$/.test(expression)) {
      throw new Error("Invalid characters in expression");
    }

    // Validate and evaluate using JavaScript's expression parser.
    // The character whitelist above prevents arbitrary code execution.

    // approach 1: Function('"use strict"; return (' + expression + ")")();
    /*
    example:

    function () {
        "use strict";
        return (10 + 2 * 5);
    }
     */

    const result = Function('"use strict"; return (' + expression + ")")();

    // approach 2: eval(expression);
    // const result = eval(expression);

    if (typeof result !== "number" || !Number.isFinite(result)) {
      throw new Error("Invalid expression or non-finite result");
    }

    this.result = result;
    return this.result;
  }
}

const calc = new Calculator();

console.log(calc.calculate("2 + 3 * 4")); // 14
console.log(calc.calculate("(15 + 3) / 6")); // 3
console.log(calc.calculate("10 - (4 + 2)")); // 4
console.log(calc.calculate("(2 + 3) * (6 - (4 + 1) / 2) + 7")); // 24.5

module.exports = Calculator;
