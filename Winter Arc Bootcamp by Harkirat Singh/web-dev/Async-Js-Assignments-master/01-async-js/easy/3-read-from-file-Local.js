// ## Reading the contents of a file

// Write code to read contents of a file and print it to the console. - done
// You can use the fs library to as a black box, the goal is to understand async tasks. - done
// Try to do an expensive operation below the file read and see how it affects the output. - done
// Make the expensive operation more and more expensive and see how it affects the output. - done

import fs from "fs/promises";

fs.readFile("a.txt", "utf-8")
  .then((data) => console.log(data))
  .catch((err) => console.log("err while reading file: ", err));

for (let i = 0; i <= 10000000000; i++) {}
