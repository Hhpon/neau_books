import '@common/scss/variable.scss';
import { Component } from 'react';
import 'taro-ui/dist/style/index.scss';
import Taro from '@tarojs/taro';

import './app.scss';
import './icon.scss';

class App extends Component {
  constructor() {
    super();

    if (Taro.getEnv() === 'WEAPP') {
      Taro.cloud.init({
        env: 'neaubooks-ua606',
      });
    }
  }
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  render() {
    // this.props.children 是将要会渲染的页面
    return this.props.children;
  }
}

export default App;
