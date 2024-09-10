import { Image, View, WebView } from '@tarojs/components';
import Taro, { useDidShow, useLoad, useShareAppMessage } from '@tarojs/taro';
import { DEFAULT_SHARE_CONFIG } from '../../common/config';
import "./Infomation.less";

/**
 * 登录页
 * @param props 
 * @returns 
 */
function InfomationPage() {
  /**
   * 分享
   */
  useShareAppMessage(res => {
    if (res.from === 'button') {
    }
    return {
      ...DEFAULT_SHARE_CONFIG,
    }
  });

  return <View className='order-page'>
    <WebView src='https://mp.weixin.qq.com/s/jD80EgPKKr7cHMaDMsqNDQ' />
  </View>
};


export default InfomationPage