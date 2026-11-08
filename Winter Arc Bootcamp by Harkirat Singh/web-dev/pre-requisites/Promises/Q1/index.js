import fs from "fs";

// Q: write clean file function

// approach 1 - synchronus callback

// function cleanFileSync(filePath) {
//   const contents = fs.readFileSync(filePath, "utf-8");
//   const trimmedContent = contents.trim();
//   fs.writeFileSync(filePath, trimmedContent);
// }

// cleanFileSync("a.txt");

// approach 2 - asynchronus callback
// function cleanFile(filePath, cb) {
//   fs.readFile(filePath, "utf-8", (err, data) => {
//     if (err) {
//       console.log("error occured while reading file: ", err);
//     } else {
//       const trimedData = data.trim();
//       fs.writeFile(filePath, trimedData, () => {
//         cb();
//       });
//     }
//   });
// }

// cleanFile("a.txt", () => {
//   console.log("done cleaning file!");
// });

// approach 3 - promisified version
// function cleanFilePromisified(filePath) {
//   return new Promise((resolve, reject) => {
//     fs.readFile(filePath, "utf-8", (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         const trimedData = data.trim();
//         fs.writeFile(filePath, trimedData, (err) => {
//           if (err) {
//             reject();
//           } else {
//             resolve();
//           }
//         });
//       }
//     });
//   });
// }

// cleanFilePromisified("a.txt").then(() => {
//   console.log("done cleaning file!");
// });

// approach 4 - async await

function cleanFilePromisified(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        const trimedData = data.trim();
        fs.writeFile(filePath, trimedData, (err) => {
          if (err) {
            reject();
          } else {
            resolve();
          }
        });
      }
    });
  });
}

// using promise function inside async - simple syntax
async function cleanManyFiles(prefix) {
  await cleanFilePromisified(prefix + "1.txt");
  await cleanFilePromisified(prefix + "2.txt");
  await cleanFilePromisified(prefix + "3.txt");
}

cleanManyFiles("a")
  .then(() => {
    console.log("cleaned all 3 files");
  })
  .catch((err) => {
    console.log(err);
  });

// cleanFilePromisified usage
async function main() {
  try {
    await cleanFilePromisified("a.txt");
    console.log("done cleaning file!");
  } catch (error) {
    console.log(error);
  }
}

main();
