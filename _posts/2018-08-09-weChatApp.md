---
layout: post
title: "wepy框架与taro框架对比"
date: 2018-08-09 0:34:26
image: '/assets/img/'
description: 'wepy框架与taro框架对比，你需要有一丢丢React和小程序开发经验'
main-class: 'FE'
color: '#B31917'
tags:
- Git
categories: Techology
twitter_text: 'wepy框架与taro框架对比'
introduction: 'wepy框架与taro框架对比'
---

### Ahri-珊

目前接触的小程序开发使用的wepy框架，有很多坑点，所以调研下taro框架，做个对比。

## 功能对比

wepy:

```text
类Vue开发风格

支持自定义组件开发

支持引入NPM包

支持Promise

支持ES2015+特性，如Async Functions

支持多种编译器，Less/Sass/Stylus/PostCSS、Babel/Typescript、Pug

支持多种插件处理，文件压缩，图片压缩，内容替换等

支持 Sourcemap，ESLint等

小程序细节优化，如请求列队，事件优化等
```

taro:

```text
支持使用 npm/yarn 安装管理第三方依赖。

支持使用 ES7/ES8 甚至更加新的 ES 规范，一切都可自行配置。

支持使用 CSS 预编译器，例如 Sass 等。

支持使用 Redux 进行状态管理。

小程序 API 优化，异步 API Promise 化。

支持多端开发转化（这个很坑，基本可忽略）。
```

## 代码风格对比

针对开发体验来说，taro非常利于习惯React编程的人。除了不支持refs，基本和react写法一致，代码检查也很给力。wepy的语法我是使用起来不太习惯，容易犯一些低级语法错误，也很难检查出来。当然啦，如果你非常习惯于wepy语法，这些就都不是问题了。

为了更好的对比，我用两个版本的语言写了一个音频播放卡片页。

在实现这个音频播放卡片页的时候，发现wepy的一个问题： `页面销毁时，需要手动充值播放器状态，否则下次进入时还停留在上次的状态`,taro无这问题。

以下例子变量： playing

- 变化的class(对npm库的支持)

wepy(使用classnames需要写到computed里，这里就不使用了):

{% highlight html %}
  <view :class="{playing ? 'controller transition' : playing}" />
{% endhighlight %}

taro(可直接使用classnames):

{% highlight html %}
  <View
    className={classnames({
      'controller': true,
      'transition': playing,
    })}
  />
{% endhighlight %}

- 条件渲染

wepy:

{% highlight html %}
  <text wx:if="{{playing}}">0:00</text>
  <image
    wx:else
    src="../assets/images/play.png"
  />
{% endhighlight %}

taro:

{% highlight html %}
  {
    playing ？<text wx:if="{{playing}}">0:00</text> : <image src="../assets/images/play.png" />
  }
{% endhighlight %}

- 函数调用

wepy(需要包裹在methods中):

{% highlight JavaScript %}
  methods = {
    audioPlay() {
      if (this.playing) {
        this.audioCtx.pause()
        this.playing = false
      } else {
        this.audioCtx.play()
        this.playing = true
      }
    }
  }
{% endhighlight %}

{% highlight html %}
  <view @tap="audioPlay" />
{% endhighlight %}

taro:

{% highlight JavaScript %}
  audioPlay = () => {
    if (this.state.playing) {
      this.audioCtx.pause()
    } else {
      this.audioCtx.play()
    }
    this.setState({
      playing: !this.state.playing,
    });
  }
{% endhighlight %}

{% highlight html %}
  <View onClick={this.audioPlay} />
{% endhighlight %}

-taro 与React写法的不同

1.属性不能传入 JSX 元素

{% highlight JavaScript %}
const element = <Content footer={<View />} />
{% endhighlight %}

2.自定义组件的名称必须和引入时一致

比如按如下写法写了个component,在React中是可以直接 import XXX from 'path',但在taro中只能import ChildSecond from 'path',import错误会提示XXX未找到。

{% highlight JavaScript %}
export default class ChildSecond extends Component {

  render() {
    return (
      <View>balabala</View>
    )
  }
}
{% endhighlight %}

## 针对wepy开发痛点比较

### 组件的循环渲染

此处使用picker-view实现日期选择器为例。

wepy(使用辅助标签 <repeat> ):

问题：设置初始化value值不成功

[解决方法1](https://github.com/Tencent/wepy/issues/1528)

解决方法2：在computed里计算value的值

{% highlight html %}
   <picker-view
      value="{{value}}"
    >
      <picker-view-column>
        <repeat
          for="{{years}}"
          key="{{index}}"
        >
          <view>{{item}}年</view>
        </repeat>
      </picker-view-column>
      <picker-view-column>
        <repeat
          for="{{months}}"
          key="{{index}}"
        >
          <view>{{item}}月</view>
        </repeat>
      </picker-view-column>
      <picker-view-column>
        <repeat
          for="{{days}}"
          key="{{index}}"
        >
          <view>{{item}}日</view>
        </repeat>
      </picker-view-column>
    </picker-view>
{% endhighlight %}

taro( map 方法):

问题：PickerViewColumn未定义, [pr](https://github.com/NervJS/taro/pull/413)

{% highlight html %}
   <View>
      <View>{this.state.year}年{this.state.month}月{this.state.day}日</View>
      <PickerView value={this.state.value} onChange={this.onChange}>
        <PickerViewColumn>
          {this.state.years.map(item => {
            return (
              <View>{item}年</View>
            );
          })}
        </PickerViewColumn>
        <PickerViewColumn>
          {this.state.months.map(item => {
            return (
              <View>{item}月</View>
            );
          })}
        </PickerViewColumn>
        <PickerViewColumn>
          {this.state.days.map(item => {
            return (
              <View>{item}日</View>
            );
          })}
        </PickerViewColumn>
      </PickerView>
    </View>
{% endhighlight %}

### 非页面级组件生命周期

taro:

componentWillMount componentDidMount

wepy: onLoad

### 跨组件事件触发

wepy:

[文档](https://tencent.github.io/wepy/document.html#/?id=%E7%BB%84%E4%BB%B6%E9%80%9A%E4%BF%A1%E4%B8%8E%E4%BA%A4%E4%BA%92)

taro:

与react中跨组件事件触发相同，也可以使用this.$parent乱拿数据,乱调父组件函数- -。

问题：

1.不支持 onClick={() => this.changeText('balabala')}这种写法，只能使用bind（箭头函数的语法是支持的，但是这样写就是没用，原因不详

2.组件内同一个函数不能bind两次，[issue](https://github.com/NervJS/taro/issues/432)

## END
