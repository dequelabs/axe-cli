'use strict';

const WebDriver = require('selenium-webdriver');
const injectAxe = require('./inject-axe');

const parseBrowser = require('./utils').parseBrowser;
const getContext = require('./utils').getContext;
const getOptions = require('./utils').getOptions;

function testPages(urls, config, events) {
	// Setup webdriver
	if (!config.driver) {
		config = Object.assign({}, config, {
			driver: new WebDriver.Builder().forBrowser(config.browser).build()
		});
	}
	const driver = config.driver;

	// End of the line, no more page left
	if (urls.length === 0) {
		driver.quit();
		return Promise.resolve([]);
	}

	return new Promise((resolve, reject) => {
		// Grab the first item on the URL list
		const currentUrl = urls[0].replace(/[,;]$/, '');

		if (events.onTestStart) {
			events.onTestStart(currentUrl);
		}

		driver.get(currentUrl)
		.then(() => injectAxe(driver))
		.then(() => driver.executeAsyncScript(
			axeRunScript,
			getContext(config),
			getOptions(config)
		))
		.then(results => {
			// Notify about the update
			if (events.onTestComplete){
				events.onTestComplete(results);
			}

			// Move to the next item
			testPages(urls.slice(1), config, events)
			.then(out => {
				resolve([results].concat(out))
			});

		}).catch((e) => {
			driver.quit();
			reject(e)
		});
	})
}

function axeRunScript (context, options) {
	/*global document, axe */
	axe.a11yCheck(context || document, options, arguments[arguments.length - 1]);
}

module.exports = testPages
