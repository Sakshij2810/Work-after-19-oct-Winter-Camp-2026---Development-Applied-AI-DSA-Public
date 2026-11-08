/*
    Write a function that returns a promise that resolves after n seconds have passed, where n is passed as an argument to the function.
*/

// // provided code
function wait(n) {
  let p = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, n * 1000);
  });
  return p;
}

module.exports = wait;

// sakshi's code : setTimeout promisified
// function setTimeoutPromisified(ms) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve();
//     }, ms);
//   });
// }

// setTimeoutPromisified(3000).then(() => console.log("resolve"));
