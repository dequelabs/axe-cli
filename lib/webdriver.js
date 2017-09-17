const WebDriverBuilder = require('selenium-webdriver').Builder;
const chrome = require('selenium-webdriver').chrome;

module.exports = {
	startDriver: startDriver,
	stopDriver: stopDriver,
}

function startDriver(config) {
	const builder = new WebDriverBuilder().forBrowser(config.browser)
	const scriptTimeout = config.timeout * 1000;

	// Launch a browser
	config.driver = builder.build();
	config.driver.manage().timeouts().setScriptTimeout(scriptTimeout);

	return Promise.resolve(config);
}

function stopDriver(config) {
	config.driver.quit();
}
