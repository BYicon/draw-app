import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Button, Textarea, Image, Text } from '@tarojs/components';
import { AtModal, AtModalContent, AtModalAction, AtIcon } from "taro-ui";
import * as service from "../../common/api";
import * as helper from "../../common/helper";
import "./DrawModal.less";
import { IGoodsData } from '../../common/interface';
import { EnumMessageTemplateId } from '../../common/enum';

interface IModal {
    type: EnumModalType;
    visible: boolean;
    data?: IGoodsData;
    onClose: () => void;
}

export enum EnumModalType {
    draw = 0,
    receive = 1,
};

export default function ReceiveModal(props: IModal) {
    const { visible, onClose, type, data } = props;
    const [address, setAddress] = useState({
        detail: "",
        name: "",
        phone: "",
    });
    const [remark, setRemark] = useState("");
    /**
     * 选择地址
     */
    const chooseAddress = () => {
        Taro.chooseAddress({
            success: (res) => {
                if (res.errMsg === "chooseAddress:ok") {
                    setAddress({
                        detail: res.provinceName + res.cityName + res.countyName + res.detailInfo,
                        name: res.userName,
                        phone: res.telNumber,
                    });
                } else {
                    Taro.showToast({
                        title: "选择地址失败,请联系客服",
                        icon: "none"
                    })
                }
            },
            fail: function (err) {
                // chooseAddress:fail auth deny 拒绝授权 主动拒绝后 只有用户清除小程序 才能重新拉起授权
                // chooseAddress:fail cancel 同意授权 但是 取消选择地址
                if (err.errMsg === "chooseAddress:fail auth deny") {
                    Taro.showToast({
                        title: "主动拒绝后 只有用户清除小程序 才能重新拉起授权",
                        icon: "none",
                        duration: 4000,
                    })
                };
            }
        })
    };

    /**
     * 兑换确定
     */
    const onConfirm = () => {
        if (!address.detail) {
            Taro.showToast({
                title: "请选择地址",
                icon: "none",
                duration: 1500,
            });
            return;
        }
        service.receive({
            drawId: data?.id,
            address: address.detail,
            name: address.name,
            phone: address.phone,
            remark: remark,
        }).then(() => {
            Taro.showToast({
                title: "兑换成功",
                icon: "success",
                duration: 1500,
            });
            setTimeout(() => {
                helper.subscribeMsg({
                    tmplIds: [EnumMessageTemplateId.orderStateChange],
                    ok: () => {
                    },
                    fail: () => {
                    }
                });
            })
            onClose();
        });
    };

    /**
     * 填写备注
     * @param e evt
     */
    const onRemarkChange = (e) => {
        setRemark(e.detail.value);
    }

    return <AtModal isOpened={visible} className="receive-modal" closeOnClickOverlay={false}>
        {
            type === EnumModalType.draw ?
                <>
                    <AtModalContent className="receive-modal-content center-wrap got-qualification">
                        <View className="res-title">
                            获得抽奖资格
                        </View>
                        <View className="res-desc">
                            将于{data?.publicDate} {data?.publicTime}开奖
                        </View>
                    </AtModalContent>
                    <AtModalAction> <Button className='participate-btn' onClick={onClose}>我知道了</Button> </AtModalAction>
                </>
                : null

        }
        {
            type === EnumModalType.receive ?
                <>
                    {/* <AtModalHeader>兑换奖品</AtModalHeader> */}
                    <AtModalContent className="receive-modal-content receice">
                        <View className="my-address" onClick={chooseAddress}>
                            <View className="address-title">我的地址</View>
                            <View className="address-info">
                                <AtIcon value='map-pin' size='20' color='#101010'></AtIcon>
                                {
                                    !address.detail ?
                                        <View className="address high-light">请选择地址</View> :
                                        <View className="address">
                                            <View>{address.detail}</View>
                                            <View className="address-usr">{address.name}&nbsp;&nbsp;&nbsp;{address.phone}</View>
                                        </View>
                                }
                                <AtIcon value='chevron-right' size='16' color='#333'></AtIcon>
                            </View>
                        </View>
                        <View className='goods-info-wrapper'>
                            <Image
                                className='goods-img-r'
                                src={data?.imgSrc || ""}
                                />
                            <View className='goods-info-r'>
                                <View className='goods-name-r'>{data?.name} </View>
                                <View className='order-tag-list'>
                                    <View className='order-tag'>正品保障</View>
                                    <View className='order-tag'>包邮</View>
                                </View>
                                <View className='goods-info-other'>
                                    <Text className='price-primary f-24'>¥{data?.price || 0} </Text>
                                    <Text>x1</Text>
                                </View>
                            </View>
                        </View>
                        <Textarea className="text-area" value={remark} onInput={onRemarkChange} maxlength={40} placeholder='请输入订单备注（选填）' autoHeight />
                    </AtModalContent>
                    <AtModalAction>
                        <Button className='participate-btn' onClick={onConfirm}>兑换</Button>
                    </AtModalAction>
                    <AtIcon className='cross' value='close-circle' size='32' color='#fff' onClick={onClose}></AtIcon>
                </> : null
        }
    </AtModal>
};
