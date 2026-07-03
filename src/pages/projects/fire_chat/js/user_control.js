
export function upsertPairsInPlace(arr1, arr2) {
  // index existing keys in arr1 -> position
  const index = new Map();
  for (let i = 0; i < arr1.length; i++) {
    const a = arr1[i][0];
    if (!index.has(a)) index.set(a, i); // first occurrence wins
  }

  for (const [a, b] of arr2) {
    if (index.has(a)) {
      arr1[index.get(a)] = [a, b];        // replace
    } else {
      index.set(a, arr1.length);
      arr1.push([a, b]);                  // append
    }
  }
  return arr1;
}