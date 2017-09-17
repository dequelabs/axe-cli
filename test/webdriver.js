/* global mocha */
'use strict';

const assert = require('chai').assert
const startDriver = require('../lib/webdriver').startDriver
const stopDriver = require('../lib/webdriver').stopDriver

describe('startDriver', () => {
	it('returns a promise', (done) => {
		const out = startDriver({ 'browser': 'chrome' })

		assert.isFunction(out.then)
		assert.isFunction(out.catch)
		out.then(stopDriver)
			.then(done)
	})

	it('creates a driver', (done) => {
		startDriver({ 'browser': 'chrome' })
		.then((config) => {
			assert.isObject(config.driver)
			assert.isFunction(config.driver.manage)

			stopDriver(config)
			done()
		})
	})
})

describe('stopDriver', () => {
	it('calls browser.quit', () => {
		let called = 0;
		stopDriver({
			browser: 'chrome',
			driver: { quit: () => called++ }
		})
		assert.equal(called, 1)
	})
})
