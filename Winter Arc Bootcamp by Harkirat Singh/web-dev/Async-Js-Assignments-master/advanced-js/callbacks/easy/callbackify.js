//✅
// Problem Description – callbackify(fn)
//
// 1. You are required to write a function named callbackify that takes a
// 2. function which returns a Promise.
// 3. The function should return a new function that accepts a callback as its last argument.
// 4. When the Promise resolves, the callback should be called with `(null, data)`.
// 5. When the Promise rejects, the callback should be called with the error.

// 3. The function should return a new function that accepts a callback as its last argument.
function callbackify(fn) {
  return function (...args) {
    const callback = args.pop();

    fn(...args) // 4.
      .then((data) => {
        callback(null, data);
      })
      .catch((err) => callback(err)); // 5.
  };
}

// example

// 2. function which returns a Promise.
function getUser(id) {
  return Promise.resolve({ id: id, name: "Sakshi" });
}

// 1. You are required to write a function named callbackify that takes a
const getUserCallback = callbackify(getUser);

getUserCallback(1, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(data);
});

module.exports = callbackify;
