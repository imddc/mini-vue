export default function patchStyle(el, prev, next) {
  // 更新style
  const style = el.style
  for (const key in next) {
    // 用最新的直接覆盖
    style[key] = next[key]
  }
  if (prev) {
    for (const key in prev) {
      // 老的有新的没有删除
      if (next[key] == null) {
        style[key] = null
      }
    }
  }
}
