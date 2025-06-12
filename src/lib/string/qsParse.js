/**
 * 解析查询字符串为对象，支持数组和嵌套对象
 * @author huwb <https://github.com/wenboooooooo>
 * @category string
 * @alias string_qsParse
 * @param {string} str 需要解析的查询字符串
 * @returns {object} 返回解析后的对象
 * @property {string|array|object} [key] 解析后的键值对，支持普通值、数组和嵌套对象
 * @example
 * // 解析普通查询字符串
 * string_qsParse('name=张三&age=18')
 * // => { name: '张三', age: '18' }
 * 
 * // 解析数组参数
 * string_qsParse('ids[]=1&ids[]=2&ids[]=3')
 * // => { ids: ['1', '2', '3'] }
 * 
 * // 解析嵌套对象
 * string_qsParse('user[name]=张三&user[age]=18')
 * // => { user: { name: '张三', age: '18' } }
 * 
 * // 解析带编码的字符串
 * string_qsParse('name=%E5%BC%A0%E4%B8%89&age=18')
 * // => { name: '张三', age: '18' }
 */
export default function parse(str) {
  if (!str) return {}
  
  // 移除开头的 ? 或 #
  str = str.replace(/^[?#]/, '')
  
  const result = {}
  
  str.split('&').forEach(pair => {
    const [key, value] = pair.split('=')
    if (!key) return
    
    const decodedKey = decodeURIComponent(key)
    const decodedValue = decodeURIComponent(value || '')
    
    // 处理数组参数 (key[]=value)
    if (decodedKey.endsWith('[]')) {
      const arrayKey = decodedKey.slice(0, -2)
      if (!result[arrayKey]) {
        result[arrayKey] = []
      }
      result[arrayKey].push(decodedValue)
    }
    // 处理嵌套对象 (key[subkey]=value)
    else if (decodedKey.includes('[') && decodedKey.endsWith(']')) {
      const [mainKey, subKey] = decodedKey.split('[')
      const cleanSubKey = subKey.slice(0, -1)
      
      if (!result[mainKey]) {
        result[mainKey] = {}
      }
      result[mainKey][cleanSubKey] = decodedValue
    }
    // 处理普通键值对
    else {
      result[decodedKey] = decodedValue
    }
  })
  
  return result
}
