//✅
// Problem Description – Parallel Chunked Async Reducer

// You are required to process an array using a reducer function where the reduction happens in sequence, but the data fetching or processing for items is performed in parallel chunks.
// Each chunk should be processed concurrently, then reduced before moving to the next chunk.
// The final reduced result must be correct and deterministic.
async function asyncReduceLimited(
  array,
  limit,
  asyncProcessFn,
  reducer,
  initialValue,
) {
  //1. initialised accumulator
  let accumulator = initialValue;

  //2. traverse on array to fetch data : increment by  i += limit (chunks)
  for (let i = 0; i < array.length; i += limit) {
    // take one chunck
    let chunk = array.slice(i, i + limit);

    // process all items in this chunk concurrently
    const results = await Promise.all(
      chunk.map((item) => asyncProcessFn(item)),
    );

    // Reduce results sequentially, preserving their order
    for (let result of results) {
      accumulator = reducer(accumulator, result);
    }
  }

  return accumulator;
}

async function mapAsyncLimit(array, limit, asyncFn) {}

// Example

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const input = [10, 20, 30, 40, 50, 60];

  const result = await asyncReduceLimited(
    input,
    2,
    async (n) => {
      await sleep(10);
      return n * 2;
    },
    (acc, val) => acc + val,
    0,
  );

  console.log("Final result:", result);
}

main();

module.exports = asyncReduceLimited;
