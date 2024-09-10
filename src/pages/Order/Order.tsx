import React, { useEffect, useState } from 'react';
import Taro, { usePullDownRefresh, useShareAppMessage } from '@tarojs/taro';
import { View, Swiper, SwiperItem, Image, Button } from '@tarojs/components';
import './Order.less';
import * as dayjs from 'dayjs';
import arraySupport from "dayjs/plugin/arraySupport";
import * as service from "../../common/api";
import classNames from 'classnames';
import { EnumEntryKey, EnumOrderStatus, EnumUrlParamKey } from '../../common/enum';
import { IOrderData } from '../../common/interface';
import { DEFAULT_SHARE_CONFIG } from '../../common/config';

dayjs.extend(arraySupport);

const tabList = [
  {
    id: 0,
    name: "全部",
    state: EnumOrderStatus.all,
  },
  {
    id: 1,
    name: "待发货",
    state: EnumOrderStatus.wait,
  },
  {
    id: 2,
    name: "待收货",
    state: EnumOrderStatus.shipped,
  },
  {
    id: 3,
    name: "已完成",
    state: EnumOrderStatus.done,
  },
];

export default function OrderPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderList, setOrderList] = useState<IOrderData[]>([]);
  const tabChange = (e: any) => {
    setCurrentIndex(e.detail.current);
  };

  /**
   * 确认收货
   */
  const onConfirm = (order: IOrderData) => () => {
    service.confirmReceipt(order.id).then(() => {
      // Taro.showToast({
      //   title: "已完成",
      //   icon: "success",
      // })
      Taro.showModal({
        title: '恭喜您！',
        // showCancel: false,
        content: '运气真不错，快邀请好友也来参与吧！',
        success(res) {
          if (res.confirm) {

          }
        }
      });
      getOrderList(tabList[currentIndex].state);
    })
  }

  /**
   * 获取订单列表
   * @param state 订单状态
   */
  const getOrderList = (state) => {
    service.getOrderList({
      state: state,
      pageNum: 1,
      pageSize: 20,
    }).then(res => {
      const dataList = res?.data?.list
      if (dataList) {
        dataList.forEach((item) => {
          item.orderDate = dayjs(item.createTime).format("YYYY/MM/DD");
        })
        setOrderList(dataList);
      };
    });
  }

  /**
   * 查看物流
   */
  const viewState = () => {
      Taro.showToast({
        title: "暂不支持",
        icon: "none"
      })
  }

    /**
   * 跳转到详情
   */
     const goDetail = (id) => () => {
      Taro.navigateTo({
        url: '/pages/DrawDetail/DrawDetail?id=' + id,
      })
    }

  /**
   * 分享
   */
  useShareAppMessage(res => {
    if (res.from === 'button') {
      // @ts-ignore
      const order = res?.target?.dataset?.order;
      if(order) {
      // 来自页面内转发按钮
      return {
        ...DEFAULT_SHARE_CONFIG,
        path: `/pages/index/index?${EnumUrlParamKey.entryKey}=${EnumEntryKey.detailPage}&${EnumUrlParamKey.drawId}=${order.lotteryId}`,
        title: `我免费获得了「${order.name}」,快来试试吧！`,
        imageUrl: order.url
      }
      };
    }
    return {
      ...DEFAULT_SHARE_CONFIG,
    }
  });

  useEffect(() => {
    getOrderList(tabList[currentIndex].state);
  }, [currentIndex]);

  /**
   * 渲染订单按钮
   */
  const renderOrderBtn = (order: IOrderData) => {
    const state = order.shipmentStatus;
    if (state === EnumOrderStatus.wait) {
      return <>
        {/* <Button className="primary-btn-plain" onClick={viewState}>查看物流</Button> */}
        <Button className="primary-btn" openType='contact'>提醒发货</Button>
      </>
    };
    if (state === EnumOrderStatus.shipped) {
      return <>
        <Button className="primary-btn-plain" onClick={viewState}>查看物流</Button>
        <Button className="primary-btn" onClick={onConfirm(order)}>确认收货</Button>
      </>
    }
    if (state === EnumOrderStatus.done) {
      return <>
        {/* <Button className="primary-btn-plain">查看物流</Button> */}
        <Button className="primary-btn" openType='share' data-order={order}>分享给好友</Button>
      </>
    }
  }


  return <View className='order-page'>
    <View className="goat-tab">
      {
        tabList.map((tabItem, index) => <View className={
          classNames({
            "goat-tab-item": true,
            "active": currentIndex === tabItem.id
          })
        }
          onClick={() => setCurrentIndex(index)}
          key={tabItem.id}
        >
          {tabItem.name}
        </View>)
      }
    </View>
    <View className='tab-swiper-wrap'>
      <Swiper
        className='tab-swiper'
        indicatorDots={false}
        onChange={tabChange}
        current={currentIndex}
      >
        {
          tabList.map((tabItem) =>
            <SwiperItem className='tab-swiper-item' key={tabItem.id}>
              <View className='order-list'>
                {
                  orderList.map((item) => <View className='order' key={item.id}>
                    <View className='order-top'>
                      <View className='order-time'>{item.orderDate}</View>
                      <View className='order-stat'>待发货</View>
                    </View>
                    <View className='order-body' onClick={goDetail(item.lotteryId)}>
                      <View className='order-body-left'>
                        <Image className='order-img' src={item.url} />
                      </View>
                      <View className='order-body-right'>
                        <View className='order-goods-name'>{item.name}</View>
                        <View className='order-tag-list'>
                          <View className='order-tag'>正品保障</View>
                          <View className='order-tag'>包邮</View>
                        </View>
                        <View className='order-other'>
                          {/* <View className='price-primary'>¥ 199</View> */}
                          <View className='order-goods-count'>x 1</View>
                        </View>
                      </View>
                    </View>
                    <View className='order-NO'>订单号：{item.id}</View>
                    <View className='order-btn-area'>
                      {renderOrderBtn(item)}
                    </View>
                  </View>)
                }
                {
                  orderList.length === 0 ? <>
                    <View className='no-data'>暂无相关数据</View>
                  </> : null
                }
              </View>
            </SwiperItem>)
        }
      </Swiper>
    </View>
  </View>
};
