var oldWindowOpen = window.open;
var pollInterval;

window.open = function(url, name, specs, replace) {
	var win = oldWindowOpen(url, name, specs, replace);

	if (url == '' && name.match(/^punch_speaker_notes/)) {
		// pollForSelectors(
		// 	win.document,
		// 	[
		// 		'.punch-viewer-speakernotes-side-panel',
		// 		'.punch-viewer-speakernotes-page-container',
		// 		'.punch-viewer-speakernotes-page',
		// 		'.punch-viewer-speakernotes-page svg',
		// 		'.punch-viewer-speakernotes-page-previous',
		// 		'.punch-viewer-speakernotes-page-next',
		// 		'.punch-viewer-speakernotes-page-next .punch-viewer-speakernotes-page-iframe',
		// 	],
		// 	function() {
		// 		modifyPreview(win)
		// 	}
		// );
		pollForFunction(
			function() {
				return win.document != null && win.document.head != null && win.document.body != null;
			},
			function() {
				modifyPreview(win);
			}
		);
	}

	return win;
};

function pollForFunction(f, callback) {
	var interval = setInterval(poll, 1000);

	function poll() {
		// var someMissing = selectors.some(function(selector) {
		// 	return document.querySelector(selector) == null;
		// });

		if (f()) {
			clearInterval(interval);
			callback();
		}
	}
}

function getCss() {
	var sidePanelWidth = 360;
	var sidePanelPadding = 18;
	var currentPreviewWidth = sidePanelWidth - 2 * sidePanelPadding;

	var directionSpacing = 25;
	// var directionBorders = 4;
	var directionWidth = Math.floor((currentPreviewWidth - directionSpacing) / 2);

	var mainCss = {
		// Previews
		'.punch-viewer-speakernotes-side-panel': {
			'width': sidePanelWidth + 'px'
		},
		'.punch-viewer-speakernotes-page-container': {
			'width': 'auto',
			'height': 'auto'
		},
		'.punch-viewer-speakernotes-page': {
			'width': 'auto',
			'height': 'auto'
		},
		'.punch-viewer-speakernotes-page svg': {
			'width': currentPreviewWidth + 'px',
			'height': height16By9(currentPreviewWidth) + 'px'
		},
		'.punch-viewer-speakernotes-page-previous': {
			'width': (directionWidth - 2) + 'px'
		},
		'.punch-viewer-speakernotes-page-next': {
			'width': (directionWidth - 2) + 'px'
		},
		'.punch-viewer-speakernotes-page-iframe': {
			'width': (directionWidth - 4) + 'px',
			'height': height16By9(directionWidth - 4) + 'px'
		},

		// Speaker notes body text
		'.punch-viewer-speakernotes-main-panel': {
			'position': 'relative'
		},
		'.punch-viewer-speakernotes-text-body-scrollable': {
			'left': '0'
		},

		// Timer panel
		'.punch-viewer-speakernotes-timer-panel': {
			'display': 'flex',
			'align-items': 'center',
			'justify-content': 'center'
		},
		'.punch-viewer-speakernotes-timer-main-container': {
			'display': 'block',
			'height': 'auto'
		}
	};

	var directionCss = {
		'.punch-viewer-speakernotes-page': {
			'width': 'auto',
			'height': 'auto'
		},
		'.punch-viewer-speakernotes-page svg': {
			'width': (directionWidth - 4) + 'px',
			'height': height16By9(directionWidth - 4) + 'px'
		}
	}

	return {
		'main': cssToString(mainCss),
		'direction': cssToString(directionCss)
	};
}

function cssToString(css) {
	var s = '';

	for (key in css) {
		s += key + '{';
		s += cssRulesToString(css[key]);
		s += '}';
	}

	return s;
}

function cssRulesToString(rules) {
	var s = '';

	for (key in rules) {
		s += key + ':' + rules[key] + ' !important;';
	}

	return s;
}

function modifyPreview(win) {
	var css = getCss();

	var previousIframe = win.document.querySelector('.punch-viewer-speakernotes-page-previous .punch-viewer-speakernotes-page-iframe');
	var nextIframe = win.document.querySelector('.punch-viewer-speakernotes-page-next .punch-viewer-speakernotes-page-iframe');

	var mainStyle = document.createElement('style');
	mainStyle.type = 'text/css';
	mainStyle.innerHTML = css['main'];
	win.document.head.appendChild(mainStyle);

	var previousStyle = document.createElement('style');
	previousStyle.type = 'text/css';
	previousStyle.innerHTML = css['direction'];
	previousIframe.contentDocument.head.appendChild(previousStyle);

	var nextStyle = document.createElement('style');
	nextStyle.type = 'text/css';
	nextStyle.innerHTML = css['direction'];
	nextIframe.contentDocument.head.appendChild(nextStyle);

	// function expandDirection(directionWidth, element) {
	// 	var iframe = element.querySelector('.punch-viewer-speakernotes-page-iframe');

	// 	element.style.width = directionWidth + 'px';

	// 	iframe.style.width = directionWidth + 'px';
	// 	iframe.style.height = height16By9(directionWidth) + 'px';

	// 	var iframeInner = iframe.contentDocument.querySelector('.punch-viewer-speakernotes-page');

	// 	if (iframeInner != null) {
	// 		var iframeInnerSvg = iframeInner.querySelector('svg');

	// 		iframeInner.style.width = 'auto';
	// 		iframeInner.style.height = 'auto';

	// 		iframeInnerSvg.style.width = directionWidth + 'px';
	// 		iframeInnerSvg.style.height = height16By9(directionWidth) + 'px';
	// 	}
	// }
}

// function modifyPreview(win) {
// 	var sidePanelWidth = 360;
// 	var sidePanelPadding = 18;
// 	var currentPreviewWidth = sidePanelWidth - 2 * sidePanelPadding;

// 	var sidePanel = win.document.querySelector('.punch-viewer-speakernotes-side-panel');
// 	var wrapper1 = win.document.querySelector('.punch-viewer-speakernotes-page-container');
// 	var wrapper2 = win.document.querySelector('.punch-viewer-speakernotes-page');
// 	var currentPreview = wrapper2.querySelector('svg');

// 	sidePanel.style.width = sidePanelWidth + 'px';

// 	wrapper1.style.width = 'auto';
// 	wrapper1.style.height = 'auto';

// 	wrapper2.style.width = 'auto';
// 	wrapper2.style.height = 'auto';

// 	currentPreview.style.width = currentPreviewWidth + 'px';
// 	currentPreview.style.height = height16By9(currentPreviewWidth) + 'px';

// 	// Next/previous
// 	var directionSpacing = 25;
// 	var directionBorders = 4;
// 	var directionWidth = Math.floor((currentPreviewWidth - directionSpacing - directionBorders) / 2);

// 	var previous = win.document.querySelector('.punch-viewer-speakernotes-page-previous');
// 	var next = win.document.querySelector('.punch-viewer-speakernotes-page-next');

// 	expandDirection(directionWidth, previous);
// 	expandDirection(directionWidth, next);

// 	// Speaker notes body

// 	var bodyPanel = win.document.querySelector('.punch-viewer-speakernotes-main-panel');
// 	var bodyText = win.document.querySelector('.punch-viewer-speakernotes-text-body-scrollable');

// 	bodyPanel.style.position = 'relative';
// 	bodyText.style.left = '0';

// 	function expandDirection(directionWidth, element) {
// 		var iframe = element.querySelector('.punch-viewer-speakernotes-page-iframe');

// 		element.style.width = directionWidth + 'px';

// 		iframe.style.width = directionWidth + 'px';
// 		iframe.style.height = height16By9(directionWidth) + 'px';

// 		var iframeInner = iframe.contentDocument.querySelector('.punch-viewer-speakernotes-page');

// 		if (iframeInner != null) {
// 			var iframeInnerSvg = iframeInner.querySelector('svg');

// 			iframeInner.style.width = 'auto';
// 			iframeInner.style.height = 'auto';

// 			iframeInnerSvg.style.width = directionWidth + 'px';
// 			iframeInnerSvg.style.height = height16By9(directionWidth) + 'px';
// 		}
// 	}
// }

function height16By9(width) {
	return Math.round(width * 9 / 16)
}
