var oldWindowOpen = window.open;
var pollInterval;
var SIDEBAR_INITIAL_WIDTH = 250;

window.open = function(url, name, specs, replace) {
	var win = oldWindowOpen(url, name, specs, replace);

	if (url == '' && name.match(/^punch_speaker_notes/)) {
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
		if (f()) {
			clearInterval(interval);
			callback();
		}
	}
}

function getCss(sidePanelWidth) {
	var sidePanelPadding = 18;
	var currentPreviewWidth = sidePanelWidth - 2 * sidePanelPadding;

	var directionSpacing = 25;
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
		},

		// Dragger
		'.sidebar-dragger': {
			'width': '4px',
			'height': '100vh',
			'position': 'absolute',
			'background-color': '#DFDFDF',
			'top': 0,
			'margin-left': '-2px',
			'cursor': 'col-resize'
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

function makeResizable(win) {
	var drag = win.document.createElement('div');
	drag.classList.add('sidebar-dragger');
	drag.style.left = SIDEBAR_INITIAL_WIDTH + 'px';
	win.document.body.appendChild(drag);

	drag.addEventListener('mousedown', mouseDown);
	win.document.body.addEventListener('mouseup', mouseUp);
	win.document.body.addEventListener('mousemove', mouseMove);

	var dragging = false;

	function mouseDown(e) {
		dragging = true;
		drag.style.left = e.pageX + 'px';
	}

	function mouseUp(e) {
		dragging = false;
		updateCss(win, getCss(drag.offsetLeft));
	}

	function mouseMove(e) {
		if (dragging) {
			e.preventDefault();
			drag.style.left = e.pageX + 'px';
		}
	}
}

function updateCss(win, css) {
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
}

function modifyPreview(win) {
	makeResizable(win);
	updateCss(win, getCss(SIDEBAR_INITIAL_WIDTH));
}

function height16By9(width) {
	return Math.round(width * 9 / 16)
}
