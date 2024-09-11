
import Taro from '@tarojs/taro';
import CryptoJS from "crypto-js"

/**
 * 将对象解析成url参数
 * @{param}
 */
export const objectToString = (obj) => {
  let searchKeys = []
  if (Object.prototype.toString.call(obj) === "[object Object]" && Object.keys(obj).length) {
    for(let key in obj) {
      searchKeys.push(`${key}=${obj[key]}`)
    }
  }
  return searchKeys.join('&')
}

/**
 * 延迟
 * @{ms}	 延迟时间ms
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
* 防抖函数
*
* @param {Function} fn 要防抖的方法
* @param {number} delay 延迟毫秒数
* @returns {Function} 防抖函数
*/
export const debounce = (fn, delay) => {
  let timer = null
  return (...args) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 加密
 * @returns
 */
export function setAESCode() { //需要加密的内容，aes密钥
  const disTime = Taro.getStorageSync("disTime");
  const now = Date.now() + disTime * 1000;
  let key = CryptoJS.enc.Utf8.parse("Your AES Key");
  let content = CryptoJS.enc.Utf8.parse(parseInt(Math.random() * 100) + ";" + "hwcj888;" + now);
  let encryptedData = CryptoJS.AES.encrypt(content, key, {
   mode: CryptoJS.mode.ECB,
   padding: CryptoJS.pad.Pkcs7
  })
  return encryptedData.toString()
}
