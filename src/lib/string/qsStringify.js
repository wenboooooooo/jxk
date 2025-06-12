/**
 * 将对象转换为查询字符串，支持数组和嵌套对象
 * @author huwb <https://github.com/wenboooooooo>
 * @category string
 * @alias string_qsStringify
 * @param {object} obj 需要转换的对象
 * @returns {string} 返回转换后的查询字符串
 * @example
 * // 转换普通对象
 * string_qsStringify({ name: '张三', age: 18 })
 * // => 'name=%E5%BC%A0%E4%B8%89&age=18'
 * 
 * // 转换数组
 * string_qsStringify({ ids: [1, 2, 3] })
 * // => 'ids=1&ids=2&ids=3'
 * 
 * // 转换嵌套对象
 * string_qsStringify({ user: { name: '张三', age: 18 } })
 * // => 'user[name]=%E5%BC%A0%E4%B8%89&user[age]=18'
 * 
 * // 转换混合类型
 * string_qsStringify({ 
 *   name: '张三', 
 *   ids: [1, 2, 3], 
 *   user: { age: 18 } 
 * })
 * // => 'name=%E5%BC%A0%E4%B8%89&ids=1&ids=2&ids=3&user[age]=18'
 */
export default function stringify(obj) {
  if (!obj) return ''

  return Object.entries(obj)
    .map(([key, value]) => {
      // 处理数组
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&')
      }
      // 处理对象
      if (typeof value === 'object' && value !== null) {
        return stringify(value)
      }
      // 处理基本类型
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    })
    .join('&')
}
