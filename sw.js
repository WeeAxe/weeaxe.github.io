var proxy = "https://cors-anywhere.herokuapp.com/"; 
var site  = "https://hyac.carrd.co/"; 
var site2 = "https://static.weeaxe.cn/"; 
var version = "1.6"; 

site2 = site2.replace(".", "\\."); 
async function handleRequest(request) {
	var pattern = new RegExp("^" + site2 + "assets"); 
	var url = request.url; 
	var proxified = pattern.test(url); 
	console.log(url, "proxified?", proxified); 
	if(proxified === true) 
		url = request.url.replace(pattern, proxy + site); 
	var resp = await fetch(url, {redirect: "manual"}); 
	if(!proxified || !/^text/.test(resp.headers.get("Content-Type"))) return resp; 
	console.log("Applied rewriting."); 
	var text = await resp.text(); 
	text = rewriteHTML(text); 
	var init = new Array(); 
	init.headers = resp.headers; 
	return new Response(text, init); 
}

function rewriteHTML(html) {
	// Remove credits 
	html = html.replace(/<p id="credits">.*?<\/p>/, ""); 
	// Embed version 
	html = html.replace(/##VERSION##/g, "v" + version); 
	// Embed HTML 
	html = embed(html); 
	return html; 
}

function embed(str) {
	function escape2Html(str) {
		var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
		return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
	}
    str = str.replace(/<p([^<>]+?><span>##HTML##<\/span>)/g, "<div$1"); 
	while(true) {
		var result = /<span>##HTML##<\/span>(.*?)(?=<\/p>)/.exec(str); 
		if(!result) break; 
		var raw = result[1].replace(/<[^<>]+?>/g, ""); 
		raw = escape2Html(raw); 
		str = str.replace(/<span>##HTML##<\/span>(?:.*?)<\/p>/, raw + "</div>"); 
	}
	return str; 
}

this.addEventListener("fetch", function(event) {
	event.respondWith(handleRequest(event.request)); 
}); 
