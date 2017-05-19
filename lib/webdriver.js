const WebDriverBuilder = require('selenium-webdriver').Builder;
const phantomjs = require('phantomjs-prebuilt');

module.exports = {
	startDriver: startDriver,
	stopDriver: stopDriver,
}

function startDriver(config) {
	const builder = new WebDriverBuilder().forBrowser(config.browser)

	if (config.browser !== 'phantomjs') {
		// Launch a browser
		config.driver = builder.build();
		config.driver.manage().timeouts().setScriptTimeout(90*1000);

		return Promise.resolve(config);

	} else {
		// Start phantomjs-prebuilt
		return phantomjs.run('--webdriver=4444')
		.then(phantom => {
			// Save phantom, so we can close it when we are done
			config.phantom = phantom;

			// And connect selenium to our phantom server
			config.driver = builder.usingServer('http://localhost:4444/wd/hub').build();
			config.driver.manage().timeouts().setScriptTimeout(90*1000)

			return Promise.resolve(config);
		})

	}
}

function stopDriver(config) {
	if (config.browser !== 'phantomjs') {
		config.driver.quit();
	}
	if (config.phantom) {
		config.phantom.kill();
	}
}
