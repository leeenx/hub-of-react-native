// iOS hack of StatusBar.currentHeight
import {
  Dimensions,
  DeviceInfo,
  Platform,
  StatusBar
} from 'react-native'
const LANDSCAPE = 'landscape'
const PORTRAIT = 'portrait'
const setStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    if (DeviceInfo.isIPhoneX_deprecated && getOrientation() === PORTRAIT) {
      // iPhoneX
      StatusBar.currentHeight = 44
    } else {
      StatusBar.currentHeight = 20
    }
  }
}
const getOrientation = () => {
  const { width, height } = Dimensions.get('window');
  return width > height ? LANDSCAPE : PORTRAIT;
}
setStatusBarHeight()
// 监听
Dimensions.addEventListener('change', setStatusBarHeight)
