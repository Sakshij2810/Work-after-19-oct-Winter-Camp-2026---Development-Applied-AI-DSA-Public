/*
 * Write 3 different functions that return promises that resolve after t1, t2, and t3 seconds respectively.
 * Write a function that uses the 3 functions to wait for all 3 promises to resolve using Promise.all,
 * Return a promise.all which return the time in milliseconds it takes to complete the entire operation.
 */

/*
Note: 
- Use when operations are independent and you need all their results before continuing.
- Total duration: approximately the duration of the slowest operation. ( T = max(t1,t2,t3))
*/

function wait1(t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(t);
    }, t * 1000);
  });
}

function wait2(t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(t);
    }, t * 1000);
  });
}

function wait3(t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(t);
    }, t * 1000);
  });
}

function calculateTime(t1, t2, t3) {
  let startTime = Date.now();

  return Promise.all([wait1(t1), wait2(t2), wait3(t3)]).then(() => {
    let endTime = Date.now();
    let elaspedTime = endTime - startTime;

    return elaspedTime;
  });
}

// calculateTime(1000, 2000, 3000).then((time) => console.log(time));

module.exports = calculateTime;
