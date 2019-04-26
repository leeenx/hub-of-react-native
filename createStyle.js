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
  const [
    marginTop,
    marginRight,
    marginBottom,
    marginLeft
  ] = fourValue(...arg)
  return {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft
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

// 处理 border
function border (...arg) {
  let [
    borderColor,
    borderWidth,
    borderStyle
  ] = [
    '#000',
    0,
    'solid'
  ]
  let hasSetColor = false
  let hasSetWidth = false
  let hasSetStyle = false
  arg.forEach(
    item => {
      if (isColor(item)) {
        if (!hasSetColor) {
          hasSetColor = true
          borderColor = item
        } else {
          throw `border: duplicate borderColor!`
        }
      } else if (typeof item === 'number') {
        if (!hasSetWidth) {
          hasSetWidth = true
          borderWidth = item
        } else {
          throw `border: duplicate borderWidth!`
        }
      } else if (isBorderStyle(item)) {
        if (!hasSetStyle) {
          hasSetStyle = true
          borderStyle = item
        } else {
          throw `border: duplicate borderStyle!`
        }
      } else {
        throw `border: invalid arguments!`
      }
    }
  )
  return {
    borderColor,
    borderWidth,
    borderStyle
  }
}

// 处理 borderWidth
function borderWidth (...arg) {
  const [
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth,
    borderLeftWidth
  ] = fourValue(...arg)
  return {
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth,
    borderLeftWidth
  }
}

// 处理 borderStyle
function borderStyle (...arg) {
  const [
    borderTopStyle,
    borderRightStyle,
    borderBottomStyle,
    borderLeftStyle
  ] = fourValue(...arg)
  return {
    borderTopStyle,
    borderRightStyle,
    borderBottomStyle,
    borderLeftStyle
  }
}

// 处理 borderColor
function borderColor (...arg) {
  const [
    borderTopColor,
    borderRightColor,
    borderBottomColor,
    borderLeftColor
  ] = fourValue(...arg)
  return {
    borderTopColor,
    borderRightColor,
    borderBottomColor,
    borderLeftColor
  }
}

// 处理 borderRadius
// 处理 borderColor
function borderRadius (...arg) {
  const [
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius
  ] = fourValue(...arg)
  return {
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius
  }
}

function isBorderStyle (style) {
  switch (style) {
    case 'solid':
    case 'dotted':
    case 'dashed':
      return true
    default:
      return false
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
  if (count === 1) {
    if (isHexRGB(arg[0])) {
      // 转入的是 hex 值
      return rgba(arg[0], 1)
    }
    throw `argument error, please call it like: rgb('#rgb') or rgb('#rrggbb')`
  } else if (count === 3) {
    return rgba(...arg, 1)
  }
  // 异常
  throw `function rgb expect 1 or 3 arguments, but ${count} argument(s) supply`
}

// rgba 颜色函数
function rgba (...arg) {
  const count = arg.length
  if (count === 1) {
    if (isHexRGBA(arg[0])) {
      const [
        red,
        green,
        blue,
        alpha
      ] = getRGBAFromHex(arg[0])
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`
    }
    throw `expect a parameter like #RRGGBBAA or #RGBA`
  } else if (count === 2) {
    if (isHexRGB(arg[0]) && typeof arg[1] === 'number') {
      const alpha = Math.min(arg[1], 1)
      const [
        red,
        green,
        blue
      ] = getRGBFromHex(arg[0])
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`
    }
    throw `arguments error, please call it like: rgba('#rgb', 0~1) or rgba('#rrggbb', 0~1)`
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
  throw `function rgba expect 1, 2 or 4 arguments, but ${count} argument(s) supply`
}

// 判断是不是颜色值
function isColor (color) {
  if (
    isHexRGB(color) ||
    isHexRGBA(color) ||
    color instanceof rgb ||
    color instanceof rgba ||
    /rgb\(.+\)/i.test(color) ||
    /rgba\(.+\)/i.test(color)
  ) {
    return true
  }
  return false
}

// 判断是不是 hex(#rgb 或 #rrggbb) 类型颜色
function isHexRGB (color) {
  return /^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/i.test(color)
}

// 判断是不是 hex(#rgba 或 #rrggbbaa) 类型颜色
function isHexRGBA (color) {
  return /^#[0-9a-f]{4}$|^#[0-9a-f]{8}$/i.test(color)
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
  const {
    hairlineWidth,
    absoluteFill,
    absoluteFillObject
  } = StyleSheet
  const props = {
    hairlineWidth,
    padding,
    margin,
    width,
    height,
    screenWidth,
    screenHeight,
    statusBarHeight,
    absoluteFill: absoluteFill,
    absoluteFillObject: absoluteFillObject,
    orientation: getOrientation(),
    boxShadow,
    textShadow,
    rgb,
    rgba,
    border,
    borderStyle,
    borderWidth,
    borderColor,
    borderRadius
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
