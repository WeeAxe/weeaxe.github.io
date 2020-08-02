var proxy = "https://cors-anywhere.herokuapp.com/"; 
var site  = "https://hyac.carrd.co/"; 
var site2 = "https://static.weeaxe.cn/"; 

async function handleRequest(request) {
	var pattern = new RegExp("^" + site2); 
	var pattern2 = new RegExp("^" + site2 + "(?:sw.js|index.html)"); 
	var url = request.url; 
	var proxified = false; 
	if(pattern.test(url)) {
		proxified = true; 
		if(pattern2.test(url)) 
			proxified = false; 
	}
	if(proxified === true) 
		url = request.url.replace(pattern, proxy + site); 
	console.log(url, "proxified?", proxified); 
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
	return html; 
}

this.addEventListener("fetch", function(event) {
	event.respondWith(handleRequest(event.request)); 
}); 
