function injectScript(script) {
	var s = document.createElement('script');
	s.src = chrome.extension.getURL(script);
	s.addEventListener('load', function(e) {
	    s.parentNode.removeChild(s);
	});
	document.head.appendChild(s);
}

injectScript('injected_script.js');
