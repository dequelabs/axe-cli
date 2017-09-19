/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const testPages = require('../lib/axe-test-urls')

describe('testPages', function () {
  let config, mockDriver

  beforeEach(() => {
    mockDriver = {
      get: (arg) => Promise.resolve(arg),
      executeAsyncScript: (arg) => Promise.resolve(arg),
      executeScript: (arg) => Promise.resolve(arg),
      wait: (arg) => Promise.resolve(arg),
      switchTo: () => ({ defaultContent: () => {} }),
      findElements: () => Promise.resolve([]),
      quit: (arg) => Promise.resolve(arg)
    }
    config = { driver: mockDriver }
  })

  it('return a promise', () => {
    assert.instanceOf(
      testPages([], config, {}),
      Promise
    )
  })

  it('calls driver.get() for each URL', (done) => {
    const urlsCalled = []
    const urls = ['http://foo', 'http://bar', 'http://baz']

    mockDriver.get = (url) => {
      urlsCalled.push(url)
      return Promise.resolve(url)
    }

    testPages(urls, config, {})
      .catch(e => { throw new Error(e) })

    setTimeout(() => {
      assert.deepEqual(urlsCalled, urls)
      done()
    }, 30)
  })

  xit('waits until the document is ready to have a className added', (done) => {
    const asyncScripts = []
    let waitCalls = 0

    mockDriver.executeAsyncScript = (script) => {
      asyncScripts.push(script)
      return Promise.resolve(script)
    }
    mockDriver.wait = (script) => {
      waitCalls++
      return Promise.resolve(script)
    }

    testPages(['http://foo'], config, {})
      .catch(e => { throw e })

    setTimeout(() => {
      assert.include(
        asyncScripts[0].toString(),
        '.innerHTML = \'document.documentElement.classList.add("deque-axe-is-ready");\''
      )
      assert.equal(waitCalls, 1)
      done()
    }, 10)
  })

  it('injects axe into the page', (done) => {
    const scripts = []
    config.axeSource = 'axe="hi, I am axe"'
    mockDriver.executeScript = (script) => {
      scripts.push(script)
      return Promise.resolve(script)
    }

    testPages(['http://foo'], config, {})
      .catch(e => { throw e })

    setTimeout(() => {
      assert.include(scripts[0].toString(), config.axeSource)
      done()
    }, 10)
  })

  it('runs axe once the page is loaded', (done) => {
    const asyncScripts = []
    mockDriver.executeAsyncScript = (script) => {
      asyncScripts.push(script)
      return Promise.resolve(script)
    }

    testPages(['http://foo'], config, {})
      .catch(e => { throw e })

    setTimeout(() => {
      assert.isDefined(
        asyncScripts.map(script => script.toString())
          .find(script => script.match(/(axe\.run)|(axe\.a11yCheck)/))
      )
      done()
    }, 10)
  })
})
