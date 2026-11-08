//✅
// Problem Description – delay(ms, value, callback)
//
// 1. You are required to write a function named delay that takes a time duration in milliseconds, a value, and a callback function.
// 2. The function should wait for the given time
//3.  and then invoke the callback  with `null` as the first argument and the provided value as the second argument.

// 1.
function delay(ms, value, callback) {
  //2.
  setTimeout(() => {
    callback(null, value); //3.
  }, ms);
}

// example:

// delay(3000, "hi sakshi after 3 sec", (err, data) => {
//   console.log(data);
// });
module.exports = delay;
