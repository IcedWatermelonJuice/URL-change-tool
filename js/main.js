//反馈运行状态
function echoState(str,fcolor) {
	document.getElementById("run_state").innerText = str;
	try{
		if(fcolor){
			document.getElementById("run_state").style.color=fcolor;
		}else{
			document.getElementById("run_state").style.color="";
		}
		
	}catch(e){
		console.log(echoState颜色设置错误);
	}
	
}
// 解码迅雷
function thunderDecode(url) {
	url = url.replace('thunder://', '');
	var res = atob(url);
	res = res.substr(2, res.length - 4);
	return res;
}
// 解码快车
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
// 解码Q旋
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
// 构建UrlBox
function createLink(url) {
	var UrlBox = {
		realUrl: "",
		thunderUrl: "",
		qqdlUrl: "",
		flashgetUrl: ""
	};
	//真实链接
	UrlBox.realUrl = realEncode(url);
	//迅雷链接
	UrlBox.thunderUrl = thunderEncode(UrlBox.realUrl);
	//快车链接
	UrlBox.flashgetUrl = flashgetEncode(UrlBox.realUrl);
	//QQ旋风
	UrlBox.qqdlUrl = qqdlEncode(UrlBox.realUrl);
	return UrlBox;
}
//
function checkUrl(url){
	var res=false;
	if(url.search("https://")===0){
		res=true;
	}else if(url.search("http://")===0){
		res=true;
	}else if(url.search("thunder://")===0){
		res=true;
	}else if(url.search("Flashget://")===0){
		res=true;
	}else if(url.search("qqdl://")===0){
		res=true;
	}
	return res;
}
//转换URL
function changeUrl(mode) {
	var origin_url = document.getElementById("origin_url_box").value;
	origin_url = origin_url.trim();
	if (checkUrl(origin_url)) {
		echoState("转换中.");
		var new_url = createLink(origin_url);
		echoState("转换中..");
		var res_url = "";
		if (new_url) {
			echoState("转换中...");
			if (mode === "real") {
				res_url = new_url.realUrl;
			} else if (mode === "thunder") {
				res_url = new_url.thunderUrl;
			} else if (mode === "flashget") {
				res_url = new_url.flashgetUrl;
			} else if (mode === "qqdl") {
				res_url = new_url.qqdlUrl;
			} else {
				echoState("转换失败(转换模式错误,请刷新页面或反馈给开发者)!","red");
				return false;
			}
			document.getElementById("res_url_box").value = res_url;
			console.log("原始链接:" + origin_url + "\n结果链接:" + res_url);
			echoState("转换成功!","green");
			document.getElementById("copyBtn").style.display="";
		}
	} else {
		echoState("转换失败(输入地址错误)!","red");
	}
}
//复制到剪贴板
function copyUrl() {
	document.getElementById("res_url_box").select();
	document.execCommand('copy');
	alert("已复制到剪贴板");
}
//初始化工具
function initTool() {
	document.getElementById("origin_url_box").value = "请输入http、https、thunder、Fastget、qqdl开头的地址";
	document.getElementById("res_url_box").value = "";
	document.getElementById("copyBtn").style.display="none";
	echoState("未运行");
}
