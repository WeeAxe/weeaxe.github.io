async function handleRequest(request) {
	var proxy = "https://cors-anywhere.herokuapp.com/"; 
	var base = "https://hyac.carrd.co/"
	var pattern = /^https:\/\/static.weeaxe.cn\//; 
	var url = request.url; 
	var proxified = false; 
	if(pattern.test(url)) {
		proxified = true; 
		url = request.url.replace(pattern, proxy + base); 
	}
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
