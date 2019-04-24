/**
 * @author lienxin
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

function fourValue (one = 0, two = one, three = one, four = two) {
  return [one, two, three, four]
}

// 处理 margin
function margin (...arg) {
  const [top, right, bottom, left] = fourValue(...arg)
  return {
    marginTop: top,
    marginRight: right,
    marginBottom: bottom,
    marginLeft: left
  }
}

// 处理 padding
function padding (...arg) {
  const [top, right, bottom, left] = fourValue(...arg)
  return {
    paddingTop: top,
    paddingRight: right,
    paddingBottom: bottom,
    paddingLeft: left
  }
}

// 处理阴影
function shadow (...arg) {
  let [offsetX, offsetY, radius, color] = [0, 0, 0, 'rgba(0, 0, 5, 0.5)']
  switch (arg.length) {
    case 2:
      [offsetX, offsetY] = arg
      break
    case 3:
      [offsetX, offsetY, color] = arg
    case 4:
    default:
      [offsetX, offsetY, radius, color] = arg
  }
  return {
    offset: {
      height: offsetY,
      width: offsetX
    },
    color,
    radius
  }

// 处理 boxShadow
function boxShadow (...arg) {
  const {
    offset,
    color,
    radius
  } = shadow(...arg)
  return {
    shadowOffset: offset,
    shadowColor: color,
    shadowRadius: radius,
    shadowOpacity: 1
  }
}

// 处理 textShadow
function textShadow (...arg) {
  const {
    offset,
    color,
    radius
  } = shadow(...arg)
  return {
    textShadowOffset: offset,
    textShadowColor: color,
    textShadowRadius: radius
  }
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
    padding,
    margin,
    width,
    height,
    screenWidth,
    screenHeight,
    statusBarHeight,
    absoluteFill: StyleSheet.absoluteFill,
    absoluteFillObject: StyleSheet.absoluteFillObject,
    orientation: getOrientation(),
    boxShadow,
    textShadow
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
