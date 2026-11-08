/*
Write a function that calculates the time (in seconds) it takes for the JS code to calculate sum from 1 to n, given n as the input.
Try running it for
1. Sum from 1-100
2. Sum from 1-100000
3. Sum from 1-1000000000
Hint - use Date class exposed in JS
*/

function calculateTime(n) {
  let startTime = Date.now();

  for (let i = 1; i <= n; i++) {}

  let endTime = Date.now();

  return (endTime - startTime) / 1000;
}

console.log("n = 1000000000:", calculateTime(10000000000), "seconds");

console.log("n = 100:", calculateTime(100), "seconds");
console.log("n = 100000:", calculateTime(100000), "seconds");
console.log("n = 1000000000:", calculateTime(1000000000), "seconds");
