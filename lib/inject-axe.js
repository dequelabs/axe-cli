'use strict';
const path = require('path');
const fs = require('fs');

module.exports = function injectAxe(driver) {
	return new Promise((resolve, reject) => {
		const script = '(' + axeInjectScript.toString() + '({'+
			// stringify so that quotes are properly escaped
			'axeSource: ' + JSON.stringify(getSource() + ';') +
		'}))'

		driver.switchTo().defaultContent();
		driver.executeScript(script)
		.then(() => {
			findFramesAndInject(null, script, driver)
		})
		.then(() => {
			driver.switchTo().defaultContent();
			resolve();
		});
	});
}

/**
 * Recursively find frames and inject a script into them
 * @private
 * @param  {Array}  parent Array of parent frames; or falsey if top level frame
 * @param  {String} script The script to inject
 * @param  {WebDriver} driver The driver to inject into
 */
function findFramesAndInject(parent, script, driver) {
	return new Promise((resolve, reject) => {
		driver.findElements({
			tagName: 'iframe'
		})
		.then(results => results.forEach(frame => {
			driver.switchTo().defaultContent();
			if (parent) {
				parent.forEach(p => driver.switchTo().frame(p));
			}

			return driver.switchTo().frame(frame)
			.then(() => driver.executeScript(script))
			.then(() => {
				findFramesAndInject((parent || []).concat(frame), script, driver);
			});
		}));
	})
}

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

function axeInjectScript (options) {
	if (typeof axe === 'object' && axe.version) {
		return;
	}
	var scriptElm = document.createElement('script');
	scriptElm.innerHTML = options.axeSource;
	if (options.configure) {
		axe.configure(configure);
	}
	document.body.appendChild(scriptElm)
}
