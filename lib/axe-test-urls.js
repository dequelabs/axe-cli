'use strict';

const WebDriver = require('selenium-webdriver');
const AxeBuilder = require('axe-webdriverjs');

const startDriver = require('./webdriver').startDriver;
const stopDriver = require('./webdriver').stopDriver;

function testPages(urls, config, events) {
	const driver = config.driver;
	// Setup webdriver
	if (!driver) {
		return startDriver(config).then(function (config) {
			return testPages(urls, config, events)
		})
	}

	// End of the line, no more page left
	if (urls.length === 0) {
		stopDriver(config);
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
