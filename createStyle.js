/**
 * @author leeenx
 * @description 创建样式的统一方法
 */

import {
  DeviceInfo,
  Dimensions,
  StatusBar,
  StyleSheet,
  Platform
} from 'react-native'

const LANDSCAPE = 'landscape'
const PORTRAIT = 'portrait'
// 状态栏高度
let statusBarHeight = StatusBar.currentHeight
const setStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    if (DeviceInfo.isIPhoneX_deprecated && getOrientation() === PORTRAIT) {
      // iPhoneX
      statusBarHeight = 44
    } else {
      statusBarHeight = 20
    }
  }
}
function getOrientation () {
  const { width, height } = Dimensions.get('window')
  return width > height ? LANDSCAPE : PORTRAIT
}

// 生成样式
function generateStyle ({ css = {}, styles }) {
  Object.assign(
    css,
    StyleSheet.create(
      typeof styles !== 'function' ?
      styles :
      styles()
    )
  )
  return css
}

// 挂载静态属性
function mountStaticProps () {
  // 设置状态栏高度
  setStatusBarHeight()
  const {
    width,
    height
  } = Dimensions.get('window')
  const {
    width: screenWidth,
    height: screenHeight
  } = Dimensions.get('screen')
  const props = {
    width,
    height,
    screenWidth,
    screenHeight,
    statusBarHeight,
    orientation: getOrientation()
  }
  for (const key in props) {
    createStyle[key] = props[key]
  }
}

const getOrientation = () => {
  const { width, height } = Dimensions.get('window');
  return width > height ? LANDSCAPE : PORTRAIT;
}

// 队列
const createStyleQueue = []

export default function createStyle (styles) {
  // 生成样式
  const css = generateStyle({styles})
  // 保存当前样式
  createStyleQueue.push({ css, styles })
  return css
}

// 挂载静态属性
mountStaticProps()

Dimensions.addEventListener('change', function () {
  // 重新生成样式
  createStyleQueue.forEach(generateStyle)
  // 更新静态属性
  mountStaticProps()
})
