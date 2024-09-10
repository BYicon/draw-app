import React, { useEffect, useState } from 'react';
import * as dayjs from 'dayjs';
import { View, Text, Image, Button, Swiper, SwiperItem } from '@tarojs/components';
import * as service from "../../common/api";
import Taro, { useDidShow, usePullDownRefresh, useReady, useShareAppMessage } from '@tarojs/taro';
import { IGoodsData, IUser } from '../../common/interface';
import { connect } from 'react-redux';
import * as helper from "../../common/helper";
import arraySupport from "dayjs/plugin/arraySupport";
import { EnumUserState, EnumDrawState, EnumMessageTemplateId, EnumUrlParamKey, EnumEntryKey } from '../../common/enum';
import DrawModal, { EnumModalType } from "../../components/DrawModal/DrawModal";
import classnames from "classnames";
import "./DrawDetail.less";

dayjs.extend(arraySupport);

const templateIds = [EnumMessageTemplateId.drawResult, EnumMessageTemplateId.drawResult2, EnumMessageTemplateId.drawStart];

/**
 * 抽奖详情页面
 * @param props
 * @returns
 */
function DrawDetail(props) {
  const { params } = Taro.useRouter();
  const drawId = params.id;
  const [detailData, setDetailData] = useState({} as IGoodsData);
  const [avatarList, setAvatarList] = useState<Array<IUser>>([]);
  const [winnerList, setWinnerList] = useState<Array<IUser>>([]);
  const [userDrawState, setUserDrawState] = useState(EnumUserState.no); // 用户参加状态
  const [userParticipateCount, setUserParticipateCount] = useState(0); // 用户参加次数
  const [drawModalVisible, setDrawModalVisible] = useState(false); // 兑换弹框显隐效果
  const [modalType, setModalType] = useState(EnumModalType.draw);

  // const [mockCount, setMockCount] = useState(0); // 假数据

  const userInfoState = props.user;
  const isLogin = userInfoState.isLogin;

  /**
   * 获取抽奖详情数据
   * @param id id
   */
  const getDrawDetail = async (id) => {
    const { data } = await service.getDetail(id).finally(() => {
      Taro.hideNavigationBarLoading();
      Taro.stopPullDownRefresh();
    });
    data.createTime[1] = data.createTime[1] - 1;
    const _currentCouponCount = data.prizeNum *  data.awardNum;

    // 假数据
    const addNum = 10 * data.awardNum;
    // setMockCount(addNum);

    setDetailData({
      id: data.id, // id
      awardCount: data.num, // 奖品数量
      name: data.name, // 奖品名称
      imgSrc: data.url, // 图片链接
      price: data.price, // 价格
      desc: "", // 奖品描述
      state: data.status, // 抽奖状态
      introduce: data.remark, // 介绍说明
      currentCount: data.prizeNum, // 当前参加人次
      targetCount: data.lotteryNum + addNum, // 开奖目标奖券数量
      currentCouponCount: _currentCouponCount + addNum, // 当前共投入奖券数
      restCouponCount: data.lotteryNum - _currentCouponCount, // 开奖目标奖券数量
      startDate: dayjs(data.createTime).format("YYYY-MM-DD"), // 开始日期
      startTime: dayjs(data.createTime).format("HH:mm:ss"), // 开始时间
      publicDate: dayjs(data.openTime).format("YYYY-MM-DD"), // 公布日期
      publicTime: dayjs(data.openTime).format("HH:mm:ss"), // 公布时间
      exchangeDate: dayjs(data.exchangeTime).format("YYYY-MM-DD"), // 公布时间
      exchangeTime: dayjs(data.exchangeTime).format("HH:mm:ss"), // 公布时间
      costCount: data.awardNum, // 消耗数量
      winStatus: data.winStatus,
    });
  };

  /**
  * 登录
  */
  const loginHandler = () => {
    Taro.navigateTo({
      url: "/pages/Register/Register"
    })
  }

  /**
   * 抽奖打开确定弹框
   */
  const openDrawModal = () => {
    setModalType(EnumModalType.draw);
    Taro.showModal({
      title: '提示',
      content: `确定要消耗 ${detailData.costCount} 奖券参加吗？`,
      success: function (res) {
        if (res.confirm) {
          service.draw(detailData.id, detailData.costCount).then(() => {
            setTimeout(() => {
              setDrawModalVisible(true);
              initData();
            }, 500);
          }).catch(err => {
            if (err.data.code === 10001) {
              Taro.hideToast();
              Taro.showModal({
                title: '提示',
                content: err.data.msg,
                confirmText: "赚奖券",
                cancelText: "取消",
                success(response) {
                  if (response.confirm) {
                    Taro.switchTab({
                      url: "/pages/CouponArea/CouponArea"
                    });
                  }
                }
              })
            }
            console.log(err);
          });
        } else if (res.cancel) {
        }
      }
    })
  }

  /**
   * 参加抽奖
   */
  const drawHandler = () => {
    if (isLogin) {
      if (userDrawState === EnumUserState.no) { // 如果是为参加状态则订阅消息
        helper.subscribeMsg({ // 订阅消息
          tmplIds: templateIds,
          ok: () => {
            openDrawModal();
          },
          fail: () => {
            openDrawModal();
          },
        });
      } else {
        openDrawModal();
      };
    } else {
      loginHandler();
    }
  };

  /**
   * 根据用户参加的中奖码集合数量获取用户的抽奖状态
   */
  const getUserInfoState = async (id) => {
    const res = await service.getUserCode(id);
    const len = res.data?.list?.length;
    if (len) {
      setUserParticipateCount(len);
      if (detailData.state === EnumDrawState.ing) { // 未开奖
        setUserDrawState(EnumUserState.participated);
      } else if (detailData.state === EnumDrawState.done) { // 已开奖
        if (detailData.winStatus === EnumUserState.noWin) { // 未中奖
          setUserDrawState(EnumUserState.noWin);
        } else if (detailData.winStatus === EnumUserState.won) { // 中奖
          setUserDrawState(EnumUserState.won);
        } else if (detailData.winStatus === EnumUserState.received) {
          setUserDrawState(EnumUserState.received);
        }
      };
    } else {
      setUserDrawState(EnumUserState.no);
    }
  }


  /**
   * 获取抽奖头像
   */
  const getUserList = async (id) => {
    const res = await service.getUserList(id);
    setAvatarList(res.data || []);
  };

  /**
   * 获取中奖者名单
   */
  const getWinnerList = (id) => {
    service.getWinnerList(id).then((res) => {
      setWinnerList(res.data);
    });
  }

  /**
   * 添加微信
   */
  const addWechat = () => {
    Taro.previewImage({
      current: '', // 当前显示图片的http链接
      urls: ["https://draw.placeholder.cn/image/xiaozhuli.jpeg"] // 需要预览的图片http链接列表
    });
  };

  /**
   * 去兑换
   */
  const receive = () => {
    setDrawModalVisible(true);
    setModalType(EnumModalType.receive);
  };

  const onModalClose = () => {
    setDrawModalVisible(false)
    initData();
  };

  /**
   * init数据
   */
  const initData = async () => {
    Taro.showNavigationBarLoading();
    await getDrawDetail(drawId);
    await getUserList(drawId);
  }

  /**
   * 跳到首页
   */
  const toHome = () => {
    Taro.switchTab({
      url: "/pages/index/index"
    });
  }

  useEffect(() => {
    if (isLogin) {
      getUserInfoState(drawId);
    }
    if (detailData.state === EnumDrawState.done) {
      getWinnerList(detailData.id);
    }
  }, [detailData]);

  // mount
  useEffect(() => {
    Taro.showShareMenu({
      withShareTicket: true
    });
  }, []);

  // 下拉刷新
  usePullDownRefresh(() => {
    initData();
  })

  useDidShow(() => {
    if (!isLogin) {
      Taro.showToast({
        title: "先去登录吧~",
        icon: "none",
        duration: 1500
      });
      setTimeout(() => {
        loginHandler();
      }, 1500);
      return;
    } else {
      initData();
    };
  });

  useReady(() => { })

  /**
   * 分享
   */
  useShareAppMessage(res => {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      // title: detailData.name,
      title: '各种好货，免费拿回家',
      path: `pages/index/index?${EnumUrlParamKey.entryKey}=${EnumEntryKey.detailPage}&${EnumUrlParamKey.drawId}=${detailData.id}`,
      imageUrl: detailData.imgSrc
    }
  });

  /**
  * 渲染抽奖状态部分
  * @returns
  */
  const renderDrawState = () => {
    const restCount = detailData.restCouponCount;
    if (detailData.state === EnumDrawState.ing) {
      return <>
        {
          restCount <= 0 ? <View className='rest-coupon bold orange'>奖券已满，即将开奖！</View> : <View className='rest-coupon'>剩余<Text className='orange mlr-8'>{restCount}</Text>奖券自动开奖</View>
        }
        <View className='end-date'>开奖日期 ｜ {detailData.publicDate + ' ' + detailData.publicTime} </View>
      </>
    } else if (detailData.state === EnumDrawState.done) {
      return <>
        <View className='rest-coupon'>已开奖</View>
        <View className='end-date'>开奖日期 ｜ {detailData.publicDate + ' ' + detailData.publicTime} </View>
      </>
    } else if (detailData.state === EnumDrawState.reject) {
      return <>
        <View className='draw-stat orange'>抽奖异常！</View>
        <View className='draw-count'>您共投入 {userParticipateCount * detailData.costCount} 奖券。</View>
      </>
    }
  };

  /**
   * 渲染用户获抽奖状态部分
   * @returns
   */
  const renderUserState = () => {
    // 抽奖中
    if (detailData.state === EnumDrawState.ing) {
      if (userDrawState === EnumUserState.no) {
        return <>
          <View className='draw-stat'>暂未获得抽奖资格</View>
          <View className='draw-count'>快来参加赢取奖品吧！</View>
        </>
      } else if (userDrawState === EnumUserState.participated) {
        return <>
          <View className='draw-stat'>您已获得抽奖资格</View>
          <View className='draw-count'>您已累计投入 {userParticipateCount * detailData.costCount} 奖券，投入越多中奖概率越高哦！</View>
        </>
      };
    }
    // 抽奖结束
    if (detailData.state === EnumDrawState.done) {
      if (userDrawState === EnumUserState.won) {
        return <>
          <View className='draw-stat orange'>恭喜您！中奖了～</View>
          <View className='draw-count'>您共投入 {userParticipateCount * detailData.costCount} 奖券。</View>
        </>
      } else if (userDrawState === EnumUserState.noWin) {
        return <>
          <View className='draw-stat orange'>很遗憾，您没有中奖</View>
          <View className='draw-count'><Text className='tag-a' onClick={toHome}>去参加其他活动赢取奖品吧！</Text></View>
        </>
      } else if (userDrawState === EnumUserState.received) {
        return <>
          <View className='draw-stat orange'>奖品已兑换</View>
          <View className='draw-count'><Text className='tag-a' onClick={toHome}>运气不错，去参加其他活动赢取更多奖品吧！</Text></View>
        </>
      } else {
        return <>
          <View className='draw-stat orange'>活动已结束</View>
          <View className='draw-count'><Text className='tag-a' onClick={toHome}>去参加其他活动赢取奖品吧！</Text></View>
        </>
      }
    };
  };

  /**
   * 渲染抽奖按钮
   * @returns
   */
  const renderDrawButton = () => {
    if (detailData.state === EnumDrawState.ing) {
      const restCount = detailData.restCouponCount;;
      if (restCount <= 0) {
        return <Button className='participate-btn'>待开奖</Button>
      }
      return <Button className='participate-btn' onClick={drawHandler}>使用 {detailData.costCount} 奖券抽奖</Button>
    } else if (detailData.state === EnumDrawState.done) {
      if (userDrawState === EnumUserState.won) {
        return <Button className='participate-btn orange-bg' onClick={receive}>去兑换</Button>
      }
      if (userDrawState === EnumUserState.received) {
        return <Button className='participate-btn gray'>已兑换</Button>
      }
      return <Button className='participate-btn gray'>已开奖</Button>
    }
  };

  return <View className={
    classnames({
      'detail-page': true,
      "draw-done": detailData.state === EnumDrawState.done && (detailData.winStatus === EnumUserState.noWin || detailData.winStatus === EnumUserState.no),
      "draw-won": detailData.state === EnumDrawState.done && (detailData.winStatus === EnumUserState.won || detailData.winStatus === EnumUserState.received),
    })
  }>
    <Swiper
      className='detail-swiper'
      indicatorColor='#666'
      indicatorActiveColor='#FE3629'
      circular
      indicatorDots
    >
      <SwiperItem>
        <Image className='swiper-img' src={detailData.imgSrc} />
      </SwiperItem>
    </Swiper>
    <View className='detail-main'>
      <View className='draw-top'>
        {renderDrawState()}
        <View className='goods-info'>
          <View className='goods-name'><Text className="high-light">奖品：</Text><Text className='award-name'>{detailData.name}</Text></View>
          {/* <View className='goods-name'><Text className="high-light">二等奖：</Text><Text className='award-name'>最高20元红包</Text> x <Text className="high-light">100份</Text></View> */}
          <View className='goods-info-bottom'>
            <View className='goods-price'>参考价值：<View className='price-primary'>¥{detailData.price || "暂无"}</View></View>
            <View className='draw-cost'>{detailData.costCount}奖券/次</View>
            <View className='goods-count'>共{detailData.awardCount}份</View>
          </View>
        </View>
      </View>
      <View className='draw-info'>
        {renderUserState()}
        {
          detailData.state === EnumDrawState.done ?
            <View className='winner-list-wrapper'>
              <View className='winner-list-title'>中奖者名单</View>
              <View className='winner-list'>
                {
                  winnerList.map((usr, index) => (
                    <View className='usr-info-item' key={index}>
                      <Image className='user-info-avatar' src={usr.url} />
                      <View className='user-info-name'>
                        {usr.name}
                      </View>
                    </View>
                  ))
                }
              </View>
            </View> : null
        }
        <View className='participate-info'>
          <View className='user-avatar-list'>
            {
              avatarList.slice(0, 6).map(item =>
                <View className='user-avatar-wrap'>
                  <Image className='user-avatar' src={item.url} />
                </View>)
            }
          </View>
          <View className='person-count'>已有{avatarList.length}人参加，共投入奖券 <Text className='high-light'>{detailData.currentCouponCount}</Text></View>
          <Button className='see-more'></Button>
        </View>
      </View>
      <View className='introduce'>
        抽奖流程：
        <View className='draw-step-list'>
          <View className='draw-step'>
            <View className={
              classnames({
                "draw-step-block": true,
                'active': detailData.state === EnumDrawState.ing
              })
            }>参与抽奖</View>
            <View className='draw-time'>{detailData.startDate}</View>
            <View className='draw-time'>{detailData.startTime}</View>
          </View>
          <View className='draw-step'>
            <View className={
              classnames({
                "draw-step-block": true,
                'active': detailData.state === EnumDrawState.done && detailData.winStatus !== EnumUserState.won && detailData.winStatus !== EnumUserState.received
              })
            }>公布结果</View>
            <View className='draw-time'>{detailData.publicDate}</View>
            <View className='draw-time'>{detailData.publicTime}</View>
          </View>
          <View className='draw-step'>
            <View className={
              classnames({
                "draw-step-block": true,
                'active': detailData.state === EnumDrawState.done && detailData.winStatus === EnumUserState.won
              })
            }>中奖兑换截止</View>
            <View className='draw-time'>{detailData.exchangeDate}</View>
            <View className='draw-time'>{detailData.exchangeTime}</View>
          </View>
        </View>
      </View>
      <View className='introduce'>
        <View className='introduce-title'>抽奖说明：</View>
        <View className='introduce-row'>本期奖品：【{detailData.name}】，共【{detailData.awardCount}】份。</View>
        <View className='introduce-row'>每参与1次抽奖将消耗【{detailData.costCount}】奖券，参与次数越多中奖概率越大哦！</View>
        <View className='introduce-row'>开奖规则：到期开奖或者满券开奖。但是无论哪种开奖，单次参与中奖概率固定。</View>
        <View className='introduce-row'>开奖成功后，请在【10】个工作日内填写邮寄地址，以便及时为您寄出，过期未填写则视为放弃。未中奖用户所使用的奖券将不会退还。</View>
        <View className='introduce-row'>请合规参与抽奖，若出现刷票等异常行为将不予发放，不支持7天无理由退换货。</View>
      </View>
    </View>
    <View className='participate-btn-area'>
      {renderDrawButton()}
    </View>
    {/* 抽奖弹框 */}
    <DrawModal visible={drawModalVisible} type={modalType} data={detailData} onClose={onModalClose} />
  </View>
};

const mapStateToProps = store => {
  return store
};

export default connect(mapStateToProps)(DrawDetail)
