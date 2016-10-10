'use strict';

const fs = require('fs');
const path = require('path');
const WebDriver = require('selenium-webdriver');
const AxeBuilder = require('axe-webdriverjs');

const parseBrowser = require('./utils').parseBrowser;
const getContext = require('./utils').getContext;
const getOptions = require('./utils').getOptions;

function testPages(urls, config, events) {
	// Setup webdriver
	if (!config.driver || !config.axeSource) {
		config = Object.assign({}, config, {
			driver: config.driver || new WebDriver.Builder().forBrowser(config.browser).build(),
			axeSource: config.axeSource || getSource(),
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
		.then(() => {
			// Set everything up
			AxeBuilder(driver, config.axeSource)
		  	.include(config.include)
		  	.exclude(config.exclude)
		  	.withTags(config.tags)
		  	.withRules(config.rules)
		  	// Run axe
			.analyze(function (results) {
				// Notify about the update
				if (events.onTestComplete){
					events.onTestComplete(results);
				}

				// Move to the next item
				testPages(urls.slice(1), config, events)
				.then(out => {
					resolve([results].concat(out))
				});
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

function getSource() {
	// Look for axe in CWD
	let axePath = path.join(process.cwd(), './axe.js');
	if (!fs.existsSync(axePath)) {
		// Look for axe in CDW ./node_modules
		axePath = path.join(process.cwd(), './node_modules/axe-core/axe.js')
	}
	// Fall back to current axe
	if (!fs.existsSync(axePath)) {
		axePath = path.join(__dirname, '../node_modules/axe-core/axe.js')
	}
	return fs.readFileSync(axePath);
}
