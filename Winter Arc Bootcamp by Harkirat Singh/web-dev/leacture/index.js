import fs from "fs";

// Q1
// function readFromAWriteToB(inputFile, outputFile, cb) {
//   fs.readFile(inputFile, "utf-8", (err, data) => {
//     if (err) {
//       cb(err);
//     } else {
//       fs.writeFile(outputFile, data.toUpperCase(), (err, data) => {
//         if (err) {
//           cb(err);
//         } else {
//           cb(null, "");
//         }
//       });
//     }
//   });
// }

// readFromAWriteToB("a.txt", "b.txt", (err, data) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("done!!!");
//   }
// });

// Q2

// function readTimer(n, m, path, cb) {
//   fs.readFile(path, "utf-8", (err, data) => {
//     if (err) {
//       cb(err);
//     } else {
//       setTimeout(() => {
//         fs.writeFile(path, data.toUpperCase(), (err, data) => {
//           if (err) {
//             cb(err);
//           } else {
//             setTimeout(() => {
//               cb(null, "");
//             }, m);
//           }
//         });
//       }, n);
//     }
//   });
// }

// readTimer(2000, 3000, "a.txt", (err, data) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("done!!!!");
//   }
// });

// Q3

// function createCode(filePath, cb) {
//   fs.readFile(filePath, "utf-8", (err, data) => {
//     if (err) {
//       cb(err);
//     } else {
//       const parsedData = JSON.parse(data);
//       let arrLength = parsedData.length;
//       let counter = 0;

//       parsedData.forEach(({ path, contents }) => {
//         fs.writeFile(path, contents, (err) => {
//           if (err) {
//             cb(err);
//           } else {
//             counter++;

//             if (counter == arrLength) {
//               cb(null, "");
//             }
//           }
//         });
//       });
//     }
//   });
// }

// createCode("a.txt", (err, data) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("done!!!!");
//   }
// });

// ----------------- promisified ----------------- 1. return promise 2. inside promise do standard usage of function 3. if err : reject, else : resolve

// function readFilePromisified(path, unicode) {
//   return new Promise((resolve, reject) => {
//     fs.readFile(path, unicode, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// }

// readFilePromisified("a.txt", "utf-8")
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));

// function setTimeoutPromisified(ms) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve();
//     }, ms);
//   });
// }

// setTimeoutPromisified(3000).then(() => {
//   console.log("hi there");
// });

console.log("1 start"); // synchronus

// async
setTimeout(() => {
  console.log("3 started");
}, 3000);

Promise.resolve(console.log("4 started")); // async

console.log("2 start"); // synchronus
