var SIDEBAR_INITIAL_WIDTH = 250;
var EXTENSION_NAMESPACE = 'resizable_speaker_notes_extension';
var originalWindowOpen = window.open;
var mainStyle;
var previousStyle;
var nextStyle;

window.open = function(url, name, specs, replace) {
	var win = originalWindowOpen(url, name, specs, replace);

	if (url == '' && name.match(/^punch_speaker_notes/)) {
		pollForPredicate(
			function() {
				return win.document != null && win.document.head != null && win.document.body != null;
			},
			function() {
				modifySidebar(win);
			}
		);
	}

	return win;
};

function pollForPredicate(p, callback) {
	var interval = setInterval(poll, 1000);

	function poll() {
		if (p()) {
			clearInterval(interval);
			callback();
		}
	}
}

function modifySidebar(win) {
	makeResizable(win);
	initCss(win)
	updateCss(getCss(SIDEBAR_INITIAL_WIDTH));
}

function makeResizable(win) {
	var drag = win.document.createElement('div');
	var dragInner = win.document.createElement('div');

	drag.classList.add(EXTENSION_NAMESPACE + '-drag');
	drag.style.left = SIDEBAR_INITIAL_WIDTH + 'px';

	dragInner.classList.add(EXTENSION_NAMESPACE + '-drag-inner');

	drag.appendChild(dragInner);
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
		updateCss(getCss(parseInt(drag.style.left)));
	}

	function mouseMove(e) {
		if (dragging) {
			e.preventDefault();
			drag.style.left = e.pageX + 'px';
		}
	}
}

function initCss(win) {
	var previousIframe = win.document.querySelector('.punch-viewer-speakernotes-page-previous .punch-viewer-speakernotes-page-iframe');
	var nextIframe = win.document.querySelector('.punch-viewer-speakernotes-page-next .punch-viewer-speakernotes-page-iframe');

	mainStyle = document.createElement('style');
	mainStyle.type = 'text/css';
	win.document.head.appendChild(mainStyle);

	previousStyle = document.createElement('style');
	previousStyle.type = 'text/css';
	previousIframe.contentDocument.head.appendChild(previousStyle);

	nextStyle = document.createElement('style');
	nextStyle.type = 'text/css';
	nextIframe.contentDocument.head.appendChild(nextStyle);
}

function updateCss(css) {
	mainStyle.innerHTML = css['main'];
	previousStyle.innerHTML = css['direction'];
	nextStyle.innerHTML = css['direction'];
}

function getCss(sidebarWidth) {
	var sidebarPadding = 18;
	var currentPreviewWidth = sidebarWidth - 2 * sidebarPadding;

	var directionSpacing = 25;
	var directionWidth = Math.floor((currentPreviewWidth - directionSpacing) / 2);

	var mainCss = {};

	mainCss = {
		// Previews
		'.punch-viewer-speakernotes-side-panel': {
			'width': sidebarWidth + 'px'
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

	};

	// Dragger
	var dragClass = '.' + EXTENSION_NAMESPACE + '-drag';
	var dragClassInner = '.' + EXTENSION_NAMESPACE + '-drag-inner';
	mainCss[dragClass] = {
		'width': '20px',
		'height': '100vh',
		'position': 'absolute',
		'top': 0,
		'margin-left': '-10px',
		'cursor': 'col-resize'
	};
	mainCss[dragClassInner] = {
		'width': '4px',
		'height': '100%',
		'position': 'absolute',
		'top': 0,
		'left': '50%',
		'margin-left': '-2px',
		'background-color': '#DFDFDF'
	};
	mainCss[dragClass + ':hover ' + dragClassInner] = {
		'background-color': '#C7C7C7'
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

function height16By9(width) {
	return Math.round(width * 9 / 16)
}
