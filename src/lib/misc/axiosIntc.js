import { analysis_parseSearchParams, string_qsParse, string_qsStringify, sm4 } from "../../index.js"

/**
 * Axios 请求/响应拦截器，用于数据加密和解密
 * @author huwb <https://github.com/wenboooooooo>
 * @category misc
 * @alias misc_axiosIntc
 * @param {object} opt 配置选项
 * @param {string} opt.key 加密密钥
 * @param {function} [opt.encrypt] 自定义加密函数，默认使用 SM4
 * @param {function} [opt.decrypt] 自定义解密函数，默认使用 SM4
 * @param {function} [opt.notEncrypted] 自定义判断是否需要加密的函数
 * @param {function} [opt.isDev] 自定义判断是否为开发环境的函数
 * @param {function} [opt.isEncryptionPath] 自定义判断路径是否需要加密的函数
 * @returns {object} 返回包含 request 和 response 拦截器的对象
 * @property {function} request 请求拦截器
 * @property {function} response 响应拦截器
 * @example
 * 
 * // 使用示例：
 * 
 * // 1. 基础配置（使用默认 SM4 加密）
 * const instance = axios.create();
 * instance.interceptors.request.use(misc_axiosIntc({
 *   key: 'your-128-bit-key' // 必传项
 * }).request);
 * 
 * // 2. 自定义加密方式
 * const instance = axios.create();
 * instance.interceptors.request.use(misc_axiosIntc({
 *   encrypt: (data) => sm3.encrypt(data, 'your-128-bit-key'),
 *   decrypt: (data) => sm3.encrypt(data, 'your-128-bit-key')
 * }).request);
 * 
 * // 3. 完整配置示例
 * const instance = axios.create();
 * instance.interceptors.request.use(misc_axiosIntc({
 *   encrypt: (data) => sm3.encrypt(data, 'your-128-bit-key'),
 *   decrypt: (data) => sm3.encrypt(data, 'your-128-bit-key'),
 *   notEncrypted: (config) => config.url.includes('/public/'),
 *   isDev: () => process.env.NODE_ENV === 'development',
 *   isEncryptionPath: (url) => url.length > 10
 * }).request);
 * 
 */
export default (opt = {}) => {
  // 默认加密函数
  const defaultEncrypt = (s) => sm4.encrypt(s, opt.key)

  // 默认解密函数
  const defaultDecrypt = (s) => sm4.decrypt(s, opt.key)

  // 默认判断是否需要加密
  const defaultNotEncrypted = (config) => {
    const data = config.data
    const params = config.params
    const contentType = config.headers['Content-Type']
    const responseType = config.responseType
    return (
      isDev() ||
      isFormData(data) ||
      isFormData(params) ||
      contentType === 'multipart/form-data' ||
      responseType === 'blob'
    )
  }

  // 默认判断是否为开发环境
  const defaultIsDev = () => import.meta.env.VITE_APP_ENV === 'development'

  // 默认判断路径是否需要加密
  const defaultIsEncryptionPath = (url) => {
    const registerModuleRegex = {
      idCard: /^(\d{15})|(\d{17}([0-9]|X))$/,
      mobile: /^1(3|4|5|7|8)\d{9}$/,
      numberId: /^\d+$/,
    }
    return Object.values(registerModuleRegex).some((reg) => reg.test(url))
  }

  // 使用用户自定义函数或默认函数
  const encrypt = opt.encrypt || defaultEncrypt
  const decrypt = opt.decrypt || defaultDecrypt
  const notEncrypted = opt.notEncrypted || defaultNotEncrypted
  const isDev = opt.isDev || defaultIsDev
  const isEncryptionPath = opt.isEncryptionPath || defaultIsEncryptionPath

  // 请求拦截器：添加加密
  function addSM4(config) {
    let data = config.data
    let params = config.params
    const url = config.url
    const search = url.split('?')?.[1]
    const pathname = url.split('/')
    const subpathHasNum = pathname.some((subpath) => isEncryptionPath(subpath))

    if (notEncrypted(config)) {
      config.headers['Z'] = Symbol.keyFor(Z)
      return config
    } else {
      const nosm4 = analysis_parseSearchParams('Z')
      config.headers['Z'] = nosm4 || new Date().getTime()
    }

    // post
    if (data) {
      setContentType(data, config.headers)
      data = encrypt(JSON.stringify(data))
      config.data = data
    }

    // get
    if (params) {
      params = encrypt(qs.stringify(params))
      config.params = new URLSearchParams(params)
    }

    // 处理 URL 参数 axios({url:'/user?id=1',params:{}})
    if (search) {
      let [s, s2] = url.split('?')
      config.url = `${s}?${encrypt(s2)}`
    } else if (subpathHasNum) {
      // 处理 axios.get('/user/1')
      let s = []
      for (let index = 0; index < pathname.length; index++) {
        const path = pathname[index]
        let str = isEncryptionPath(path) ? encrypt(path) : path
        s.push(str)
      }
      config.url = s.join('/')
    }

    return config
  }

  // 响应拦截器：解析加密数据
  function analysisSM4(response) {
    if (isDev()) return response
    if (ArrayBuffer.isView(response.data) || response.data instanceof Blob) return response
    response.data = decrypt(response.data)
    devlog(response, response.data)
    return response
  }

  return {
    request: addSM4,
    response: analysisSM4
  }
}

const Z = Symbol.for('cleartext')

/**
 * 设置请求的 Content-Type
 * @param {*} data 请求数据
 * @param {object} headers 请求头
 */
function setContentType(data, headers) {
  transformRequest(data, headers)
}

/**
 * 判断是否为开发环境
 * @returns {boolean} 是否为开发环境
 */
function isDev() {
  return import.meta.env.VITE_APP_ENV === 'development'
}

/**
 * 开发环境日志输出
 * @param {object} response axios 响应对象
 * @param {*} res 响应数据
 */
function devlog(response, res) {
  if (isDev()) {
    try {
      console.log(
        `🐛: ~ analysisSM4 ~ %c${response.config.url}\n`,
        'color: #fc4d50',
        response.config,
        res,
      )
    } catch (error) {
      console.error(`🐛: ~ analysisSM4 ~ error:`, error)
    }
  }
}

/**
 * 判断是否为 FormData
 * @param {*} o 待判断的值
 * @returns {boolean} 是否为 FormData
 */
const isFormData = (o) => {
  return Object.prototype.toString.call(o) === '[object FormData]'
}

// qs
const qs = {
  stringify: string_qsStringify,
  parse: string_qsParse
}

// axios@1.7.2/lib/defaults/index.js
/**
 * 判断是否为对象
 * @param {*} thing 待判断的值
 * @returns {boolean} 是否为对象
 */
const isObject = (thing) => thing !== null && typeof thing === 'object';

const kindOf = (cache => thing => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));

const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type
}

/**
 * 判断是否为 URLSearchParams 对象
 * @param {*} val 待判断的值
 * @returns {boolean} 是否为 URLSearchParams 对象
 */
const isURLSearchParams = kindOfTest('URLSearchParams');

const utils = {
  isObject,
  isURLSearchParams
}

/**
 * 转换请求数据并设置 Content-Type
 * @param {*} data 请求数据
 * @param {object} headers 请求头
 */
function transformRequest(data, headers) {
  const contentType = headers.getContentType() || '';
  const hasJSONContentType = contentType.indexOf('application/json') > -1;
  const isObjectPayload = utils.isObject(data);

  if (utils.isURLSearchParams(data)) {
    headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
  }

  if (isObjectPayload || hasJSONContentType) {
    headers.setContentType('application/json', false);
  }
}
