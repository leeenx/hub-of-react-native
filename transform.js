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
function rotate3d (x, y, z, deg) {
  const degZ = -atan(y / x) * 180 / PI
  const degY = -atan(sqrt(x * x + y * y) / z) * 180 / PI
  return matrix3dBy(
    rotateZ(-degZ),
    rotateY(-degY),
    rotateZ(deg),
    rotateY(degY),
    rotateZ(degZ)
  )
}
function rotateX (deg) {
  const rad = degToRad(deg)
  return [
    1, 0, 0, 0,
    0, cos(rad), -sin(rad), 0,
    0, sin(rad), cos(rad), 0,
    0, 0, 0, 1
  ]
}
function rotateY (deg) {
  const rad = degToRad(deg)
  return [
    cos(rad), 0, sin(rad), 0,
    0, 1, 0, 0,
    -sin(rad), 0, cos(rad), 0,
    0, 0, 0, 1
  ]
}
function rotateZ (deg) {
  const rad = degToRad(deg)
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
function rotate (deg) {
  return rotateZ(deg)
}
function skew (x) {
  return skewXY(x, 0)
}
function skewXY (x, y = x) {
  const radX = degToRad(x)
  const radY = degToRad(y)
  console.log(radX, radY)
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
function createCSS3Matrix3d (a, b, c, d, e, f, g, h, i, j, k, l) {
  // css3 的 matrix3d
  const css3Matrix3d = [
    a, e, i, 0,
    b, f, j, 0,
    c, g, k, 0,
    d, h, l, 1
  ]
  return `matrix3d(${css3Matrix3d.join(',')})`
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
function setTransformOrigin (x = 0, y = x, z = 0) {
  return matrix => {
    const [
      a, b, c, d,
      e, f, g, h,
      i, j, k, l
    ] = matrix
    return [
      a, b, c, x + d - a * x - b * y - c * z,
      e, f, g, y + h - e * x - f * y - g * z,
      i, j, k, z + l - i * x - j * y - k * z,
      0, 0, 0, 1
    ]
  }
}
// 这个方法应该不会被调用
function genCSS3Transform (...transforms) {
  let setOrigin = matrix => matrix
  const matrix3ds = transforms.filter(
    matrix3d => {
      if (typeof matrix3d === 'function') {
        setOrigin = matrix3d
        return false
      }
      return true
    }
  ).map(matrix3d =>
    createCSS3Matrix3d(...setOrigin(matrix3d))
  ).join(' ')
  return `transform: ${matrix3ds}`
}
function degToRad (deg) {
  // 度数转弧度
  return deg / 180 * PI
}
