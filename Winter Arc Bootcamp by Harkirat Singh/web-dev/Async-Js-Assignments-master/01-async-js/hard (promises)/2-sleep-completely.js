/*
 * Write a function that halts the JS thread (make it busy wait) for a given number of milliseconds.
 * During this time the thread should not be able to do anything else.
 * the function should return a promise just like before
 */

// provided code format
function sleep(milliseconds) {
  return new Promise((resolve, reject) => {
    let startTime = Date.now(); // 1000 (example)

    console.log("------------- ");
    // Keep the thread busy
    while (Date.now() - startTime < milliseconds) {
      console.log("while loop running");
    }

    console.log("1 started ");
    console.log("2 started ");

    resolve();
  });
}

sleep(5000);
module.exports = sleep;

// sakshi's code
// function sleep(ms) {
//   return new Promise((resolve, reject) => {
//     let startTime = Date.now(); // 1000 (example)

//     // Keep the thread busy
//     while (Date.now() - startTime < ms) {
//       //   console.log(Date.now()); // 1000 or greater
//       //   console.log(startTime); // 1000
//     }
//  resolve();
//   });
// }

// sleep(2000).then(() => console.log("Sleep finished"));

// console.log("1");
// console.log("2");
