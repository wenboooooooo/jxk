/**
 * 解析 URL 查询字符串为对象或获取指定参数值
 * @author huwb <https://github.com/wenboooooooo>
 * @category analysis
 * @alias analysis_parseSearchParams
 * @param {string} [name] 需要获取的特定参数名
 * @returns {object|string|null} 返回解析后的查询参数对象或指定参数值
 * @property {string} [key] 查询参数的键值对
 * @example 
 * // 当前 URL: http://example.com/#/user?id=123&name=张三&type=admin
 * 
 * // 获取所有参数
 * analysis_parseSearchParams()
 * // => { id: '123', name: '张三', type: 'admin' }
 * 
 * // 获取特定参数
 * analysis_parseSearchParams('name')
 * // => '张三'
 * 
 * // 获取不存在的参数
 * analysis_parseSearchParams('age')
 * // => null
 */
export default (name) => {
  const url = window.location.hash;
  const arr = url.split('?')[1]?.split('&') || [];
  const params = {};
  
  for (const v of arr) {
    const val = v.split('=');
    if (name === val[0]) {
      return val[1];
    }
    params[val[0]] = val[1];
  }
  
  if (name) return null;
  return params;
};