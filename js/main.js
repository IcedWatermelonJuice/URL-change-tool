var tool = {
	echoState: function(str, fcolor) { //反馈运行状态
		var runState = $("#run_state");
		runState.text(str);
		try {
			if (fcolor) {
				runState.css("color", fcolor);
			} else {
				runState.css("color", "");
			}

		} catch (e) {
			console.log(echoState颜色设置错误);
		}
	},
	checkUrl: function(url) { //URL检错
		var res = "";
		if (/^(https|http|thunder|Flashget|qqdl):\/\//i.test(url)) {
			res = url;
		} else if (/^QUFodHRw/i.test(url)) {
			res = "thunder://" + url;
		} else if (/^W0ZMQVNIR0VUXWh0dH/i.test(url)) {
			res = "Flashget://" + url;
		} else if (/^aHR0c/i.test(url)) {
			res = "qqdl://" + url;
		}
		return res;
	},
	changeUrl: function(mode) { //URL转换
		tool.echoState("转换中");
		var origin_url = $("#origin_url_box").val();
		origin_url = origin_url.trim();
		var checkRes = tool.checkUrl(origin_url);
		tool.echoState("转换中.");
		if (checkRes) {
			var realUrl = decode.real(checkRes);
			if (activeFlag) {
				realUrl = decode.maomi(realUrl);
			}
			tool.echoState("转换中..");
			var res_url = "";
			switch (mode) {
				case "real":
					res_url = realUrl;
					break;
				case "short":
					res_url = encode.short(realUrl);
					break;
				case "thunder":
					res_url = encode.thunder(realUrl);
					break;
				case "flashget":
					res_url = encode.flashget(realUrl);
					break;
				case "qqdl":
					res_url = encode.qqdl(realUrl);
					break;
				default:
					tool.echoState("转换失败(转换模式错误,请刷新页面或反馈给开发者)!", "red");
					return false;
			}
			tool.echoState("转换中...");
			if (typeof res_url === "string") {
				$("#res_url_box").val(res_url);
				console.log("输入地址:" + origin_url + "\n转换结果:" + res_url);
				log.add(origin_url, res_url, mode);
				tool.echoState("转换成功!", "green");
				$("#copyBtn").css("display", "");
				$("#qrBtn").css("display", "");
			} else {
				tool.echoState("转换失败!", "red");
			}

		} else {
			tool.echoState("转换失败(输入地址错误)!", "red");
		}
	},
	copyUrl: function() { //URL复制到剪贴板
		$("#res_url_box").select();
		document.execCommand('copy');
		alert("已复制到剪贴板!");
	},
	toClipboard: function(data, msg) {
		var exportBox = document.createElement("input");
		exportBox.value = data;
		document.body.appendChild(exportBox);
		exportBox.select();
		document.execCommand('copy');
		exportBox.remove();
		msg = msg ? msg : "已导出到剪贴板";
		alert(msg);
	},
	initTool: function() { //初始化工具
		$("#origin_url_box").val("请输入http、https、thunder、Fastget、qqdl开头的地址");
		$("#origin_url_box").css("color", "gray");
		$("#res_url_box").val("");
		$("#copyBtn").css("display", "none");
		$("#qrBtn").css("display", "none");
		var msg = "转换工具初始化";
		if (activeFlag) {
			msg += ",隐藏功能已失效"
			tool.unhideFn(false);
		}
		console.log(msg);
		alert(msg);
		tool.echoState("未运行");
	},
	jumpSite: function(url, extraUrl) { //跳转到其他网页
		if (!activeFlag && url !== "qrcode") {
			return false;
		}
		var errorMsg;
		switch (url) {
			case "play":
				errorMsg = "1、请先转换为真实地址再点击在线播放\n2、在线播放仅支持m3u8、flv、mp4、webm、ogg格式";
				url = location.hostname.search(".rth.") === -1 ?
					"https://icedwatermelonjuice.github.io/Online-Player?url=" : "https://gem-op.rth.app?url=";
				if (!extraUrl || typeof extraUrl !== "string") {
					extraUrl = $("#res_url_box").val();
				}
				url = /.(m3u8|flv|mp4|webm|ogg)/i.test(extraUrl) ? url + encodeURIComponent(extraUrl) : "";
				break;
			case "dns":
				errorMsg = "1、请先转换为真实地址再点击DNS解析\n2、若转换为短链地址，解析结果为短链接口的DNS解析结果";
				url = location.hostname.search(".rth.") === -1 ?
					"https://icedwatermelonjuice.github.io/DND-Parse?url=" : "https://gem-dp.rth.app?url=";
				if (!extraUrl || typeof extraUrl !== "string") {
					extraUrl = $("#res_url_box").val();
				}
				url = !/^(thunder|Flashget|qqdl):\/\//i.test(extraUrl) ? url + encodeURIComponent(extraUrl) :
				"";
				break;
			case "qrcode":
				console.log("qrcode")
				errorMsg = "转换结果为空！";
				url = location.hostname.search(".rth.") === -1 ?
					"https://icedwatermelonjuice.github.io/QRcode-Tool?fullscreen=on&url=" :
					"https://gem-qr.rth.app?fullscreen=on&url=";
				if (!extraUrl || typeof extraUrl !== "string") {
					extraUrl = $("#res_url_box").val();
				}
				url = extraUrl ? url + encodeURIComponent(extraUrl) : "";
				break;
			default:
				errorMsg = "jumpSite(url)参数缺失或错误";
				url = url.trim();
				break;
		}
		if (url) {
			open(url);
		} else {
			alert(errorMsg);
			console.log(errorMsg);
		}
	},
	fromUrl: function(keys) { //从URL获取search数据
		if (!keys || typeof keys !== "string") {
			return false;
		}
		var queryData = location.search;
		if (!queryData) {
			return false;
		}
		queryData = queryData.slice(1).split("&");
		var queryJson = {};
		for (let i in queryData) {
			let dataArray = queryData[i].split("=");
			if (dataArray[0]) {
				queryJson[dataArray[0]] = dataArray[1] ? dataArray[1] : "";
			}
		}
		keys = keys.split(",");
		if (keys.length === 1) {
			return queryJson[keys[0]];
		} else {
			var res = {};
			for (let i in keys) {
				res[keys[i]] = queryJson[keys[i]];
			}
			return res;
		}
	},
	unhideFn: function(flag) { //隐藏功能
		if (flag) {
			page.activeInstruct();
			activeFlag = true;
			$("#playBtn").css("display", "");
			$("#dnsBtn").css("display", "");
		} else {
			page.activeHide();
			activeFlag = false;
			$("#playBtn").css("display", "none");
			$("#dnsBtn").css("display", "none");
		}
	},
	getTime: function() {
		var time = new Date();
		var year = time.toLocaleDateString().replace(/\//g, ".");
		var hour = time.getHours();
		var minute = time.getMinutes();
		var second = time.getSeconds();
		hour = hour < 10 ? "0" + hour : hour;
		minute = minute < 10 ? "0" + minute : minute;
		second = second < 10 ? "0" + second : second;
		return year + " " + hour + ":" + minute + ":" + second;
	}
}
var message = {
	alert: function(data, title) {
		title = title ? title.slice(0, 10) : "信息提示";
		$("body").append(this.create("alert", data, title));
	},
	prompt: function(data, title) {
		title = title ? title.slice(0, 10) : "信息收集"
		$("body").append(this.create("prompt", data, title));
	},
	confirm: function(data, title) {
		title = title ? title.slice(0, 10) : "信息确认"
		$("body").append(this.create("confirm", data, title));
	},
	create: function(type, data, title) {
		var content, tips;
		if (typeof data === "string") {
			tips = "";
			content = "<p type='content'>" + data + "</p>";
		} else {
			tips = "<p type='tips' style='color:red'>" + data[0] + "</p>";
			content = "<p type='content'>" + data[1] + "</p>";
		}
		var container = document.createElement("div");
		var outerBox = document.createElement("div");
		var innerBox = document.createElement("div");
		var head = document.createElement("div");
		var main = document.createElement("div");
		var foot = document.createElement("div");
		container.setAttribute("class", "message_container");
		outerBox.setAttribute("class", "message_outerBox");
		innerBox.setAttribute("class", "message_innerBox");
		head.setAttribute("class", "message_head");
		main.setAttribute("class", "message_main");
		foot.setAttribute("class", "message_foot");
		container.appendChild(outerBox);
		outerBox.appendChild(innerBox);
		innerBox.appendChild(head);
		innerBox.appendChild(main);
		innerBox.appendChild(foot);
		head.innerHTML = title;
		main.innerHTML = tips + content;
		foot.innerHTML =
			"<div class='message_button' type='copy' onclick='message.copy()'>全部复制</div><div class='message_button' type='close' onclick='message.close()'>关闭页面</div><div class='message_button' type='home' onclick='message.home()'>重输指令</div>";
		return container;
	},
	copy: function() {
		tool.toClipboard($(".message_main p[type=content]").html().replace(/<br>/g, " "));
	},
	submit: function() {
		$(".message_container").remove();
	},
	close: function() {
		$(".message_container").remove();
	},
	home: function() {
		this.close();
		setTimeout(function() {
			instruct.execute(prompt("请输入指令"));
		}, 500)
	}
}
var instruct = {
	list: {
		"log": {
			"descript": "显示历史记录",
			"on": function() {
				log.display();
			}
		},
		"clear": {
			"descript": "清空历史记录",
			"on": function() {
				log.clear();
			}
		},
		"delete": {
			"descript": "删除历史记录",
			"on": function() {
				var index = prompt("输入记录标号，删除历史记录，多条记录用英文“,”隔开");
				index = index ? index.trim() : "";
				if (index) {
					index = index.split(",");
					let temp = [];
					for (let i in index) {
						index[i] = index[i].trim();
						if (index[i]) {
							temp.push(parseInt(index[i]));
						}
					}
					index = temp;
					var max;
					for (let i = 0; i < index.length; i++) {
						for (let j = i; j < index.length; j++) {
							if (index[i] < index[j]) {
								max = index[j];
								index[j] = index[i];
								index[i] = max;
							}
						}
					} //重排下index，由大到小，这样删数据，大下标的数据没了不影响小下标的值
					for (let i in index) {
						log.delete(index[i]);
					}
				} else {
					alert("找不到记录");
				}
			}
		},
		"edit": {
			"descript": "修改历史记录",
			"on": function() {
				var index = prompt("输入记录标号，选择一条记录");
				if (index) {
					log.edit(index);
				}
			}
		},
		"select": {
			"descript": "从历史记录中挑选一项记录的输入地址，填充进“输入地址”框",
			"on": function() {
				var index = prompt("输入记录标号，选择一条记录");
				if (index) {
					log.select(index);
				}
			}
		},
		"help": {
			"descript": "显示所有可用指令和可用指令功能描述",
			"on": function() {
				var msg = "";
				var list = instruct.list;
				var i = 0;
				for (let j in list) {
					i += 1;
					msg += "(" + i + ") " + j + " : " + list[j].descript + "<br>";
				}
				message.alert(msg, "指令列表");
			}
		},
		"jump": {
			"descript": "跳转到其他网页",
			"on": function() {
				var url = prompt("请输入跳转目标地址");
				url = typeof url === "string" ? url.trim().split(",") : "";
				tool.jumpSite(url[0], url[1]);
			}
		},
		"hide": {
			"descript": "将隐藏功能关闭（注意：关闭隐藏功能将导致指令不可用）",
			"on": function() {
				tool.unhideFn(false);
			}
		},
	},
	execute: function(instruction) {
		instruction = typeof instruction === "string" ? instruction.trim() : "";
		if (!instruction) {
			return false;
		}
		if (/^(js|javascript):/i.test(instruction)) {
			instruction = instruction.slice(instruction.search(":") + 1);
			this.eval(instruction);
		} else {
			this.brief(instruction);
		}
	},
	brief: function(instruction) {
		instruction = this.list[instruction];
		if (instruction) {
			instruction.on();
		} else {
			alert("非法指令！");
		}
	},
	eval: function(instruction) {
		try {
			eval(instruction);
		} catch (e) {
			alert("指令错误！\n" + e);
		}
	}
}
var log = {
	get: function() {
		var localLog = localStorage.getItem("runningLog");
		localLog = typeof localLog === "string" ? localLog.trim() : "";
		try {
			localLog = localLog ? JSON.parse(localLog) : [];
		} catch (e) {
			localLog = [];
		}
		return typeof localLog === "object" ? localLog : [];
	},
	add: function(origin_url, target_url, direction, time) {
		if (!origin_url || !target_url || !direction) {
			console.log(
				"log.save(origin_url,target_url,direction,time)参数缺失:origin_url、target_url、direction必选，time可选"
			);
		}
		time = time ? time : tool.getTime();
		var tempLog = this.get();
		tempLog.unshift({
			"origin": origin_url,
			"target": target_url,
			"direction": direction,
			"time": time
		})
		tempLog = tempLog.slice(0, 50);
		localStorage.setItem("runningLog", JSON.stringify(tempLog));
	},
	display: function() {
		var tempLog = this.get();
		var msg = "";
		for (let i in tempLog) {
			msg += "(" + (parseInt(i) + 1) + ")<br>转换方向: " + tempLog[i].direction + "<br>输入地址: " + tempLog[i]
				.origin + "<br>转换结果: " + tempLog[i].target + "<br>转换时间: " + tempLog[i].time + "<br>";
		}
		msg = msg ? msg : "无运行日志";
		message.alert(["注意: 最多保留50条记录！", msg], "运行历史日志");
	},
	clear: function() {
		localStorage.removeItem("runningLog");
	},
	delete: function(index) {
		var tempLog = this.get();
		if (tempLog[index - 1]) {
			tempLog.splice(index - 1, 1);
			localStorage.setItem("runningLog", JSON.stringify(tempLog));
		} else {
			alert("找不到对应记录");
		}
	},
	edit: function(index) {
		var tempLog = this.get();
		if (tempLog[index - 1]) {
			let newLog = JSON.stringify(tempLog[index - 1]);
			newLog = prompt("请修改数据\n点击确认保存修改，点击取消退出修改", newLog);
			if (newLog) {
				try {
					newLog = JSON.parse(newLog); //确保修改后JSON格式正确
				} catch (e) {
					alert("JSON格式错误");
					return false;
				}
				tempLog[index - 1] = newLog;
				localStorage.setItem("runningLog", JSON.stringify(tempLog));
			}
		} else {
			alert("找不到对应记录");
		}
	},
	select: function(index) {
		var tempLog = this.get();
		if (tempLog[index - 1]) {
			$("#origin_url_box").val(tempLog[index - 1].origin);
			$("#origin_url_box").css("color", "");
		} else {
			alert("找不到对应记录");
		}
	}
}
var encode = {
	thunder: function(url) { //编码迅雷
		return "thunder://" + btoa("AA" + url + "ZZ");
	},
	flashget: function(url) { //编码快车
		return 'Flashget://' + btoa('[FLASHGET]' + url + '[FLASHGET]') + '&1926';
	},
	qqdl: function(url) { //编码Q旋
		return 'qqdl://' + btoa(url);
	},
	short: function(url) { //编码短链
		var shortInterFace = "xnz.pub/apis.php?url="; //短链接口
		var shortUrl;
		var protocol = /http|https/i.test(location.protocol) ? location.protocol : "https:";
		shortInterFace = protocol + "//" + shortInterFace.replace(/^((http|https):)?\/\//, "");
		$.ajax({
			type: "get",
			url: shortInterFace + encodeURIComponent(url),
			async: false, //必须同步执行
			error: function(xhr) {
				alert("短链接口错误!\n" + "错误代码:" + xhr.status + "\n错误提示:" + xhr.statusText +
					"\n请联系开发者更换短链接口");
				shortUrl = false;
			},
			success: function(res) {
				if (typeof res === "string") {
					res = JSON.parse(res); //防止get到的数据不是json格式
				}
				shortUrl = "https://xnz.pub/" + res.result.shorten;
			}
		})
		return shortUrl
	}
}
var decode = {
	thunder: function(url) { //解码迅雷
		url = atob(url.replace('thunder://', ''));
		return url.substr(2, url.length - 4);
	},
	flashget: function(url) { //解码快车
		url = url.replace('Flashget://', '').split('&')[0];
		return atob(url).replace('[FLASHGET]', '').replace('[FLASHGET]', ''); //两层[FLASHGET]都要去掉
	},
	qqdl: function(url) { //解码Q旋
		return atob(url.replace('qqdl://', ''));
	},
	real: function(url) { //解码真实
		if (url.search("thunder://") != -1) {
			url = this.thunder(url);
		} else if (url.search("Flashget://") != -1) {
			url = this.flashget(url);
		} else if (url.search("qqdl://") != -1) {
			url = this.qqdl(url);
		}
		return url;
	},
	maomi: function(url) { //解码猫咪
		if (url.search("www.mmxzxl1.com") !== -1) {
			var msg = "检测到猫咪地址(海外链路),是否转换为国内链路?\nPS:国内链路还可以直接通过浏览器播放哟!";
			if (confirm(msg)) {
				url = url.replace("www.mmxzxl1.com", "s2s.baimi0517.com");
				url = url.slice(0, url.lastIndexOf("/")) + "/hls/1/index.m3u8";
			}
		}
		return url;
	}
}
var page = {
	activeHide: function() {
		clickNum = 0;
		$("#tittle").off("click");
		$("#tittle").on("click", function() {
			clickNum += 1;
			if (clickNum >= 6) {
				clickNum = 0;
				var msg = "已激活隐藏功能,刷新网页/初始化工具后失效";
				alert(msg);
				console.log(msg);
				tool.unhideFn(true);
			}
		})
	},
	activeInstruct: function() {
		clickNum = 0;
		$("#tittle").off("click");
		$("#tittle").on("click", function() {
			clickNum += 1;
			if (clickNum >= 3) {
				clickNum = 0;
				instruct.execute(prompt("请输入指令"));
			}
		})
	},
	initPage: function() {
		var oub = $("#origin_url_box");
		var initvalue = "请输入http、https、thunder、Fastget、qqdl开头的地址";
		oub.val(initvalue);
		oub.css("color", "gray");
		oub.focus(function() {
			if (oub.val() === initvalue) {
				oub.val("");
				oub.css("color", "")
			}
		});
		oub.blur(function() {
			if (!oub.val()) {
				oub.val(initvalue);
				oub.css("color", "gray");
			}
		});
	},
	pretreatUrl: function() {
		var oub = $("#origin_url_box");
		var queryLink = tool.fromUrl("on,url,to");
		if (queryLink["on"] === "") {
			console.log("已激活隐藏功能,初始化工具后失效");
			tool.unhideFn(true);
		}
		if (queryLink["url"]) {
			oub.val(queryLink["url"]);
			oub.css("color", "");
			setTimeout(function() { //延时500ms后再执行
				switch (queryLink["to"]) {
					case "real":
					case "short":
					case "thunder":
					case "flashget":
					case "qqdl":
						tool.changeUrl(queryLink["to"]);
						break;
					default:
						tool.changeUrl("real");
						break;
				}
			}, 500)
		}
	},
	on: function() {
		$(document).ready(function() {
			page.initPage();
			page.activeHide();
			page.pretreatUrl();
		})
	}
}
var clickNum = 0;
var activeFlag = false;
page.on();
