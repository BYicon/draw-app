# WeChat Draw Mini Program

This repository contains the code for a **WeChat Draw Mini Program**, developed in **2022**. The main feature of this project is allowing users to earn lottery tickets by completing tasks, which can be used to enter lotteries for real physical prizes.

Due to changes in WeChat's terms of service, the online version of this mini program has been discontinued. However, the code includes some useful features that may be useful in the future. The project is uploaded to GitHub for easy reference.

## Project Overview

- **Task System**: Users can earn lottery tickets by completing various tasks.
- **Lottery System**: Users can participate in lotteries using their tickets to win physical prizes.
- **Referral Rewards**: Users can invite friends to earn additional tickets as rewards.
- **Poster Generation**: Users can generate a custom poster with their referral code to share with others.
- **API Protection**: Mechanisms to protect against abuse and prevent API misuse.

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
