/*
  Write a function `isAnagram` which takes 2 parameters and returns true/false if those are anagrams or not.
  What's Anagram?
  - A word, phrase, or name formed by rearranging the letters of another, such as spar, formed from rasp.

  Once you've implemented the logic, test your code by running
  - `npm run test-anagram`
*/
function isAnagram(str1, str2) {
  if (str1.length !== str2.length) {
    return false;
  }

  function sortString(str) {
    return str.toLowerCase().split("").sort().join("");
  }

  return sortString(str1) === sortString(str2);
}

// module.exports = isAnagram;

// sakshi's code : O(n^2) --- brute force
function isAnagramBrute(str1, str2) {
  if (str1.length != str2.length) {
    return false;
  }

  for (let i = 0; i < str1.length; i++) {
    let isCharFound = false;

    for (let j = 0; j < str1.length; j++) {
      if (str1.charAt(i).toLowerCase() == str2.charAt(j).toLowerCase()) {
        isCharFound = true;
      }
    }

    if (!isCharFound) {
      return false;
    }
  }

  return true;
}

module.exports = isAnagram;
