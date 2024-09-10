import React from 'react';
import { View } from '@tarojs/components';
import "./NavBar.less";
import { AtIcon } from 'taro-ui';
import { connect } from 'react-redux';
interface INav {
  hideLeft: boolean;
  title: string;
  app?: any;
}

function NavBar(props: INav) {
  const { app, hideLeft } = props;
  const height = app?.navBarHeight || 84;
  return <View className='nav-bar-wrap' style={{ height: height + "px", minHeight: height + "px"}}>
    <View className='nav-bar' style={{lineHeight: app.menuHeight + "px", height: app.menuHeight + "px", bottom: app.menuBottom + "px"}}>
      <View className='nav-left' style={{lineHeight: app.menuHeight + "px"}}>
        {
          hideLeft ? null : <AtIcon value='chevron-left' size='20' color='#fff'></AtIcon>
        }
      </View>
      <View className='nav-center' style={{lineHeight: app.menuHeight + "px"}}>{props.title || "好物抽奖"}</View>
      <View className='nav-right'></View>
    </View>
  </View>
};


const mapStateToProps = store => {
  return store
};

export default connect(mapStateToProps)(NavBar)