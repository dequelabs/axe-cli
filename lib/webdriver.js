const chromedriver = require('chromedriver');
const { Builder, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

module.exports = {
	startDriver: startDriver,
	stopDriver: stopDriver
};

function startDriver(config) {
	let builder;
	const scriptTimeout = (config.timeout || 20) * 1000.0;

	if (config.browser === 'chrome-headless') {
		// Tell selenium use the driver in node_modules
		const service = new chrome.ServiceBuilder(chromedriver.path).build();
		chrome.setDefaultService(service);

		const chromeCapabilities = Capabilities.chrome();
		chromeCapabilities.set('chromeOptions', {
			args: ['--headless'].concat(config.chromeOptions)
		});

		builder = new Builder()
			.forBrowser('chrome')
			.withCapabilities(chromeCapabilities);
	} else {
		builder = new Builder().forBrowser(config.browser);
	}

	// Launch a browser
	config.driver = builder.build();
	config.builder = builder;

	return config.driver
		.manage()
		.timeouts()
		.setScriptTimeout(scriptTimeout)
		.then(() => config);
}

function stopDriver(config) {
	config.driver.quit();
}
