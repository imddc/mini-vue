export function getLIS(arr: number[]): number[] {
  const lisIndices = [0]
  const prevIndices = lisIndices.slice(0)
  let current: number, lastLISIndex: number, left: number, right: number, middle: number
  const len = arr.length
  for (current = 0; current < len; current++) {
    const currentElement = arr[current]
    // 对于vue3的特殊标记 0代表
    if (currentElement !== 0) {
      lastLISIndex = lisIndices[lisIndices.length - 1]

      // 如果当前元素比LIS中的最后一个元素大,则直接追加
      if (arr[lastLISIndex] < currentElement) {
        prevIndices[current] = lastLISIndex
        lisIndices.push(current)
        continue
      }

      // 找到要替换的位置
      left = 0
      right = lisIndices.length - 1
      while (left < right) {
        middle = ((left + right) / 2) | 0 // 向下取整
        if (arr[lisIndices[middle]] < currentElement) {
          left = middle + 1
        } else {
          right = middle
        }
      }

      // 如果找到的位置的元素比当前元素大,则替换
      if (currentElement < arr[lisIndices[left]]) {
        if (left > 0) {
          prevIndices[current] = lisIndices[left - 1]
        }
        lisIndices[left] = current
      }
    }
  }

  // 重建最终的LIS
  let lisLength = lisIndices.length
  let lastIndex = lisIndices[lisLength - 1]
  while (lisLength-- > 0) {
    lisIndices[lisLength] = lastIndex
    lastIndex = prevIndices[lastIndex]
  }
  return lisIndices
}
