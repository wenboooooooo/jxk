/**
 * axios插件 在发送请求之前对数据进行加密（默认sm4），在响应数据进行解密。
 * axios.interceptors
 * 
 * @category  misc
 * @alias misc_deepClone
 * 
 * @param {*} obj - 待克隆的对象
 * 
 * @returns {*} - 克隆后的对象
 * 
 * @example
 * misc_deepClone({ a: 1, b: { c: 2 } });
 * // 返回 { a: 1, b: { c: 2 } }
 * 
 * @author xkloveme <xkloveme@gmail.com>
 * @Date 2024-08-10 21:59:39
 */

export default misc_axios_interceptors {

}
// request
export function misc_x(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => misc_deepClone(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = misc_deepClone(obj[key]);
    return acc;
  }, Object.create(Object.getPrototypeOf(obj)));
}