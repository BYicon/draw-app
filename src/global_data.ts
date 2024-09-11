import { EnumLoginStat } from "./common/enum"

const globalData = {
    loginStat: EnumLoginStat.no,
    userInfo: {}
}

export function setGlobalData (key, val) {
  globalData[key] = val
}

export function getGlobalData (key) {
  return globalData[key]
}