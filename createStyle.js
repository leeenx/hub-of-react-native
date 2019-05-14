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
const { isIPhoneX_deprecated } = DeviceInfo
// 状态栏高度
let statusBarHeight = StatusBar.currentHeight
const setStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    if (isIPhoneX_deprecated && getOrientation() === PORTRAIT) {
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

// nth-child函数
function nth (pattern) {
  const index = nth.count++
  const styleName = `:nth-child-${index}`
  nth.map[styleName] = {
    styleName,
    test: genTest(pattern)
  }
  return `:nth-child-${index}`
}
// 表示 nth-child 的 classname 的集合
nth.map = []
// 缓存
nth.cache = {}
nth.count = 0
nth.query = (nthList, css, ...args) => {
  const cacheKey = `${nthList['#key']}|${args.join('|')}`
  const cache = nth.cache[cacheKey]
  if (cache) return cache
  // 要返回的 styles 数组
  let styles = []
  const len = args.length
  const lastIndex = len - 1
  const last = Number(args[lastIndex])
  if (isNaN(last)) {
    // 没有 nthChild 扩展
    styles = args.map(styleName => css[styleName])
  } else {
    // 使用 css 的索引标准
    const index = last + 1
    // 将 index 从 args 中移除
    args.pop()
    const styleNames = args
    styleNames.forEach(styleName => {
      styles.push(css[styleName])
      if (nthList[styleName]) {
        // 存在 nthChild 扩展
        nthList[styleName].forEach(
          ({ test, styleName }) => {
            if (test(index)) {
              // 与 nthChild 匹配
              styles.push(css[styleName])
            }
          }
        )
      }
    })
  }
  nth.cache[cacheKey] = styles
  return styles
}

// 生成 styleNames 方法
function createStyleNames (nthList, css) {
  return (...arg) => {
    const styleNames = []
    let nthChildIndex = -1
    arg.forEach(styleName => {
      if (
        typeof styleName === 'string' ||
        typeof styleName === 'number'
      ) {
        styleNames.push(styleName)
      } else if (typeof styleName === 'object') {
        for (const key in styleName) {
          const value = styleName[key]
          if (key === 'index') {
            nthChildIndex = value
            continue
          }
          if (typeof value === 'boolean' && value) {
            styleNames.push(key)
          }
        }
      }
      if (nthChildIndex >= 0) {
        styleNames.push(nthChildIndex)
      }
    })
    return nth.query(nthList, css, ...styleNames)
  }
}

// 生成一个不会重复的 key 值
function genKey () {
  return `${Date.now()}-${genKey.count++}`
}

genKey.count = 0

// 生成检验 pattern 和 test 方法
function genTest (pattern) {
  const reg = /(^\-?\d+n?|^\d*n)(\-|\+(\d+n?|\d*n))*$/
  if (reg.test(pattern)) {
    if (typeof pattern === 'number') {
      return index => index === pattern
    } 
    // 运算符
    const operators = pattern.split(/\d*n|\d+n?/)
    // 数字
    const components = pattern.split(/\+|\-/)
    // 剔除头尾无效的运算符
    operators[0] === '' && operators.shift()
    operators[operators.length - 1] === '' &&
    operators.pop()
    // 剔除第一个无效数字
    components[0] === '' && components.shift()
    // 保证第一个 components 都带[+, -]
    if (operators.length < components.length) {
      operators.unshift('+')
    }
    // 将 pattern 合并成标准格式：an + b
    let a = 0
    let b = 0
    for (let i = 0; i < components.length; ++i) {
      const operator = operators[i]
      const component = components[i]
      const sum = operatorAdd(
        b,
        operator,
        Number(component)
      )
      if (!isNaN(sum)) {
        b = sum
      } else {
        a = operatorAdd(
          a,
          operator,
          parseInt(component)
        )
      }
    }
    return index => (index - b) % a === 0
  } else {
    // 样本格式不正确
    console.error('error pattern')
  }
}
// 加减操作
function operatorAdd (num1, operator, num2) {
  if (operator === '+') {
    return num1 + num2
  }
  return num1 - num2
}

// 添加原料快照
function addStyleSnap (snap, layoutStyle) {
  const { layout = 'common' } = layoutStyle
  snap[layout] = layoutStyle
}

// 布局管理 
function createLayoutManager (css) {
  let currentLayout = css.common
  const layouts = (...arg) => {
    const argMap = arg[0]
    const argList = []
    if (typeof argMap === 'object') {
      for (const key in argMap) {
        const value = argMap[key]
        value && argList.push(key)
      }
      layouts(...argList)
    } else {
      const layout = arg.join('&')
      css[layout] = css[layout] || {}
      const layoutStyle = css[layout]
      const {
        rawStyles,
        rawStyleSnap
      } = css
      if (!layoutStyle) {
        // 新增一个 layoutStyle
        addLayoutStyle({
          css: css[layout],
          rawStyles,
          rawStyleSnap,
          layoutStyle: {
            layout,
            '@extendLayouts': arg
          }
        })
      }
      currentLayout = layoutStyle
    }
  }
  const styleNames = (...arg) => currentLayout.styleNames(...arg)
  return {
    layouts,
    styleNames
  }
}

// layout 复合
function compositeLayout (...layoutStyles) {
  const len = layoutStyles.length
  const targetLayout = layoutStyles[0]
  for (let i = 1; i < len; ++i) {
    const layoutStyle = layoutStyles[i]
    for (const key in layoutStyle) {
      const value = layoutStyle[key]
      if (key === 'layout') {
        // layout 保持不变 
        continue
      }
      if (targetLayout[key]) {
        // 样式合并
        Object.assign(
          targetLayout[key],
          value
        )
      } else {
        // 新增
        targetLayout[key] = Object.assign(
          {},
          value
        )
      }
    }
  }
  return targetLayout
}

// 新增 layoutStyle
function addLayoutStyle ({
  css = {},
  layoutStyle,
  rawStyles,
  rawStyleSnap
}) {
  const { layout } = layoutStyle
  if (layout) {
    rawStyles.push(layoutStyle)
    rawStyleSnap[layout] = layoutStyle
    generateStyle({ css, layoutStyle, rawStyleSnap })
  }
}

// 生成一组样式
function generateStyles ({ css = {}, styles }) {
  // 强制原料样式必须是一个数组
  const rawStyles = (
    styles instanceof Array ? styles : [styles]
  )
  // 将 styles 拍平
  const flatStyles = []
  // 原料快照
  const rawStyleSnap = {}
  rawStyles.forEach(rawStyle => {
    rawStyle = (
      typeof rawStyle === 'function' ? rawStyle() : rawStyle
    )
    if (rawStyle instanceof Array) {
      rawStyle.forEach(layoutStyle => {
        addStyleSnap(rawStyleSnap, layoutStyle)
        flatStyles.push(layoutStyle)
      })
    } else {
      addStyleSnap(rawStyleSnap, rawStyle)
      flatStyles.push(rawStyle)
    }
  })
  // 生成目标样式
  flatStyles.forEach(layoutStyle => {
    const { layout = 'common' } = layoutStyle
    css[layout] = css[layout] || {}
    generateStyle({ css: css[layout], layoutStyle, rawStyleSnap })
  })
  const {
    layouts,
    styleNames
  } = createLayoutManager(css)
  // 挂载
  Object.assign(
    css,
    {
      rawStyles,
      rawStyleSnap,
      layouts,
      styleNames
    }
  )
  return css
}

// 生成一个样式
function generateStyle ({ css = {}, layoutStyle, rawStyleSnap }) {
  const commonStyle = rawStyleSnap.common
  const extendLayoutNames = layoutStyle['@extendLayouts'] || []
  const extendLayouts = extendLayoutNames.map(
    layout => rawStyleSnap[layout]
  )
  const newStyle = compositeLayout(
    {},
    commonStyle,
    ...extendLayouts,
    layoutStyle
  )
  // 删除 @extendLayouts
  delete newStyle['@extendLayouts']
  // nth-child 功能
  const nthList = {
    '#key': genKey()
  }
  for (const name in newStyle) {
    const style = newStyle[name]
    for (const key in style) {
      if (key.indexOf(':nth-child-') === 0) {
        // 将 nth-child 的样式外移到 newStyle 上
        const nthChildStyle = style[key]
        delete style[key]
        // 按 styleName 来存储 nthList
        if (!nthList[name]) {
          nthList[name] = []
        }
        nthList[name].push(nth.map[key])
        newStyle[key] = nthChildStyle
      }
    }
  }

  Object.assign(
    css,
    StyleSheet.create(newStyle),
    {
      styleNames: createStyleNames(nthList, css)
    }
  )
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
  const isNull = (
    arg.length === 1 &&
    arg[0] === null
  )
  const {
    offset,
    color,
    radius
  } = shadow(...arg)
  return {
    shadowOffset: offset,
    shadowColor: color,
    shadowRadius: radius,
    shadowOpacity: isNull ? 0 : 1
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
    const base16 = hex.substr(i, step)
    const xhh = step === 2 ? base16 : `${base16}${base16}`
    const base10 = Number(`0x${xhh}`).toString(10)
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
    const rgb = arg[0]
    if (isHexRGB(rgb) && typeof arg[1] === 'number') {
      const alpha = Math.min(arg[1], 1)
      const [
        red,
        green,
        blue
      ] = getRGBFromHex(rgb)
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
    isIPhoneX: isIPhoneX_deprecated,
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
    borderRadius,
    nth
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
const cssQueue = []

export default function createStyle (styles) {
  // 生成样式
  const css = generateStyles({styles})
  // 保存当前样式
  cssQueue.push({ css })
  return css
}

// 挂载静态属性
mountStaticProps()

Dimensions.addEventListener('change', function () {
  // 重新生成样式
  cssQueue.forEach(
    css => generateStyles({
      css, styles: css.rawStyles
    })
  )
  // 更新静态属性
  mountStaticProps()
  // 重置 nth-child
  nth.map = []
  nth.cache = {}
  nth.count = 0
})
