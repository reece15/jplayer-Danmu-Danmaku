/**
 * 简单的弹幕插件
 * jplayer-plugin
 * 
 * danmu:{
 * 		content:String,//必须
 * 		postTime:String,//必须 格式nn:nn
 * }
 * config:{
 * 		time:int,//弹幕运动时间 默认5000ms
		timeout:int,//弹幕多次点击间隔 默认3000ms
		objectId:String,//播放器的id,将通过此id选择播放器 //必须
		postData:CallBack,//一个提交数据到服务器的函数，不做封装 //非必须
		list:danmus,//danmu数组 必须
 * }
 * function danmuPlayer(option) 初始化弹幕环境
 * function biubiubiu($player,content) 将弹幕发射到播放器
 * function sendDanmu(content) 将弹幕发射到屏幕且发送到服务器 
 * 
 */

(function($) {
	var defaultConfig = {
	
		height: 36,
		time: 5000,
		timeout: 3000,
		postData: function() {}
	};
	
	/**
	 * 发射弹幕
	 */
	var send = function($player) {
		
		if ($player.find(".playerSendBtn").attr('sending') == 'true') {
			alert("您提交的太频繁了，请" + (defaultConfig.timeout / 1000) + "s后再试!");
			return false;
		}
	
		$player.find(".playerSendBtn").attr('sending', "true");
		setTimeout(function() {
			$player.find(".playerSendBtn").attr('sending', 'false');
		}, defaultConfig.timeout);
		
		biubiubiu($player,$player.find(".playerSendtxt").val());
		defaultConfig.postData({
			content:$player.find(".playerSendtxt").val(),
			postTime:$player.parent().children('.jp-gui').children('.jp-interface').children('.jp-current-time').text()
		});
	};
	
	var util = {
		xssFilter: function(val) {
			val = val.toString();
			val = val.replace("<", "&lt;");
			val = val.replace(">", "&gt;");
			val = val.replace("\"", "&quot;");
			val = val.replace("'", "&#39;");
			return val;
		},
		getReandomColor: function() {
			var w = ["#ff0000", "#ff0080", "#ff00ff", "#8000ff", "#0000ff", "#0080ff", "#00ffff", "#00ff80", "#00ff00", "#80ff00", "#ffff00", "#ff8000", "#ff0000"];
	
			return w[parseInt(Math.random() * w.length)];
		}
	};
	var data = {
		maxRows: 10,
		countDm: 0,
		index: 5
	};
	// 准备数据
	var biubiubiu = function($player,texts) {
	
		var time = defaultConfig.time;
		var text = util.xssFilter(texts);
		var $div = $("<div>" + text + "</div>");
	
		data.maxRows = $player.find("#showDm").height() * 0.8 / defaultConfig.height;
		$div.css({
			"top": (data.countDm * ($player.find("#showDm").height() - $player.find("#showDm div").height()) * 0.8 / data.maxRows) + "px",
			"left": $player.find("#showDm").width() + "px",
			"z-index": data.index,
			"color": util.getReandomColor()
		});
	
		$player.find("#showDm").append($div);
		
		if (data.countDm >= data.maxRows) {
			data.countDm = 0;
		}
	
		data.countDm += 1;
		data.index++;
		$div.animate({
			left: "-" + $div.width() + "px"
			}, time, function() {
				$div.remove();
			});
	};
	$.fn.sendDanmu=function(content){
		var $this=$(this);
		return $this.each(function(){
				biubiubiu($this,content);
				defaultConfig.postData({
					'content':content,
					'postTime':$this.parent().children('.jp-gui').children('.jp-interface').children('.jp-current-time').text()
			});
		});
		
	};
	$.fn.danmuPlayer = function(option) {
		/**
		 * 默认的参数
		 */
	
		$.extend(defaultConfig, option);
		console.log(this);
		
		return this.each(function() {
			var $this=$(this);
			$this.append("<div id='showDm'></div><div class='playerSend'><div class='sendBackground'><div class='playerSendContainer'><input type='text' class='playerSendtxt'/><input type='button' sending='false' value='发布评论' class='playerSendBtn'/></div></div></div>");
			$this.find("img").addClass("playerImg");
			$this.find("video").addClass("playerVideo");
		
			// 鼠标点击播放器 显示弹幕发送窗口
			$this.find("#showDm").unbind('click');
			
			$this.find("#showDm").bind('click', function() {
				console.log("btn");
				if ($this.find(".playerSend").css("display") == "none") {
					$this.find(".playerSend").css("display", "block");
				} else {
					$this.find(".playerSend").css("display", "none");
				}
			});
			//绑定点击事件
			$this.find(".playerSendBtn").unbind("click");
			$this.find(".playerSendBtn").bind('click', function() {
				send($this);
			});
		
			var tableDone = new Array();
			//发射弹幕
			setInterval(function() {
		
				for (var i = 0; i < defaultConfig.list.length; i++) {
					var currentTime = $this.parent().children('.jp-gui').children('.jp-interface').children('.jp-current-time').text();
					//alert($.fn.simpleDanmu.defaultConfig.list[i].content+$.fn.simpleDanmu.defaultConfig.list[i].postTime);
					var danmu = defaultConfig.list[i];
					if (currentTime == danmu.postTime && tableDone.indexOf(i) == -1) {
						
						biubiubiu($this,danmu.content);
						tableDone.push(i);
					}
				}
		
			}, 1000);
			
		
		});
	}

})(jQuery);