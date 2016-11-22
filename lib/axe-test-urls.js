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
		config.driver.manage().timeouts().setScriptTimeout(60 * 1000);

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
		.then(function () {
		  	// Wait for the page to be loaded
		  	return driver.executeAsyncScript(function(callback) {
	            var script = document.createElement('script');
	            script.innerHTML = 'document.documentElement.classList.add("deque-axe-is-ready");';
	            document.documentElement.appendChild(script);
	            callback();
	        });
        })
        .then(function () {
            return driver.wait(WebDriver.until.elementsLocated(WebDriver.By.css('.deque-axe-is-ready')));
        })
		.then(() => {
			// Set everything up
			const axe = AxeBuilder(driver, config.axeSource)

			if (Array.isArray(config.include)) {
				config.include.forEach(include => axe.include(include))
			}
			if (Array.isArray(config.exclude)) {
				config.exclude.forEach(exclude => axe.exclude(exclude))
			}

			// Can not use withTags and withRules together
			if (config.tags) {
				axe.withTags(config.tags)
			} else if (config.rules) {
				axe.withRules(config.rules)
			}

	  	// Run axe
			axe.analyze(function (results) {
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

module.exports = testPages

function getSource() {
	// Look for axe in CWD
	let axePath = path.join(process.cwd(), './axe.js');
	if (!fs.existsSync(axePath)) {
		// Look for axe in CDW ./node_modules
		axePath = path.join(process.cwd(), './node_modules/axe-core/axe.js')
	}
	if (fs.existsSync(axePath)) {
		return fs.readFileSync(axePath);
	} else { // Fall back axe in axe-webdriverjs
		return null
	}
}
