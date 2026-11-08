//✅
// Problem Description – ensureAsync(fn)

// 1. You are required to write a function named ensureAsync that takes another function fn as input.
// 2. The goal is to guarantee that calling fn always returns a Promise, even if fn is synchronous.
// Using the async keyword is recommended, as it automatically wraps return values and errors in a Promise.

//1.
function ensureAsync(fn) {
  return async function (...args) {
    return await fn(...args);
  };
}

// example

// const syncFn = (a, b) => a + b;
// const asyncFn = ensureAsync(syncFn);

// const result = asyncFn(2, 3);

// expect(result).toBeInstanceOf(Promise);

// // // await expect(result).resolves.toBe(5);

module.exports = ensureAsync;
