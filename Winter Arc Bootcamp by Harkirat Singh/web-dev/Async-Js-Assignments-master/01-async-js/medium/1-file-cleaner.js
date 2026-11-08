// ## File cleaner
// Read a file, remove all the extra spaces and write it back to the same file.

// For example, if the file input was
// ```
// hello     world    my    name   is       raman
// ```

// After the program runs, the output should be

// ```
// hello world my name is raman
// ```

import fs from "fs/promises";

// // promises
// function cleanFile(path) {
//   fs.readFile(path, "utf-8")
//     .then((data) => {
//       let cleanedData = data.trim().split(" ").filter(Boolean).join(" ");
//       //   let cleanedData = data.replace(/\s+/g, " ");

//       return fs.writeFile(path, cleanedData);
//     })
//     .then(() => console.log("done cleaning flie"))
//     .catch((err) => console.log("err: ", err));
// }
// cleanFile("a.txt");

// async-await

async function cleanFileAsync(path) {
  try {
    let data = await fs.readFile(path, "utf-8");
    let cleanedData = data.trim().split(" ").filter(Boolean).join(" ");

    await fs.writeFile(path, cleanedData);

    console.log("done cleaning files");
  } catch (error) {
    console.log("err: ", error);
  }
}

cleanFileAsync("a.txt");
