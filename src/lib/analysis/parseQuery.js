/**
 * 解析 URL 查询字符串为对象
 * @author huwb <https://github.com/wenboooooooo>
 * @category analysis
 * @alias analysis_parseQuery
 * @param {string} url 需要解析的 URL，默认为当前页面 URL
 * @returns {object} 返回解析后的查询参数对象
 * @property {string} [key] 查询参数的键值对
 * @example
 * // 解析完整 URL
 * analysis_parseQuery('https://example.com?name=张三&age=18&type=user')
 * // => { name: '张三', age: '18', type: 'user' }
 * 
 * // 解析当前页面 URL
 * analysis_parseQuery()
 * // => { id: '123', name: '张三', type: 'admin' }
 * 
 * // 解析带编码的 URL
 * analysis_parseQuery('https://example.com?name=%E5%BC%A0%E4%B8%89&age=18')
 * // => { name: '张三', age: '18' }
 */
export default (url) => {
  url = url == null ? window.location.href : url;
  const search = url.substring(url.lastIndexOf('?') + 1);
  const obj = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1);
    let val = decodeURIComponent($2);
    val = String(val);
    obj[name] = val;
    return rs;
  });
  
  return obj;
};