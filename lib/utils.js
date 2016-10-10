module.exports.parseUrl = function parseUrl(url) {
	if (url.substr(0,4) !== 'http') {
		return 'http://' + url;
	}
	return url;
}

module.exports.parseBrowser = function parseBrowser(browser) {
	browser = browser || '';
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
		default:
			return 'phantomjs';
	}
}


module.exports.getContext = function getContext(config) {
	if (config.include || config.exclude) {
		return {
			include: config.include,
			exclude: config.exclude
		}
	}
}

module.exports.getOptions = function getOptions(config) {
	if (config.rules) {
		return { runOnly: {
		    type: 'rule',
		    values: config.rules
		}};
	} else if (config.tags) {
		return { runOnly: {
		    type: 'tags',
		    values: config.rules
	 	}};
	}
}

