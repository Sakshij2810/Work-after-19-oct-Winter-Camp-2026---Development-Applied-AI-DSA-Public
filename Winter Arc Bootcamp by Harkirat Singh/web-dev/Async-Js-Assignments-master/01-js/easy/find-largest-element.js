/*
  Write a function `findLargestElement` that takes an array of numbers and returns the largest element.
  Example:
  - Input: [3, 7, 2, 9, 1]
  - Output: 9
*/

let arr1 = [3, 7, 2, 9, 1];
let arr2 = [3, 700, 21, 93, 1];

// O(n) - recommended
function findLargestElement(numbers) {
  if (numbers.length === 0) return undefined;

  let largest = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    if (largest < numbers[i]) {
      largest = numbers[i];
    }
  }

  return largest;
}

// O(n.logn)
function findLargestElementSort(numbers) {
  return numbers.sort((a, b) => b - a)[0];
}

console.log(findLargestElement(arr1));
console.log(findLargestElementSort(arr2));

module.exports = findLargestElement;
