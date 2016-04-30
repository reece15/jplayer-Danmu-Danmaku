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
 * function initDanmu(config) 初始化弹幕环境
 * function biubiubiu(content) 将弹幕发射到屏幕
 * function send 将弹幕发射到屏幕且发送到服务器
 * 
 */

(function($){
	$.fn.simpleDanmu={
		/**
		 * 默认的参数
		 */
		defaultConfig:{
			height:36,
			time:5000,
			timeout:3000,
		},
		/**
		 * 初始化弹幕
		 */
		initDanmu:function(config){
			$.extend($.fn.simpleDanmu.defaultConfig,config);
			var $player = $("#"+$.fn.simpleDanmu.defaultConfig.objectId);
			
			
			$player.append("<div id='showDm'></div><div class='playerSend'><div class='sendBackground'><div class='playerSendContainer'><input type='text' class='playerSendtxt'/><input type='button' sending='false' value='发布评论' class='playerSendBtn'/></div></div></div>");
			$("#"+$.fn.simpleDanmu.defaultConfig.objectId +" img").addClass("playerImg");
			$("#"+$.fn.simpleDanmu.defaultConfig.objectId +" video").addClass("playerVideo");
			// 鼠标点击播放器 显示弹幕发送窗口
			$("#"+$.fn.simpleDanmu.defaultConfig.objectId +" #showDm").unbind('click');
			$("#"+$.fn.simpleDanmu.defaultConfig.objectId +" #showDm").bind('click',function(){
				
				if($("#"+$.fn.simpleDanmu.defaultConfig.objectId +"  .playerSend").css("display")=="none"){
					$("#"+$.fn.simpleDanmu.defaultConfig.objectId +" .playerSend").css("display","block");
				}else{
					$("#"+$.fn.simpleDanmu.defaultConfig.objectId +"  .playerSend").css("display","none");
				}
			});
			
			//绑定点击事件
			$("#"+$.fn.simpleDanmu.defaultConfig.objectId +"  .playerSendBtn").unbind("click");
			$("#"+$.fn.simpleDanmu.defaultConfig.objectId +"  .playerSendBtn").bind('click', function(){
				$.fn.simpleDanmu.sendDanmu.send($.fn.simpleDanmu.defaultConfig.objectId);
			});
			

			var tableDone = new Array();
			//发射弹幕
			setInterval(function(){
				
				for(var i = 0; i < $.fn.simpleDanmu.defaultConfig.list.length; i++){
					var currentTime = $player.parent().children('.jp-gui').children('.jp-interface').children('.jp-current-time').text();
					//alert($.fn.simpleDanmu.defaultConfig.list[i].content+$.fn.simpleDanmu.defaultConfig.list[i].postTime);
					var danmu = $.fn.simpleDanmu.defaultConfig.list[i];
					if(currentTime == danmu.postTime && tableDone.indexOf(i) == -1){
						
						$.fn.simpleDanmu.sendDanmu.biubiubiu(danmu.content);
						tableDone.push(i);
					}	
				}
				
			},1000);
		},
		
		/**
		 * 添加弹幕
		 */
		addDanmu:function(danmu){
			$.fn.simpleDanmu.defaultConfig.list.push(danmu);
		},
		/**
		 * 移除弹幕
		 */
		removeDanmu:function(){
			
		},
		
		
		
		/**
		 * 发射弹幕
		 */
		sendDanmu:{
			data:{
				maxRows:10,
				countDm:0,
				index:5
			},
			send:function(objectId){
				if($("#"+objectId +" .playerSendBtn").attr('sending') == 'true'){
					alert("您提交的太频繁了，请"+($.fn.simpleDanmu.defaultConfig.timeout/1000)+"s后再试!");
					return false;
				}
				
				$("#"+objectId +" .playerSendBtn").attr('sending',"true");
				setTimeout(function(){
					$("#"+objectId +" .playerSendBtn").attr('sending','false');
				},$.fn.simpleDanmu.defaultConfig.timeout);

			   $.fn.simpleDanmu.sendDanmu.biubiubiu($("#"+objectId +" .playerSendtxt").val());
			   $.fn.simpleDanmu.defaultConfig.postData($("#"+objectId +" .playerSendtxt").val());
			},
			// 准备数据
			biubiubiu:function(texts){
				var objectId =$.fn.simpleDanmu.defaultConfig.objectId;
				var time = $.fn.simpleDanmu.defaultConfig.time;
				var text=$.fn.simpleDanmu.util.xssFilter(texts);
				var $div=$("<div>"+text+"</div>");
				
				
				$.fn.simpleDanmu.sendDanmu.data.maxRows = $("#"+objectId +" #showDm").height()*0.8/$.fn.simpleDanmu.defaultConfig.height;
				$div.css({
					"top":($.fn.simpleDanmu.sendDanmu.data.countDm * ($("#"+objectId +" #showDm").height() - $("#"+objectId +" #showDm div").height())*0.8/$.fn.simpleDanmu.sendDanmu.data.maxRows)+"px",
					"left":$("#"+objectId +" #showDm").width()+"px",
					"z-index":$.fn.simpleDanmu.sendDanmu.data.index,
					"color":$.fn.simpleDanmu.util.getReandomColor()
				});
				
				
				$("#"+objectId +" #showDm").append($div);
				
				
			   if($.fn.simpleDanmu.sendDanmu.data.countDm >= $.fn.simpleDanmu.sendDanmu.data.maxRows){
				   $.fn.simpleDanmu.sendDanmu.data.countDm = 0;
			   }
				
			   $.fn.simpleDanmu.sendDanmu.data.countDm+=1;
			   $.fn.simpleDanmu.sendDanmu.data.index++;
				$div.animate({left:"-"+$div.width()+"px"},time,function(){
						$div.remove();
				});
				console.log($.fn.simpleDanmu.sendDanmu.data.countDm+" "+$.fn.simpleDanmu.sendDanmu.data.index +" "+$.fn.simpleDanmu.sendDanmu.data.maxRows);
			},
			
			
		},
		util:{
			xssFilter:function(val) {
				val = val.toString();
				val = val.replace("<", "&lt;");
				val = val.replace(">", "&gt;");
				val = val.replace("\"", "&quot;");
				val = val.replace("'", "&#39;");
				return val;
			},
			getReandomColor:function(){
				var w = ["#ff0000", "#ff0080", "#ff00ff", "#8000ff", "#0000ff", "#0080ff", "#00ffff", "#00ff80", "#00ff00", "#80ff00", "#ffff00", "#ff8000", "#ff0000"];
				 
				return w[parseInt(Math.random()*w.length)];
			}
		}
	}
	
	
})($);