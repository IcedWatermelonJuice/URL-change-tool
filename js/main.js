//反馈运行状态
function echoState(str, fcolor) {
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

}
//解码迅雷
function thunderDecode(url) {
	url = url.replace('thunder://', '');
	var res = atob(url);
	res = res.substr(2, res.length - 4);
	return res;
}
//解码快车
function flashgetDecode(url) {
	url = url.replace('Flashget://', '');
	if (url.search('&') != -1) {
		url = url.substr(0, url.search('&'));
	}
	var res = atob(url);
	res = res.replace('[FLASHGET]', '');
	res = res.replace('[FLASHGET]', ''); //两层[FLASHGET]都要去掉
	return res;
}
//解码Q旋
function qqdlDecode(url) {
	url = url.replace('qqdl://', '');
	var res = atob(url);
	return res;
}
//编码真实
function realEncode(url) {
	if (url.search("thunder://") != -1) {
		realUrl = thunderDecode(url);
	} else if (url.search("Flashget://") != -1) {
		realUrl = flashgetDecode(url);
	} else if (url.search("qqdl://") != -1) {
		realUrl = qqdlDecode(url);
	} else {
		realUrl = url;
	}
	return realUrl;
}
//编码短链
function shortEncode(url) {
	var shortInterFace = "xnz.pub/apis.php?url="; //短链接口
	var shortUrl;
	var protocol=/http|https/i.test(location.protocol)?location.protocol:"https:";
	shortInterFace=protocol+"//"+shortInterFace.replace(/^((http|https):)?\/\//,"");
	$.ajax({
		type: "get",
		url: shortInterFace + url,
		async: false, //必须同步执行
		error: function(xhr) {
			alert("短链接口错误!\n" + "错误代码:" + xhr.status + "\n错误提示:" + xhr.statusText + "\n请联系开发者更换短链接口");
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
//编码迅雷
function thunderEncode(url) {
	var thunderUrl = "thunder://" + btoa("AA" + url + "ZZ");
	return thunderUrl;
}
//编码快车
function flashgetEncode(url) {
	var flashgetUrl = 'Flashget://' + btoa('[FLASHGET]' + url + '[FLASHGET]') + '&1926';
	return flashgetUrl;
}
//编码Q旋
function qqdlEncode(url) {
	var qqdlUrl = 'qqdl://' + btoa(url);
	return qqdlUrl;
}
//猫咪转译
function maomiConvert(url) {
	if (url.search("mmxzxl1.com") !== -1) {
		var msg = "检测到猫咪地址(海外链路),是否转换为国内链路?\nPS:国内链路还可以直接通过浏览器播放哟!";
		var c_res = confirm(msg);
		if (c_res) {
			var flag0 = url.search("maomi/") + "maomi/".length;
			var flag1 = url.lastIndexOf("/");
			var newUrl = url.slice(flag0, flag1);
			newUrl = "https://s2s.baimi0517.com/common/maomi/" + newUrl + "/hls/1/index.m3u8";
			return newUrl;
		}
	}
	return url;
}
//URL检错
function checkUrl(url) {
	var resFlag = false;
	var resUrl = "";
	if (url.search("https://") === 0) {
		resFlag = true;
		resUrl = url;
	} else if (url.search("http://") === 0) {
		resFlag = true;
		resUrl = url;
	} else if (url.search("thunder://") === 0) {
		resFlag = true;
		resUrl = url;
	} else if (url.search("Flashget://") === 0) {
		resFlag = true;
		resUrl = url;
	} else if (url.search("qqdl://") === 0) {
		resFlag = true;
		resUrl = url;
	} else if (url.search("QUFodHRw") === 0) {
		resFlag = true;
		resUrl = "thunder://" + url;
	} else if (url.search("W0ZMQVNIR0VUXWh0dH") === 0) {
		resFlag = true;
		resUrl = "Flashget://" + url;
	} else if (url.search("aHR0c") === 0) {
		resFlag = true;
		resUrl = "qqdl://" + url;
	}
	return [resFlag, resUrl];
}
//转换URL
function changeUrl(mode) {
	echoState("转换中");
	var origin_url = $("#origin_url_box").val();
	origin_url = origin_url.trim();
	var checkRes = checkUrl(origin_url);
	echoState("转换中.");
	if (checkRes[0]) {
		var realUrl = realEncode(checkRes[1]);
		if (activeFlag) {
			realUrl = maomiConvert(realUrl);
		}
		echoState("转换中..");
		var res_url = "";
		switch (mode) {
			case "real":
				res_url = realUrl;
				break;
			case "short":
				res_url = shortEncode(realUrl);
				break;
			case "thunder":
				res_url = thunderEncode(realUrl);
				break;
			case "flashget":
				res_url = flashgetEncode(realUrl);
				break;
			case "qqdl":
				res_url = qqdlEncode(realUrl);
				break;
			default:
				echoState("转换失败(转换模式错误,请刷新页面或反馈给开发者)!", "red");
				return false;
		}
		echoState("转换中...");
		if (typeof res_url === "string") {
			$("#res_url_box").val(res_url);
			console.log("输入地址:" + origin_url + "\n转换结果:" + res_url);
			echoState("转换成功!", "green");
			$("#copyBtn").css("display", "");
		} else {
			echoState("转换失败!", "red");
		}

	} else {
		echoState("转换失败(输入地址错误)!", "red");
	}
}
//复制到剪贴板
function copyUrl() {
	$("#res_url_box").select();
	document.execCommand('copy');
	alert("已复制到剪贴板!");
}
//初始化工具
function initTool() {
	$("#origin_url_box").val("请输入http、https、thunder、Fastget、qqdl开头的地址");
	$("#origin_url_box").css("color", "gray");
	$("#res_url_box").val("");
	$("#copyBtn").css("display", "none");
	var msg = "转换工具初始化";
	if (activeFlag) {
		msg += ",隐藏功能已失效"
		activeFlag = false;
	}
	console.log(msg);
	alert(msg);
	echoState("未运行");
}
//跳转到其他网页
function jumpSite(url){
	if(!activeFlag){
		return false;
	}
	var errorMsg;
	switch (url){
		case "play":
			errorMsg="1、请先转换为真实地址再点击在线播放\n2、在线播放仅支持m3u8、flv、mp4、webm、ogg格式";
			url="https://icedwatermelonjuice.github.io/Online-Player?url=";
			let videoUrl=$("#res_url_box").val();
			url=/.(m3u8|flv|mp4|webm|ogg)/i.test(videoUrl)?url+videoUrl:"";
			break;
		case "dns":
			errorMsg="1、请先转换为真实地址再点击DNS解析\n2、若转换为短链地址，解析结果为短链接口的DNS解析结果";
			url="https://icedwatermelonjuice.github.io/DND-Parse?url=";
			let siteUrl=$("#res_url_box").val();
			url=!/^(thunder|Flashget|qqdl):\/\//i.test(siteUrl)?url+siteUrl:"";
			break;
		default:
			errorMsg="jumpSite(url)参数缺失或错误";
			url=url.trim();
			break;
	}
	if(url){
		open(url);
	}else{
		alert(errorMsg);
		console.log(errorMsg);
	}
}
//从URL获取数据
function fromUrl(keys){
	if(!keys||typeof keys!=="string"){
		return false;
	}
	var queryData=location.search;
	if(!queryData){
		return false;
	}
	queryData=queryData.slice(1).split("&");
	var queryJson={};
	for(let i in queryData){
		let dataArray=queryData[i].split("=");
		if(dataArray[0]){
			queryJson[dataArray[0]]=dataArray[1]?dataArray[1]:"";
		}
	}
	keys=keys.split(",");
	if(keys.length===1){
		return queryJson[keys[0]];
	}else{
		var res={};
		for(let i in keys){
			res[keys[i]]=queryJson[keys[i]];
		}
		return res;
	}
}
//激活隐藏功能
function unhideFn(){
	activeFlag = true;
	$("#playBtn").css("display","");
	$("#dnsBtn").css("display","");
}

var clickNum = 0;
var activeFlag = false;
$(document).ready(function() {
	$("#tittle").click(function() {
		clickNum += 1;
		if (clickNum >= 6) {
			clickNum = 0;
			var msg = "已激活隐藏功能,刷新网页/初始化工具后失效";
			alert(msg);
			console.log(msg);
			unhideFn();
		}
	});
});
$("#origin_url_box").ready(function(){
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
	
	var queryLink=fromUrl("on,url,to");
	if(queryLink["on"]===""){
		console.log("已激活隐藏功能,初始化工具后失效");
		unhideFn();
	}
	if(queryLink["url"]){
		oub.val(queryLink["url"]);
		oub.css("color", "");
		setTimeout(function(){//延时500ms后再执行
			switch (queryLink["to"]){
				case "real":
				case "short":
				case "thunder":
				case "flashget":
				case "qqdl":
					changeUrl(queryLink["to"]);
					break;
				default:
					changeUrl("real");
					break;
			}
		},500)	
	}
})
