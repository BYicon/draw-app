import React, { useEffect, useState } from 'react';
import { View, Swiper, SwiperItem, Image, Button, Text } from '@tarojs/components';
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro';
import './Record.less';
import * as service from "../../common/api";
import { EnumOrderStatus } from '../../common/enum';
import { DEFAULT_SHARE_CONFIG } from '../../common/config';

enum EnumRecordType {
  participate = "0",
  win = "1",
}

interface IRecordData { name: string, id: number, price: number, url: string, lotteryId: number, shipmentStatus: EnumOrderStatus };

export default function RecordPage() {
  const { params } = Taro.useRouter();
  const type = params.type;
  const isWonPage = type + "" == EnumRecordType.win;
  const [recordList, setRecordList] = useState<IRecordData[]>([]);

  /**
  * 跳转到详情
  */
  const goDetail = (id) => () => {
    Taro.navigateTo({
      url: '/pages/DrawDetail/DrawDetail?id=' + id,
    })
  }

  /**
   * 跳转到首页
   */
   const goIndex = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    })
  }

  useDidShow(() => {
    service.getDrawRecordList({
      type: type,
      pageNum: 1,
      pageSize: 99,
    }).then(res => {
      setRecordList(res?.data?.list || []);
    });
    Taro.setNavigationBarTitle({
      title: isWonPage ? '中奖记录' : '参与的抽奖',
    })
  })

  const renderBtn = (recordData: IRecordData) => {
    if (isWonPage) {
      if (recordData.shipmentStatus !== EnumOrderStatus.noReveive) {
        return <Button className="primary-btn disabled">已兑换</Button>
      }
      return <Button className="primary-btn">去兑换</Button>
    } else {
      return <Button className="primary-btn disabled">已抽奖</Button>
    }
  }

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

  return <View className='record-page'>
    {
      recordList.length > 0 ? <View className="record-list">
        {
          recordList.map((recordData) =>
            <View className='record-item' key={recordData.id} onClick={goDetail(recordData.lotteryId)}>
              <Image className='record-img' src={recordData.url} />
              <View className='record-goods-name'>{recordData.name}</View>
              {/* <View className='price-primary'>¥ {recordData.price}</View> */}
              {
                renderBtn(recordData)
              }
            </View>)
        }
      </View> :
      <View className='no-data'>暂无记录，快<Text className="highlight" onClick={goIndex}>去抽奖</Text>吧</View>
    }
  </View>
};
