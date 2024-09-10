import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Button, Image } from '@tarojs/components';
import { AtModal, AtModalContent, AtModalAction } from "taro-ui";
import "./InviteModal.less";

interface IModal {
    type: 'success' | "fail";
    visible: boolean;
    onClose: () => void;
}

export enum EnumModalType {
    draw = 0,
    receive = 1,
};

export default function InviteModal(props: IModal) {
    const { visible, type, onClose } = props;
    return <>
        {
            type === "success" ? <AtModal isOpened={visible} className="invite-modal invite-modal-success" closeOnClickOverlay={false}>
                <AtModalContent className="invite-modal-content">
                    <View className="res-title">
                        好友已获得10奖券
                    </View>
                </AtModalContent>
                <View className='hot-area' onClick={onClose}></View>
                <Image className="close-icon" mode="widthFix" src="https://draw.placeholder.cn/image/close-icon.jpg" onClick={onClose} />
            </AtModal> :
                <AtModal isOpened={visible} className="invite-modal invite-modal-fail" closeOnClickOverlay={false}>
                    <AtModalContent className="invite-modal-content">
                        <View className="modal-title">
                            助力失败
                        </View>
                        <View className="res-title">
                            只有新人才能助力成功哦～
                        </View>
                    </AtModalContent>
                    <View className="close-btn" onClick={onClose}>
                            我知道了
                    </View>
                    <View className='hot-area' onClick={onClose}></View>
                    <Image className="close-icon" mode="widthFix" src="https://draw.placeholder.cn/image/close-icon.jpg" onClick={onClose} />
                </AtModal>
        }
    </>
};
