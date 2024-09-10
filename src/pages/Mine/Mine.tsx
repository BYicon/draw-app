import React, { useRef, useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import TopBackground from '../../components/TopBackground/TopBackground';
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro';
import { connect } from 'react-redux';
import { EnumEventType, EnumOrderStatus } from '../../common/enum';
import * as service from '../../common/api';
import { IMenu } from '../../common/interface';
import NavBar from '../../components/NavBar/NavBar';
import Poster from '../../components/Poster/Poster';
import { DEFAULT_SHARE_CONFIG, MENU_LIST } from '../../common/config';
import './Mine.less';
interface IPosterComponent {
  drawPoster: () => void;
}

function MinePage(props) {
  const posterRef = useRef<IPosterComponent>();
  const userState = props.user;
  const isLogin = userState.isLogin;
  const [menuList] = useState(MENU_LIST); // 菜单列表
  const [drawRecord, setDrawRecord] = useState({
    winCount: 0,
    participantCount: 0,
  });

  /**
   * 登录
   */
  const loginHandler = () => {
    Taro.navigateTo({
      url: "/pages/Register/Register"
    })
  };

  /**
   * 跳转到抽奖记录页面
   */
  const navigateToRecord = (type) => () => {
    Taro.navigateTo({
      url: '/pages/Record/Record?type=' + type,
    })
  }

  /**
   * 菜单点击事件
   * @param record item
   * @returns
   */
  const clickHandler = (record: IMenu) => () => {
    if (record.name === "我的订单" || record.name === "收货地址") {
      if (!isLogin) {
        loginHandler();
        return;
      }
    }
    switch (record.type) {
      case EnumEventType.address:
        Taro.chooseAddress({
          success: (res) => {
            console.log("选择地址>>>>", res)
          },
          fail: function (err) {
            // chooseAddress:fail auth deny 拒绝授权 主动拒绝后 只有用户清除小程序 才能重新拉起授权
            // chooseAddress:fail cancel 同意授权 但是 取消选择地址
            console.log(err)
          }
        })
        break;
      case EnumEventType.preview:
        Taro.previewImage({
          current: '', // 当前显示图片的http链接
          urls: ["https://draw.placeholder.cn/image/xiaozhuli.jpeg"] // 需要预览的图片http链接列表
        })
      case EnumEventType.navigate:
        Taro.navigateTo({
          url: record.path as string,
        })
        break;
      // case EnumEventType.share:
      //   break;
      case EnumEventType.share:
        if(posterRef.current && posterRef.current.drawPoster) {
          posterRef.current.drawPoster();
        }
        break;
    }
  };

  /**
   * 获取订单列表
   * @param state 订单状态
   */
  const getOrderList = (state) => {
    return service.getOrderList({
      pageNum: 1,
      pageSize: 10,
      state,
    }).then((res) => {
      console.log(res);
    });
  };

  /**
   * 获取抽奖记录数目
   */
  const getDrawRecord = () => {
    service.getDrawRecord().then((res) => {
      setDrawRecord({
        winCount: res?.data?.win_num,
        participantCount: res?.data?.prize_num
      });
    });
  }

  // onShow
  useDidShow(() => {
    if (isLogin) {
      getOrderList(EnumOrderStatus.all);
      getDrawRecord();
    };
  })

  /**
   * 分享
   */
   useShareAppMessage(res => {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      ...DEFAULT_SHARE_CONFIG,
    }
  });

  return <View className='mine-page'>
    <NavBar hideLeft={true} title="我的"></NavBar>
    <View className='mine-body'>
      <TopBackground height={550} />
      <View className='user-info'>
        <Image className='avatar' src={userState.avatarUrl || require("../../assets/images/default.jpeg")} onClick={loginHandler} />
        {
          isLogin ?
            <View className='user-name' onClick={loginHandler}>{userState.nickName}</View> :
            <Button className='login-btn' onClick={loginHandler}>登录/注册</Button>
        }
      </View>
      <View className='mine-assets'>
        {/* <View className='mine-panel'>
        <View className='mine-value'>20</View>
        <View className='mine-label'>我的奖券</View>
      </View> */}
        <View className='mine-panel' onClick={navigateToRecord(1)}>
          <View className='mine-value'>{drawRecord.winCount}</View>
          <View className='mine-label'>中奖记录</View>
        </View>
        <View className='mine-panel' onClick={navigateToRecord(0)}>
          <View className='mine-value'>{drawRecord.participantCount}</View>
          <View className='mine-label'>参加的抽奖</View>
        </View>

      </View>
      <View className='mine-menu-list'>
        {menuList.map((menuItem) =>
          // @ts-ignore
          <Button className='mine-menu' key={menuItem.id} onClick={clickHandler(menuItem)} openType={menuItem.openType}>
            <View className='mine-menu-left'>
              <Image className='mine-menu-icon' src={menuItem.icon} />
              <Text className="mine-menu-label">{menuItem.name}</Text>
            </View>
            <Image className='mine-menu-right' src={require("../../assets/images/right.png")} />
          </Button>)
        }
      </View>
    </View>
    <Poster ref={posterRef}></Poster>
  </View>
};


const mapStateToProps = store => {
  return store
};

export default connect(mapStateToProps)(MinePage)
