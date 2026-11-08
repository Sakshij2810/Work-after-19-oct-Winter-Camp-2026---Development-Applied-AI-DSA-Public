/*
  Implement a function `isPalindrome` which takes a string as argument and returns true/false as its result.
  Note: the input string is case-insensitive which means 'Nan' is a palindrom as 'N' and 'n' are considered case-insensitive.

  Once you've implemented the logic, test your code by running
  - `npm run test-palindrome`
*/

// O(n)

function isPalindrome(str) {
  let left = 0;
  let right = str.length - 1;

  while (left < right) {
    // Skip non-alphanumeric characters from the left
    if (!isAlphaNumeric(str[left])) {
      left++;
      continue;
    }

    // Skip non-alphanumeric characters from the right
    if (!isAlphaNumeric(str[right])) {
      right--;
      continue;
    }

    // Compare characters without case sensitivity
    if (str[left].toLowerCase() !== str[right].toLowerCase()) {
      return false;
    }

    left++;
    right--;
  }

  return true;
}

function isAlphaNumeric(ch) {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9")
  );
}

module.exports = isPalindrome;
