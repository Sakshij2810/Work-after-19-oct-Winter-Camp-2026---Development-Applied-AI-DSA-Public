import fs from "fs";

class MyPromise {
  constructor(fn) {
    this.status = "pending";
    this.value = undefined;

    this.successCallbacks = [];
    this.failureCallbacks = [];

    const resolve = (value) => {
      if (this.status !== "pending") return;

      this.status = "fulfilled";
      this.value = value;

      this.successCallbacks.forEach((callback) => {
        callback(value);
      });
    };

    const reject = (err) => {
      if (this.status !== "pending") return;

      this.status = "rejected";
      this.value = err;

      this.failureCallbacks.forEach((callback) => {
        callback(err);
      });
    };

    try {
      fn(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(callback) {
    if (this.status === "fulfilled") {
      callback(this.value);
    } else if (this.status === "pending") {
      this.successCallbacks.push(callback);
    }

    return this;
  }

  catch(callback) {
    if (this.status === "rejected") {
      callback(this.value);
    } else if (this.status === "pending") {
      this.failureCallbacks.push(callback);
    }

    return this;
  }
}

// Convert callback-based fs.readFile into our Promise class
function readfilePromisified(filepath, encoding) {
  return new MyPromise((resolve, reject) => {
    fs.readFile(filepath, encoding, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Handle success
function callback(data) {
  console.log(data);
}

// Handle failure
function callbackErr(err) {
  console.log("Error while reading file:", err.message);
}

// Use the custom Promise
readfilePromisified("aaa.txt", "utf-8").then(callback).catch(callbackErr);
