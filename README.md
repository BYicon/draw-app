# 微信抽奖小程序

这是一个微信抽奖的小程序代码仓库，开发于 **2022年**。主要功能是用户通过做任务获得奖券，并且可以使用奖券参与抽奖，赢取一些实物商品。

由于微信更新了条款限制，线上版本的小程序已经停止运行。不过，代码中包含了一些有用的技术实现，未来可能会用到，特此上传到 GitHub 方便查阅和参考。

## 主要技术栈

- **Taro/React**: 基于 Taro 框架开发，支持跨平台，主要使用 React 进行界面开发
- **taro-ui**: 使用 Taro-UI 作为 UI 组件库，提供简洁的界面
- **dva**: 状态管理工具，用于管理全局状态和异步操作
- **cryptoJs**: 用于数据加密，保证数据的安全性

## 主要技术点

- **数据加密**: 使用 `cryptoJs` 对敏感数据进行加密，确保用户数据安全
- **接口防刷**: 通过加密和限流机制，防止恶意用户刷接口
- **海报生成**: 用户可以生成带有自己邀请码的邀请海报，供分享使用
- **邀请奖励**: 通过邀请好友注册、参与活动，获取奖励的逻辑
- 

# WeChat Draw Mini Program

This repository contains the code for a **WeChat Draw Mini Program**, developed in **2022**. The main feature of this project is allowing users to earn lottery tickets by completing tasks, which can be used to enter lotteries for real physical prizes.

Due to changes in WeChat's terms of service, the online version of this mini program has been discontinued. However, the code includes some useful features that may be useful in the future. The project is uploaded to GitHub for easy reference.

## Tech Stack

- **Taro/React**: The project is built using the Taro framework, which supports cross-platform development with React.
- **taro-ui**: UI components from Taro-UI are used to provide a clean and modern interface.
- **dva**: Used for global state management and handling asynchronous operations.
- **cryptoJs**: A library used to handle data encryption for security.

## Key Features

- **Data Encryption**: Sensitive data is encrypted using `cryptoJs` to ensure user data security.
- **API Abuse Prevention**: Encryption and rate-limiting techniques are used to protect APIs from malicious users.
- **Poster Generation**: Users can generate invitation posters with personalized referral codes to invite friends.
- **Referral Rewards**: The project implements a reward system where users can earn tickets by inviting friends to register and participate in the activity.
