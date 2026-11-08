import fs from "fs";

//------------------------ way 1 : readFile using normal callback

// function callback(err, data) {
//   if (err) {
//     console.log("error while reading file");
//   } else {
//     console.log(data);
//   }
// }

// fs.readFile("a.txt", "utf-8", callback);

//------------------------ way 2 : readFile using promisified version

// function fsReadFilePromisified(filePath, encoding) {
//   return new Promise((resolve, reject) => {
//     fs.readFile(filePath, encoding, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// }

// function callback(data) {
//   console.log(data);
// }

// function callbackErr(err) {
//   console.log("error while reading the file");
// }

// fsReadFilePromisified("a.txt", "utf-8").then(callback).catch(callbackErr);

// ------------------------ synchronous JavaScript -> Micro-Task -> Macro-task

// console.log("1. start code");

// setTimeout(() => {
//   console.log("2. macrotask");
// }, 500);

// Promise.resolve().then(() => {
//   console.log("3. microtask");
// });

// console.log("4. end code");

// // output -> 1, 4, 3, 2

// ------------------------ setTimeoutPromisified
// function setTimeoutPromisified(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// function callback() {
//   console.log("hello there");
// }

// // setTimeout(callback, 3000);
// setTimeoutPromisified(3000).then(callback);

// ------------------------ fetch normal
// fetch("https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json")
//   .then((res) => {
//     if (!res.ok) {
//       throw new Error(`HTTP error: ${response.status}`);
//     }

//     return res.json();
//   })
//   .then((data) => console.log(data))
//   .catch((err) => console.error("Error fetching data:", error));

// ------------------------ fetch promisified
function fetchPromisified(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        return res.json();
      })
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

fetchPromisified(
  "https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json",
)
  .then((data) => console.log(data))
  .catch((err) => console.log("Error:", err.message));

// ------------------------ callback hell
// setTimeout(() => {
//   console.log("1st stage"); // this will be called after 3 sec
//   setTimeout(() => {
//     console.log("2nd stage"); // this will be called after 3 + 1 sec
//     setTimeout(() => {
//       console.log("3rd stage"); // this will be called after 3 + 1 + 5 sec
//     }, 5000);
//   }, 1000);
// }, 3000);

// // ------------------------ promise chaining to solve callback hell issue
// function setTimeoutPromisified(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// setTimeoutPromisified(3000)
//   .then(() => {
//     console.log("1st stage");
//     return setTimeoutPromisified(1000);
//   })
//   .then(() => {
//     console.log("2nd stage");
//     setTimeoutPromisified(5000);
//   })
//   .then(() => {
//     console.log("3rd stage");
//   });
