/*
 * Write 3 different functions that return promises that resolve after t1, t2, and t3 seconds respectively.
 * Write a function that sequentially calls all 3 of these functions in order.
 * Return a promise chain which return the time in milliseconds it takes to complete the entire operation.
 * Compare it with the results from 3-promise-all.js
 */

/*
Note: 
1. Use when each operation must wait for the previous one, or when the next operation depends on the previous result.
2. Total duration: approximately the sum of the delays. ( T = t1 + t2 + t3 = 6000 ms)
 */

function wait1(t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, t * 1000);
  });
}

function wait2(t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, t * 1000);
  });
}

function wait3(t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, t * 1000);
  });
}

function calculateTime(t1, t2, t3) {
  let startTime = Date.now();
  return wait1(t1)
    .then(() => {
      return wait2(t2);
    })
    .then(() => {
      return wait3(t3);
    })
    .then(() => {
      let endTime = Date.now();
      let elaspedTime = endTime - startTime;
      return elaspedTime;
    });
}

// calculateTime(1000, 2000, 3000).then((time) => console.log(time));

module.exports = calculateTime;
