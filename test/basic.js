/* eslint-env mocha */

'use strict'

const assert = require('assert')
const path = require('path')

const ram = require('random-access-memory')
const dazaar = require('dazaar')
const rimraf = require('rimraf')
const CC = require('../')

const dbDir = path.join(__dirname, 'tmp')
describe('free cores', () => {
  beforeEach((done) => {
    rimraf(dbDir, done)
  })

  afterEach((done) => {
    rimraf(dbDir, done)
  })

  it('creates reproducible keys', () => {
    const mk = '0eafdb010975518a5b5bb12daeb8ac78d08646fa77023b5673d895c36c27d24c'
    const market = dazaar(() => ram(), { masterKey: mk })

    const kp = CC.createKey('trades-BTCUSD', mk, market)

    assert.deepStrictEqual(kp, {
      id: '8fa60e1175030033b6259a0850e8553248ec4302cab36d022cdf2f997d87e04f',
      publicKey: '6555cac038cd759a9370eb845f056b87811fd41815651dbea56bc14ca582427b',
      secretKey: 'd335cd11745b730eb6469d3ad0fc53363594ffe29e28adba1de4720f2943d90d6555cac038cd759a9370eb845f056b87811fd41815651dbea56bc14ca582427b'
    })
  })

  it('basic', async () => {
    const opts = {
      masterKey: '0eafdb010975518a5b5bb12daeb8ac78d08646fa77023b5673d895c36c27d24c',
      storageDir: dbDir,
      title: 'Bitfinex Terminal BTCUSD Candles Dazaar Card'
    }

    const {
      id,
      replication,
      feed,
      card,
      seller,
      db,
      keyPair
    } = await CC.createFreeCore('trades-BTCUSD', opts)

    assert.strictEqual(id, '8fa60e1175030033b6259a0850e8553248ec4302cab36d022cdf2f997d87e04f')

    await db.put('foo', 'bar')
    const { key } = await db.get('foo')

    assert.ok(Buffer.isBuffer(key))
    assert.ok(key.equals(Buffer.from('foo')))

    assert.deepStrictEqual(card, {
      name: 'Bitfinex Terminal BTCUSD Candles Dazaar Card',
      id: '8fa60e1175030033b6259a0850e8553248ec4302cab36d022cdf2f997d87e04f',
      payment: []
    })

    assert.strictEqual(keyPair.publicKey, '6555cac038cd759a9370eb845f056b87811fd41815651dbea56bc14ca582427b')
    assert.strictEqual(typeof seller, 'object')

    feed.close()
    replication.destroy()
  }).timeout(20000)

  it('takes hyperbee opts for encodings', async () => {
    const opts = {
      masterKey: '0eafdb010975518a5b5bb12daeb8ac78d08646fa77023b5673d895c36c27d24c',
      storageDir: dbDir,
      title: 'Bitfinex Terminal BTCUSD Candles Dazaar Card',
      hbeeOpts: { keyEncoding: 'utf8', valueEncoding: 'json' }
    }

    const { db, feed, replication } = await CC.createFreeCore('trades-BTCUSD', opts)

    await db.put('foo', { test: 2 })
    const { value } = await db.get('foo')
    assert.deepStrictEqual(value, { test: 2 })

    feed.close()
    replication.destroy()
  }).timeout(20000)
})
