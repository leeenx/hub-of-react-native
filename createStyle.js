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
  styles = typeof styles !== 'function' ? styles : styles()
  if (styles instanceof Array) {
    // 找出数组中 common
    const commonStyles = styles.find(layoutStyles =>
      layoutStyles.layout === 'common' ||
      layoutStyles.layout === undefined
    ) || {}
    // 保证 commonStyles.layout 的值为 common
    commonStyles.layout = 'common'
    styles.forEach(layoutStyles => {
      // 如果没有 layout 项，表示它是一个公共样式
      const layout = layoutStyles.layout
      css[layout] = css[layout] || {}
      if (layout !== 'common') {
        // 合并样式
        const mergeStyles = {}
        // 拷贝 commonStyles
        for (const key in commonStyles) {
          if (key === 'layout') continue
          mergeStyles[key] = Object.assign({}, commonStyles[key])
        }
        // 与当前样式合并
        for (const key in layoutStyles) {
          if (key === 'layout') {
            mergeStyles[key] = layoutStyles[key]
          } else if (mergeStyles[key]) {
            // 合并
            Object.assign(
              mergeStyles[key],
              layoutStyles[key]
            )
          } else {
            // 新增
            mergeStyles[key] = layoutStyles[key]
          }
        }
        layoutStyles = mergeStyles
      }
      generateStyle({
        css: css[layout],
        styles: layoutStyles
      })
    })
  } else {
    const newStyles = Object.assign({}, styles)
    // 剔除 layout
    delete newStyles.layout
    Object.assign(
      css,
      StyleSheet.create(newStyles)
    )
  }
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

// rgb转hex函数
function rgb2Hex(red, green, blue) {
  return `#${hex(red)}${hex(green)}${hex(blue)}`
}

// 将 hex 转成 [r, g, b]
function getRGBFromHex (hex) {
  hex = hex.replace('#', '')
  const rgb = []
  const count = hex.length
  const step = count === 3 ? 1 : 2
  for (let i = 0; i < count; i += step) {
    const base10 = Number(`0x${hex.substr(i, step)}`).toString(10)
    rgb.push(base10)
  }
  return rgb
}

// 将 hex 转成 [r, g, b, a]
function getRGBAFromHex (hex) {
  const count = hex.length
  const step = count === 5 ? 1 : 2
  const alphaHex = Number(`0x${hex.substr(count - step, step)}`)
  const alpha = alphaHex / 255
  const [
    red,
    green,
    blue
  ] = getRGBFromHex(hex.substr(0, count - step))
  return [red, green, blue, alpha]
}

// 转16进制
function hex (base10) {
  const base16 = base10.toString(16)
  const len = base16.length
  if (len === 1) return `0${base16}`
  return base16
}

// rgb 颜色函数
function rgb (...arg) {
  const count = arg.length
  if (
    count === 1 &&
    typeof arg[0] === 'string' &&
    (arg[0].length === 3 || arg[0].length === 6) &&
    arg[0] === '#'
  ) {
    // 转入的是 hex 值
    return rgba(arg[0], 1)
  } else if (count === 3) {
    return rgba(...arg, 1)
  }
  // 异常
  throw `function rgb expect 1 or 3 arguments, but ${count} argument(s) supply`
}

// rgba 颜色函数
function rgba (...arg) {
  const count = arg.length
  if (
    count === 2 &&
    typeof arg[0] === 'string' &&
    (arg[0].length === 4 || arg[0].length === 7) &&
    arg[0][0] === '#' &
    typeof arg[1] === 'number'
  ) {
    const alpha = arg[1]
    const [
      red,
      green,
      blue
    ] = getRGBFromHex(arg[0])
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
  } else if (count === 4) {
    if (
      arg.every(item => typeof item === 'number')
    ) {
      const [
        red,
        green,
        blue,
        alpha
      ] = arg
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`
    }
    throw `please make sure every argument is a number`
  }
  // 异常
  throw `function rgba expect 2 or 4 arguments, but ${count} argument(s) supply`
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
    textShadow,
    rgb,
    rgba,
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
