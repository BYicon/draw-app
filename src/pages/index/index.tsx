import React, { useEffect, useState } from 'react'
import {
  View,
  Image,
  Swiper,
  SwiperItem,
  Button,
  Text,
  ScrollView
} from '@tarojs/components'
import Taro, {
  useDidShow,
  useLoad,
  useShareAppMessage,
} from '@tarojs/taro'
import { IGoodsData, INotice } from '../../common/interface'
import TopBackground from '../../components/TopBackground/TopBackground'
import * as service from '../../common/api'
import NavBar from '../../components/NavBar/NavBar';
import { setAESCode } from "../../common/utils";
import './index.less'
import { EnumDrawType, EnumEntryKey, EnumUrlParamKey, EnumInviteResult } from '../../common/enum'
import { connect } from 'react-redux'
import useThrottle from '../../hooks/useThrottle'
import { DEFAULT_SHARE_CONFIG } from '../../common/config'

/**
 * 生成LdToken
 */
const setAESCodeHandler = () => {
  const str = setAESCode();
  Taro.setStorageSync("ldToken", str);
}

// timer
let timer: any = null;

// 定时设置LdToken
const loopSetLdToken = () => {
  timer && clearInterval(timer);
  timer = setInterval(() => {
    setAESCodeHandler();
  }, 20000);
}

let pageNum = 1;
let pageSize = 16;
let total = 0;
let _freshing = false;
/**
 * 首页组件
 * @param props
 * @returns
 */
function HomePage(props) {
  const { params: urlParams } = Taro.useRouter()
  const userInfoState = props.user
  const isLogin = userInfoState.isLogin
  const [hotList, setHotList] = useState<IGoodsData[][]>([])
  const [luckList, setLuckList] = useState<IGoodsData[]>([])
  const [noticeList, setNoticeList] = useState<INotice[]>([])
  const [triggered, setTriggered] = useState(false);
  const throttle = useThrottle();

  /**
   * 获取服务端时间
   */
  const getServerTime = async () => {
    return new Promise(async (resolve) => {
      const res = await service.getServerTime();
      const disTime = res.data ? res.data - Math.floor(Date.now() / 1000) : 0;
      Taro.setStorageSync("disTime", disTime);
      resolve(disTime);
    })
  };

  /**
   * 登录
   */
  const goLoginPage = (url = '/pages/Register/Register') => {
    Taro.navigateTo({
      url,
    })
  }

  /**
   * 登录函数
   * @param callback cb
   */
  const login = async (callback) => {
    const userInfo = Taro.getStorageSync('userInfo');
    const userId = urlParams[EnumUrlParamKey.userId];
    if (userInfo?.nickName) {
      const loginData = await service.loginReq();
      const _openid = loginData.data.openid;
      service
        .addUser({
          unionid: '',
          openid: _openid,
          nickname: userInfo.nickName,
          url: userInfo.avatarUrl,
          sex: userInfo.gender,
        })
        .then((resData) => {
          Taro.setStorage({
            key: 'token',
            data: resData.data.token,
          })
          Taro.setStorage({
            key: 'userInfo',
            data: userInfo,
          })
          // {"nickName":"placeholder","gender":0,"language":"zh_CN","city":"","province":"","country":"","avatarUrl":"https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTL7LuzpjBx3srJ0DkWTyqTxTO1melicwsxqHEicQYyO0yGb9Ea8iaD8CtjXjq652B8K7nKvhFbiaowu9A/132"}
          props.dispatch({
            type: 'user/updateState',
            payload: {
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl,
              gender: userInfo.gender,
              isLogin: true,
            },
          })
          setTimeout(() => {
            if(userId) {
              props.dispatch({
                type: 'app/updateState',
                payload: {
                  inviteData: {
                    visible: true, // 是否需要展示助力弹框
                    success: false, // 是否助力成功
                  }
                },
              });
              Taro.switchTab({
                url: `/pages/CouponArea/CouponArea`,
              });
              return;
            };
            callback && callback()
          })
        })
        .catch(() => {
          props.dispatch({
            type: 'user/updateState',
            payload: {
              isLogin: false,
            },
          })
        })
    } else {
      // 如果有地址栏有userId，说明是分享链接，并且Storage里不存在userInfo相关数据，则携带userId跳到登录页
      if (userId) {
          goLoginPage("/pages/Register/Register?uid=" + userId);
      };
    }
  }

  /**
   * 获取公告列表
   */
  const getNoticeList = () => {
    service.getNoticeList().then((res) => {
      setNoticeList(res.data)
    })
  }

  /**
   * 跳转到详情
   */
  const goDetail = (id) => () => {
    if (!isLogin) {
      goLoginPage()
      return
    }
    Taro.navigateTo({
      url: '/pages/DrawDetail/DrawDetail?id=' + id,
    })
  }

  /**
   * 获取热门列表数据
   */
  const getHotList = () => {
    return service
      .getDrawList({
        pageNum: 1,
        pageSize: 50,
        type: EnumDrawType.hot,
      })
      .then((res) => {
        const result: IGoodsData[][] = []
        let arr: IGoodsData[] = []
        res.list.forEach((data, index) => {
          arr.push(data)
          if ((index + 1) % 3 === 0 || index === res.list.length - 1) {
            result.push(arr)
            arr = []
          }
        })
        setHotList(result)
      })
  }

  /**
   * 获取手气广场
   */
  const getDrawList = () => {
    return service
      .getDrawList({
        pageNum: pageNum,
        pageSize: pageSize,
        type: EnumDrawType.lucky,
      })
      .then((res) => {
        total = res.total;
        if (pageNum === 1) {
          setLuckList(res.list);
        } else {
          setLuckList([...luckList, ...res.list]);
        }
      })
  }

  /**
   * init
   */
  const initData = async () => {
    Taro.showNavigationBarLoading()
    try {
      await getHotList()
      await getDrawList()
      getNoticeList();
    } finally {
      Taro.hideNavigationBarLoading()
      setTriggered(false);
      _freshing = false;
    }
  }
  /**
   * 根据entryKey参数跳转页面
   * @param entryKey EnumEntryKey
   */
  const redirectPage = (params) => {
    const entryKey = params[EnumUrlParamKey.entryKey]
    if (entryKey === EnumEntryKey.detailPage) {
      Taro.navigateTo({
        url:
          '/pages/DrawDetail/DrawDetail?id=' + params[EnumUrlParamKey.drawId],
      })
    } else if (entryKey === EnumEntryKey.couponPage) {
      Taro.switchTab({
        url: '/pages/CouponArea/CouponArea',
      })
    } else if (entryKey === EnumEntryKey.minePage) {
      Taro.switchTab({
        url: '/pages/Mine/Mine',
      })
    }
  }

  /**
   * 跳转到说明页面
   */
  const goPage = () => {
    Taro.navigateTo({
      url:
        '/pages/Infomation/Infomation'
    })
  }


  /**
   * 下拉刷新
   */
  const onRefresh = () => {
    if (_freshing) return
    _freshing = true
    pageNum = 1;
    pageSize = 16;
    setTriggered(true);
    setTimeout(() => {
      initData();
    }, 1500);
  }

  /**
   * 自定义下拉刷新被复位
   * @param e
   */
  const onRestore = (e) => {
    console.log('onRestore>>>>>>', e);
  }

  /**
   * 上拉加载
   */
  const onScrollToLower = () => {
    throttle(() => {
      if (pageNum * pageSize > total) return;
      pageNum++;
      getDrawList();
    }, 2000);
  };


  // onload
  useLoad(async () => {
    await getServerTime();
    setAESCodeHandler();
    login(() => {
      redirectPage(urlParams)
    });
    initData();
  })

  // onShow
  useDidShow(async () => {
    await getServerTime();
    setAESCodeHandler();
    loopSetLdToken();
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

  return (
    <View className="home-page">
      <NavBar hideLeft={true} title="天天抽好货"></NavBar>
      <View className="home-body-wrap">
        <TopBackground height={800} />
        <ScrollView className="home-body"
          scrollY
          showScrollbar={false}
          refresherDefaultStyle="white"
          refresherBackground='#fff'
          lowerThreshold={200}
          onScrollToLower={onScrollToLower}
          enable-passive={true}
          onRefresherRefresh={onRefresh}
          onRefresherRestore={onRestore}
          refresherTriggered={triggered}
          refresherEnabled={true}
          refresherThreshold={100}
        >
          <Swiper
            className="home-swiper"
            indicatorColor="#666·"
            indicatorActiveColor="#FE3629"
            circular
            indicatorDots={false}
            autoplay
          >
            <SwiperItem>
              <Image
                className="swiper-img"
                src="https://draw.placeholder.cn/image/draw-banner.png"
                onClick={goPage}
              />
            </SwiperItem>
          </Swiper>
          <View className="notice">
            <Swiper
              className="notice-swiper"
              vertical
              circular
              interval={2000}
              autoplay
            >
              {noticeList.map((item) => (
                <SwiperItem>
                  <View className="notice-item">
                    <Image className="small-avatar" src={item.url} />
                    <Text className="notice-text">
                      「 {item.name} 」{item.remark}
                    </Text>
                  </View>
                </SwiperItem>
              ))}
            </Swiper>
          </View>
          {/* 热门抽奖 */}
          {hotList.length || luckList.length ? (
            <View className="home-main">
              {hotList.length ? (
                <>
                  <View className="home-panel-title">热门抽奖</View>
                  <View className="home-panel">
                    <Swiper
                      className="home-swiper-hot"
                      indicatorColor="#ccc"
                      indicatorActiveColor="#FE3629"
                      circular
                      indicatorDots={hotList.length > 1}
                    >
                      {hotList.map((dataItem, index) => (
                        <SwiperItem className="swiper-item-hot" key={index}>
                          <View className="goods-list-hot">
                            {dataItem.map((hotItem) => (
                              <View
                                className="goods-item-hot"
                                onClick={goDetail(hotItem.id)}
                              >
                                <Image
                                  className="goods-hot-img"
                                  src={hotItem.imgSrc}
                                />
                                <View className="goods-hot-name">
                                  {hotItem.name}
                                </View>
                                <View className='goods-hot-value'>
                                  <View className="goods-hot-price">
                                    ¥{hotItem.price}
                                  </View>
                                  <View className="goods-hot-cost">
                                    <Text className='bold'>{hotItem.costCount}</Text>奖券/次
                                  </View>
                                </View>
                                <Button className="primary-btn">0元抽奖</Button>
                              </View>
                            ))}
                          </View>
                        </SwiperItem>
                      ))}
                    </Swiper>
                  </View>
                </>
              ) : null}
              {/* 手气广场 */}
              {luckList.length > 0 ? (
                <>
                  <View className="home-panel-title">手气广场</View>
                  <View className="home-panel luck-list">
                    {luckList.map((luckItem) => (
                      <View
                        className="goods-item-luck"
                        onClick={goDetail(luckItem.id)}
                      >
                        <Image className="goods-luck-img" src={luckItem.imgSrc} />
                        <View className="goods-luck-name">{luckItem.name}</View>
                        <View className='goods-luck-value'>
                          <View className="goods-luck-price">
                            ¥{luckItem.price}
                          </View>
                          <View className="goods-luck-cost">
                            <Text className='bold'>{luckItem.costCount}</Text>奖券/次
                          </View>
                        </View>
                        <View className="goods-luck-desc">
                          剩余{luckItem.targetCount - luckItem.currentCount * luckItem.costCount}奖券自动开奖
                        </View>
                        <Button className="primary-btn">0元抽奖</Button>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}
            </View>
          ) :
            <View className='no-data'>暂无数据，敬请期待...</View>
          }
        </ScrollView>
      </View>
    </View>
  )
}

const mapStateToProps = (store) => {
  return store
}

export default connect(mapStateToProps)(HomePage)
