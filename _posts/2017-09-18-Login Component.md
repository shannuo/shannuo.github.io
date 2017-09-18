---
layout: post
title: "使用React编写一个验证码登录组件"
date: 2017-09-18 0:34:26
image: '/assets/media'
description: '使用React编写一个包含独立倒计时按钮组件的验证码登录组件'
main-class: 'FE'
color: '#B31917'
tags:
- React
categories:
twitter_text: '验证码登录组件'
introduction: '使用React编写一个包含独立倒计时按钮组件的验证码登录组件'
---

### Ahri-珊

这篇博客将分享如何使用React编写一个带独立倒计时按钮组件的验证码登录组件。

### 在线演示地址

[Countdown Button](http://dengshushan.com/countdown/build/)

预览:

![preview-img](http://7xle3b.com1.z0.glb.clouddn.com/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202017-09-16%20%E4%B8%8B%E5%8D%887.20.20.png)

Demo 演示:（多出的两个小方条和花掉的鼠标是录制的原因）

![preview](http://7xle3b.com1.z0.glb.clouddn.com/video.gif)

### 项目源码

[项目源码](https://github.com/shannuo/countdown)

## 目标

### 分离的倒计时按钮组件

倒计时按钮组件需要满足以下要求：

1.点击开始倒计时

2.具有可变化的多种状态（disable：验证未通过所以不能点击 sending：倒计时未结束不可点击 able：允许点击）

3.点击提示

4.自定义提示信息和倒计时时长

5.点击触发交互事件

6.通知父组件内部状态变化

7.可被父组件使用的重置机制

### 登录验证框

登陆验证框需要满足以下要求：

1.手机号验证

2.验证码验证

3.多状态的登录按钮（disable：不可点击 able：允许点击）

4.自定义的提示信息

5.模拟向后端发送请求

6.根据子组件状态变化做出相应反应

7.倒计时按钮处于发送中状态时不允许修改手机号

8.点击登录按钮提示

### 实现

#### 倒计时按钮组件

为实现目标，我们对组件的设计如下。

<Countdown 
	ref="countdown" 						//用于父组件调用按钮组件的重置函数
	status='sending' 							//用于父组件控制按钮组件状态
	nums='60' 								//自定义的按钮倒计时时间
	sendCode={function(){}} 					//点击按钮触发的交互事件
	callback={function(){}} 					//用于通知父组件内部状态变化的函数
	disableClick='请正确填写手机号' 			//自定义的提示信息1
	sendingClick='正在发送，请耐心等待' 	//自定义的提示信息2
/> 

组件状态初始化：

{% highlight html %}

constructor(props) {
	  super(props)
	  this.state = {
		  nums:props.nums,												// 倒计时时间（s）
		  tips:'',														// 提示信息
		  countdown:'发送验证码',											// 倒计时按钮值
		  status:props.status,											// 倒计时按钮状态(disable:不可发送,able:可发送,sending:倒计时中)
	  }
 }

{% endhighlight %}

界面：

点击触发handleSend事件，组件样式随状态变化而变化。

**HTML代码**

{% highlight html %}
    	
<span id="sendCode" className={"input-group-addon  " + this.state.status} onClick={this.handleSend}>{this.state.countdown}</span>
	 
{% endhighlight %}
		 
目标实现：

为实现目标2，我们需要组件具有status属性，记录父组件需要的按钮状态，为了让按钮状态可变，我们需要在this.props.status变化时改变this.state.status.

**代码**

{% highlight javascript %}

  componentWillReceiveProps(nextProps) {
    this.setState({
	  status:nextProps.status
   	});
  }

{% endhighlight %}

为实现目标7，我们需要提供一个resetButton函数将按钮状态重置。由于倒计时结束按钮状态也会重置，所以我们重置后需要通知父组件。

“”resetButton代码**

{% highlight javascript %}

  // 按钮重置
  resetButton(){
	  clearInterval(this.clock);	// 清除js定时器
	  this.setState({
		countdown:'发送验证码',
		status:'able',
		nums:this.props.nums,	// 重置时间
	  });
	  // 通知父组件
	  this.props.callback(false,'able');
  }

{% endhighlight %}

为实现目标1，3，5，6，我们需要在按钮点击事件触发的handleSend函数中，对按钮的当前状态进行判断。可点击时开启倒计时并触发交互事件同时还要改变按钮状态，按钮处于disable和sending状态时将提示信息改为自定义的相应信息，每次按钮状态改变或提示信息改变都应通知父组件。

**handleSend代码**

{% highlight javascript %}

// 点击发送验证码
handleSend=(event)=>{
	  switch(this.state.status){
		  // 按钮处于可发送状态发送并倒计时
		  case 'able':
			// 倒计时开启
			this.clock = setInterval(
					() => this.doLoop(), 
					1000
			);
			// 状态改变
			this.setState({
			  status:'sending',
			  countdown:'重新发送(' + this.state.nums + 's)',
			});
			// 通知父组件
			this.props.callback(false,'sending');
			// 发送请求
			this.props.sendCode();
			break;
		  // 按钮处于不可点击状态，点击后提示
		  case 'disable':
		  	this.setState({
			  tips:this.props.disableClick
			});
			// 通知父组件
			this.props.callback(this.props.disableClick,false);
			break;
		  // 按钮处发送状态，点击后提示
		  case 'sending':
		  	this.setState({
			  tips:this.props.sendingClick
			});
			// 通知父组件
			this.props.callback(this.props.sendingClick,false);
			break;
		  default:
            break;
	  }	  
}
// 倒计时实现
doLoop(){
	  var nums = this.state.nums;
	  nums--;
	  this.setState({
		  nums:nums
	  });
	  if(nums > 0){
		this.setState({
		  countdown:'重新发送(' + nums + 's)'
		});
	  }
	  else{
		this.resetButton();
	  }
}

{% endhighlight %}

最后，组件可能会被unmout，我们需要在它将被卸载的时候清除计时器。

“”代码**

{% highlight javascript %}

  componentWillUnmount() {
  	clearInterval(this.clock);
  }

{% endhighlight %}

#### 登录组件

为实现目标，我们对组件的设计如下。

< App init = {	nums:20,												// 倒计时时间
		testError:'手机号填写错误！',										// 手机号检测不通过
		codeError:'验证码发送失败！',									// 验证码发送失败
		codeSuccess:'验证码发送成功啦，看到就在这填写哦~',				// 验证码发送成功
		disableClick:'先把手机号填正确好吗0.0',							// 手机号未通过点击发送验证码
		sendingClick:'再等等哦，很快就能收到了~',						// 倒计时未结束点击发送验证码		
		codeNullError:'验证码不能为空！',								// 未填写验证码登录
		phoneNullError:'手机号不能为空！',								// 未填写手机号登录
		codeTestError:'验证码格式应为6位数字哦~'	,					// 验证码检测不通过
		loginError:'还不可以点哦~',										// 登录按钮不可用时点击
		loginSuccess:'登录成功！'										// 登陆成功提示}
/>

组件状态初始化：

{% highlight html %}

constructor(props) {
	  super(props)
	  this.state = {
		  nums:this.props.init.nums,									// 倒计时时间（s）
		  phone:'',													// 手机号码
		  code:'',														// 验证码
		  tips:'',														// 提示信息
		  class1:'',													// 第一条提示信息样式
		  class2:'',													// 第二条提示信息样式
		  iconClass:'input-group-addon glyphicon glyphicon-phone',	// 图标样式
		  status:'disable',												// 倒计时按钮状态(disable:不可发送,able:可发送,sending:倒计时中)
		  login:'disable',												// 登陆按钮样式(disable:不可登录,able:可登陆）
		  popClass:'pop',												// 弹出框样式
	  }
	  this.sendCode = this.sendCode.bind(this)							//用于按钮组件的点击后触发事件，需要与组件绑定
	  this.onChildChange = this.onChildChange.bind(this)				//用户按钮组件状态变化后做出相应反应的函数，需要与组件绑定
}

{% endhighlight %}

界面：

两个输入框：分别用于手机号与验证码的输入。点击会获得或取消提示信息。

三个提示框：分别用于手机号输入框信息提示，验证码框信息提示，登录信息提示。

两个按钮：一个倒计时按钮，一个登录按钮。点击会获得或取消提示信息，按钮状态也可能会改变。

**HTML代码**

{% highlight html %}
    	
		<div className="father">
			<div className={this.state.popClass} >
			  <p>{tips}</p>
			</div>
			<div className="box">
			  <h1 className="title">验证码登录</h1>
			  <div className="input-group input-group-lg input-css">
				<span className={iconClass}></span>
				<input type="text" id="phone" name="phone" className="form-control " placeholder="手机号" value={phone} onChange={this.handlePhone} onFocus={this.handleHide} />
			  </div>
			  <div className={"tips shake clearfix " +  class1}>
				<span className="triangle"></span>
				<div className="article">{tips}</div>
			  </div>
			  <div className="input-group input-group-lg input-css">
				<input type="text" name="code" className="form-control" placeholder="验证码" value={code} onFocus={this.handleHide} onChange={this.handleCode} />
				<Countdown ref="countdown" status={this.state.status} nums={this.props.init.nums} sendCode={this.sendCode} callback={this.onChildChange} disableClick={this.props.init.disableClick} sendingClick={this.props.init.sendingClick} /> 
			  </div>
			  <div className={"tips second clearfix " + class2}>
				<span className="triangle"></span>
				<div className="article">{tips}</div>
			  </div>
			  <div className="form-btn input-group-lg">
				  <input type="button" id="login" className={"form-control btn-success " + login} value="登录" onClick={this.handleLogin} />
			  </div>
			</div>
		</div>
	 
{% endhighlight %}
		 
目标实现：

为实现目标1，我们需要在输入框值变化时触发handlePhone函数，同步输入值与相应状态值并验证手机号。为实现目标7，我们在倒计时按钮状态处于sending时直接返回false。

**handlePhone代码**

{% highlight javascript %}

  handlePhone=(event)=>{
	  // 倒计时按钮处于倒计时未结束状态时手机号不能修改
	  var phone = event.target.value;
	  if(this.state.status==='sending')
	  	return false;
	  // 同步input值
	  this.setState({
	  	phone:phone
	  });
	  // 验证手机号
	  if(this.testPhone(phone)){ 
		  this.setState({
			status:'able',
			class:'able'	 
		  });
	  }
	  else{
		  this.setState({
			status:'disable',
			class:'disable'		 
		  });
	  }     
  }
  // 手机号验证
  testPhone(phone){
	  var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
	  if(myreg.test(phone))
	  	return true;
	  else
	  	return false;
  }

{% endhighlight %}

为实现目标2，我们需要在点击登录按钮时验证验证码是否符合规范。

“”codeTest代码**

{% highlight javascript %}

  // 测试验证码
  codeTest(){
	  var myreg = /^\d{6}$/;
	  return myreg.test(this.state.code);
  }

{% endhighlight %}

为实现目标3，5，我们需要向倒计时按钮组件传入一个sendCode的函数模拟向后端发送请求，发送请求成功后将登录按钮状态改为允许点击。

**sendCode代码**

{% highlight javascript %}

  // 发送请求到后端
  sendCode()
  {
	  var phone = this.state.phone;
	  // 模拟发送请求到后端
	  setTimeout(
		  ()=>{
			  var res = this.response(phone);
			  // 发送失败,倒计时按钮重置
			  if(res===0){
				  this.setState({
					class2:'show shake',
					tips:this.props.init.codeError,
					isReset:true
				  });
				  this.refs.countdown.resetButton();
			  }
			  // 发送成功，登录按钮可点击，并提示用户输入验证码
			  else{
				  this.setState({
					class2:'show boost',
					tips:this.props.init.codeSuccess,
					login:'able'
				  });
			  }
		  },
		  3000
	  );
  }
  // 模拟后端返回数据,返回0：发送失败，返回1：发送成功
  response(num){
	  if(num==='15805173350')
	  	return 1;
	  else if(num==='18776623153')
	  	return 0;
	  // 随机返回0,1
	  else
	  	return Math.round(Math.random()*1);
  }

{% endhighlight %}

为实现目标6，我们需要向倒计时按钮组件传递一个onChildChange函数，同步两个组件的tips和status状态。并在倒计时按钮组件有提示信息变化时让验证码框的提示框显示提示信息。

“”onChildChange代码**

{% highlight javascript %}

  onChildChange(tips,status){
	  if(tips){
		  this.setState({
			tips:tips,
			class2:'show shake',
			class1:''
		  });
	  }
	  if(status)
		  this.setState({
			status:status
		  });
  }

{% endhighlight %}

为实现目标6，我们需要向倒计时按钮组件传递一个onChildChange函数，同步两个组件的tips和status状态。并在倒计时按钮组件有提示信息变化时让验证码框的提示框显示提示信息。

“”onChildChange代码**

{% highlight javascript %}

  onChildChange(tips,status){
	  if(tips){
		  this.setState({
			tips:tips,
			class2:'show shake',
			class1:''
		  });
	  }
	  if(status)
		  this.setState({
			status:status
		  });
  }

{% endhighlight %}

为实现目标8，我们需要在登录按钮点击事件触发的handleLogin函数中判断按钮状态或输入框状态并给出提示信息。

“”handleLogin代码**

{% highlight javascript %}

  // 点击登录按钮
  handleLogin=(event)=>{
	  if(!this.state.phone)
	  	this.setState({
		  class1:'show shake',
		  class2:'',
		  iconClass:'input-group-addon glyphicon glyphicon-exclamation-sign red',
		  tips:this.props.init.phoneNullError
		});
	  else if(this.state.login!=='able'){
	  	this.setState({
		  tips:this.props.init.loginError,
		  class1:'',
		  class2:'',
		  popClass:'pop appear red'
		});
		setTimeout(()=>{this.setState({popClass:'pop'});},1000);
	  }
	  else if(!this.state.code)
	  	this.setState({
		  class2:'show shake',
		  class1:'',
		  tips:this.props.init.codeNullError
		});
	  else if(!this.codeTest())
	  	this.setState({
		  class2:'show shake',
		  class1:'',
		  tips:this.props.init.codeTestError
		});
	  else{
		this.setState({
		  tips:this.props.init.loginSuccess,
		  class1:'',
		  class2:'',
		  popClass:'pop appear success'
		});
		setTimeout(()=>{this.setState({popClass:'pop'});},1000); 
		this.refs.countdown.resetButton();
	  }
  }

{% endhighlight %}

好啦~到这里就结束了~~

## 查看完整代码与示例

**[在线Demo](http://dengshushan.com/countdown/build/)**

**[项目源码](https://github.com/shannuo/countdown)**

## End