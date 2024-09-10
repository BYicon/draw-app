import React from 'react';
import { View } from '@tarojs/components';
import "./TopBackground.less";
interface IBgProps {
  height?: number;
}

export default  function TopBackground(props: IBgProps) {
  return <View className='top-bg' style={{height: props.height ? props.height + "rpx" : "500rpx"}}>
  </View>
};