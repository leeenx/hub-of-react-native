/**
 * @author lienxin
 * @description css3 的 transform 方法，补全 React Native 一些缺失
 */

const {
  sqrt,
  cos,
  sin,
  tan,
  atan,
  PI
} = Math
// 3d
function translate3d (x, y, z) {
  return [
    1, 0, 0, x,
    0, 1, 0, y,
    0, 0, 1, z,
    0, 0, 0, 1  
  ]
}
function translateX (x) {
  return translate3d(x, 0, 0)
}
function translateY (y) {
  return translate3d(0, 1, 0)
}
function translateZ (z) {
  return translate3d(0, 0, 1)
}
function scale3d (x, y, z) {
  return [
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1,
  ]
}
function scaleX (x) {
  return scale3d(x, 1, 1)
}
function scaleY (y) {
  return scale3d(1, y, 1)
}
function scaleZ (z) {
  return scale3d(1, 1, z)
}
function rotate3d (x, y, z, angle) {
  const rad = toRad(angle)
  const radZ = -atan(y / x)
  const radY = -atan(sqrt(x * x + y * y) / z)
  return matrix3dBy(
    rotateZ(-radZ),
    rotateY(-radY),
    rotateZ(rad),
    rotateY(radY),
    rotateZ(radZ)
  )
}
function rotateX (angle) {
  const rad = toRad(angle)
  return [
    1, 0, 0, 0,
    0, cos(rad), -sin(rad), 0,
    0, sin(rad), cos(rad), 0,
    0, 0, 0, 1
  ]
}
function rotateY (angle) {
  const rad = toRad(angle)
  return [
    cos(rad), 0, sin(rad), 0,
    0, 1, 0, 0,
    -sin(rad), 0, cos(rad), 0,
    0, 0, 0, 1
  ]
}
function rotateZ (angle) {
  const rad = toRad(angle)
  return [
    cos(rad), -sin(rad), 0, 0,
    sin(rad), cos(rad), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]
}
// 2d
function translate (x, y = x) {
  return translate3d(x, y, 0)
}
function scale (x, y = x) {
  return scale3d(x, y, 1)
}
function rotate (rad) {
  return rotateZ(rad)
}
function skew (x) {
  return skewXY(x, 0)
}
function skewXY (x, y = x) {
  const radX = toRad(x)
  const radY = toRad(y)
  // 2d扩展为 matrix3d
  return [
    1, tan(radX), 0, 0,
    tan(radY), 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]
}
function skewX (x) {
  return skewXY(x, 0)
}
function skewY (y) {
  return skewXY(0, y)
}
// 2d matrix 转 3d
function matrix2dToMatrix3d (a, b, c, d, e, f) {
  return createCSS3Matrix3d(a, b, 0, c, d, e, 0, f, 0, 0, 1, 0)
}
function createCSS3Matrix3d (a, b, c, d, e, f, g, h, i, j, k, l) {
  // css3 的 matrix3d
  return [
    a, e, i, 0,
    b, f, j, 0,
    c, g, k, 0,
    d, h, l, 1
  ]
}
// 矩阵相乘
function matrix3dBy (...matrixes) {
  const matrixA = matrixes.shift()
  const matrixB = matrixes.shift()
  if (!matrixB) return matrixA
  const rows = fetchMatrixRow(matrixA)
  const cols = fetchMatrixCol(matrixB)
  const matrix = []
  rows.each(([r1, r2, r3, r4]) => {
    cols.each(([c1, c2, c3, c4]) => {
      matrix.push(
        r1 * c1 + r2 * c2 + r3 * c3 + r4 * c4
      )
    })
  })
  return matrix3dBy(matrix, ...matrixes)
}
// 获取矩阵的行
function fetchMatrixRow (matrix) {
  return {
    each (fetchRow) {
      // 肯定是4行
      const rowCount = 4
      let cur = 0
      while (cur < rowCount) {
        const startIndex = cur * rowCount
        const endIndex = startIndex + rowCount
        ++cur
        fetchRow(matrix.slice(startIndex, endIndex))
      }
    }
  }
}
// 获取矩阵的行
function fetchMatrixCol (matrix) {
  return {
    each (fetchCol) {
      // 肯定是4行
      const colCount = 4
      let cur = 0
      while (cur < colCount) {
        const items = []
        for (let i = 0; i < colCount; ++i) {
          const index = cur + i * colCount
          items.push(matrix[index])
        }
        ++cur
        fetchCol(items)
      }
    }
  }
}
// transform-origin
function setTransformOrigin (matrix3d, [ x = 0, y = x, z = 0 ], { width, height }) {
  if (!width || !height) {
    console.error('can set transform-origin! please set the propeties <width, height>')
  } else if (
    typeof width !== 'number' ||
    typeof height !== 'number'
  ) {
    console.error('can set transform-origin! expect number type of width/height')
  }
  [x, y] = [x - width / 2, y - height / 2]
  const [
    a, b, c, d,
    e, f, g, h,
    i, j, k, l
  ] = matrix3d
  return [
    a, b, c, x + d - a * x - b * y - c * z,
    e, f, g, y + h - e * x - f * y - g * z,
    i, j, k, z + l - i * x - j * y - k * z,
    0, 0, 0, 1
  ]
}
// 合并matrix3d
function mergeMatrix3ds (matrix3ds, origin = [0, 0, 0], dimension) {
  // 设置 transform-origin
  matrix3ds.forEach((matrix3d, index) => {
    matrix3ds[index] = setTransformOrigin(matrix3d, origin, dimension)
  })
  // 返回合成值
  return matrix3dBy(...matrix3ds)
}
// 度数转弧度
function degToRad (deg) {
  return deg / 180 * PI
}
// 梯度转弧度
function gradToRad (grad) {
  return grad / 200 * PI
}
// 圈度转弧度
function turnToRad (turn) {
  return turn * 2 * PI
}
// 转为弧度
function toRad (angle) {
  const value = parseFloat(angle)
  const unit = angle.toLowerCase().replace(`${value}`, '')
  switch (unit) {
    case 'deg':
      return degToRad(value)
    case 'grad':
      return gradToRad(value)
    case 'turn':
      return turnToRad(value)
    case 'rad':
    default:
      return value
  }
}

function transformFunToMatrix3d (name, transformParams) {
  const transformFunction = transformFunctions[name]
  if (transformFunction) {
    return transformFunction(...transformParams)
  } else {
    // 没有对应的 transform-function
    return matrix(1, 0, 0, 0, 1, 0)
  }
}

// 方法集
export const transformFunctions = {
  translate,
  translate3d,
  translateX,
  translateY,
  translateZ,
  scale,
  scale3d,
  scaleX,
  scaleY,
  scaleZ,
  rotate,
  rotate3d,
  rotateX,
  rotateY,
  rotateZ,
  skew,
  skewX,
  skewY,
  skewXY,
  matrix: matrix2dToMatrix3d,
  matrix3d: createCSS3Matrix3d,
  transformFunToMatrix3d,
  degToRad,
  toRad
}

// 缓存
const transformCache = {}

// 将 transformStr 转成 React Native 的 matrix3d
export default function transform (pattern, originStr, dimension) {
  if (!transformCache[pattern]) {
    const transformStrList = pattern
      .replace(/^\s+|\s+$/g, '')
      .replace(/\,\s+/, ',')
      .replace(/\s+\(/, ')')
      .split(/\s+/)
    const matrix3ds = transformStrList.map(transformStr => {
      const index1 = transformStr.indexOf('(')
      const index2 = transformStr.indexOf(')')
      const transformFunName = transformStr.substring(0, index1)
      const [
        x,
        y = x,
        z = '0',
        angle = '0'
      ] = transformStr.substring(index1 + 1, index2).split(',')
      return transformFunToMatrix3d(transformFunName, [x, y, z, angle])
    })
    // origin
    const origin = (
      originStr !== null ?
        originStr.split(/\s+/).map(value => Number(value)) :
        [0, 0, 0]
    )
    // 合并 matrix3ds
    const matrix = createCSS3Matrix3d(
      ...mergeMatrix3ds(matrix3ds, origin, dimension)
    )
    transformCache[pattern] = [{ matrix }]
  }
  return transformCache[pattern]
}
