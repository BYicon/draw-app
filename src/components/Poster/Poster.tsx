import React, { useImperativeHandle } from 'react';
import { Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import "./Poster.less";
interface IPoster {
  height?: number;
}

const defaultWidth = 682/2;
const defaultHeight = 1116/2;
const dprNum = Taro.getSystemInfoSync().pixelRatio;

const dpr = (num) => {
  return num * dprNum;
}


function Poster(props: IPoster, ref) {
  let canvas: any = null;
  let ctx: any = null;
  /**
   * 绘制图片
   * @param imgSrc 图片路径
   * @returns
   */
  const drawImage = (imgSrc: string) => {
    return new Promise((resolve) => {
      //图片
      Taro.getImageInfo({
        src: imgSrc,
        success(res) {
          const qrCodeImg = canvas.createImage();
          qrCodeImg.src = res.path;
          qrCodeImg.onload = () => {
            resolve({
              image: qrCodeImg,
              ...res,
            });
          }
        }
      })
    })
  }
  /**
   * 生成海报
   */
  const drawPoster = () => {
    Taro.showLoading({
      title: "海报生成中...."
    });
    Taro.createSelectorQuery().selectAll('#myCanvas').node(async res => {
      canvas = res[0].node;
      ctx = canvas.getContext('2d');
      const canvasWidth = dpr(defaultWidth);
      const canvasHeight = dpr(defaultHeight);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      // 画布背景
      ctx.fillStyle = "#e03c3c";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      const bgInfo: any = await drawImage("https://example.cn/qun.png");
      ctx.drawImage(bgInfo.image, 0, 0, bgInfo.width, bgInfo.height, 0, 0, canvasWidth, canvasHeight);

      // 文字
      // ctx.font = `bold ${dpr(18)}px/1 sans-serif`;
      // ctx.fillStyle = "#fff";
      // ctx.fillText("免费抽奖", dpr(24), canvasHeight - dpr(63));

      // 文字
      // ctx.font = `bold ${dpr(14)}px/1 sans-serif`;
      // ctx.fillStyle = "#ccc";
      // ctx.fillText("长按识别进入小程序", dpr(204), canvasHeight - dpr(15));


      //图片
      const qrCodeInfo: any = await drawImage("https://draw.placeholder.cn/image/draw-qrcode.png");
      ctx.drawImage(qrCodeInfo.image, 0, 0, qrCodeInfo.width, qrCodeInfo.height, canvasWidth * 0.5 - dpr(68), canvasHeight * 0.5 - dpr(90), dpr(140), dpr(140));

      Taro.canvasToTempFilePath({
        canvas,
        success(res) {
          Taro.hideLoading();
          Taro.previewImage({
            current: res.tempFilePath,
            urls: [res.tempFilePath],
          });
        }
      });
    }).exec()
  };


  useImperativeHandle(ref, () => ({
    drawPoster: () => {
      drawPoster();
    }
  }));


  return <Canvas className='poster-canvas' id='myCanvas' type='2d' style={{ width: defaultWidth + "px", height: defaultHeight + "px" }}></Canvas>
};


export default React.forwardRef(Poster);
