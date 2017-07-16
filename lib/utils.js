module.exports.parseUrl = function parseUrl(url) {
	if (url.substr(0,4) !== 'http') {
		return 'http://' + url;
	}
	return url;
}

module.exports.parseBrowser = function parseBrowser(browser) {
	if (!browser) {
		return 'phantomjs'
	}

	const l = browser.length;
	switch (browser.toLowerCase()) {
		case 'ff':
		case 'firefox'.substr(0,l):
		case 'gecko'.substr(0,l):
		case 'marionette'.substr(0,l):
			return 'firefox';

		case 'chrome'.substr(0,l):
			return 'chrome';

		case 'ie':
		case 'explorer'.substr(0,l):
		case 'internetexplorer'.substr(0,l):
		case 'internet_explorer'.substr(0,l):
		case 'internet-explorer'.substr(0,l):
			return 'ie';

		case 'safari'.substr(0,l):
			return 'safari';

		case 'edge'.substr(0,l):
		case 'microsoftedge'.substr(0,l):
			return 'MicrosoftEdge';

		case 'phantomjs'.substr(0,l):
			return 'phantomjs';

		default: throw new Error('Unknown browser ' + browser)
	}
}

module.exports.getAxeSource = function getAxeSource(axePath) {
	const path = require('path')
	const fs = require('fs')
	// Abort if axePath should exist, and it isn't
	if (axePath && !fs.existsSync(axePath)) {
		return
	// Look for axe in CWD
	} else if (!axePath) {
		axePath = path.join(process.cwd(), './axe.js')
	}

	if (!fs.existsSync(axePath)) {
		// Look for axe in CDW ./node_modules
		axePath = path.join(process.cwd(), './node_modules/axe-core/axe.js')
	}
	if (!fs.existsSync(axePath)) {
		// if all else fails, use the locally installed axe
		axePath = path.join(__dirname, '../node_modules/axe-core/axe.js')
	}

	return fs.readFileSync(axePath, 'utf8')
}


module.exports.getAxeVersion = function getAxeVersion(source) {
	const match = source.match(/\.version\s*=\s'([^']+)'/)
	return (match ? match[1] : 'unknown version')
}


module.exports.splitList = function (val) {
	return (val.split(/[,;]/)).map(str => str.trim());
}