'use strict'

const path = require('path')
const { promisify } = require('util')

const hypercore = require('hypercore')
const Hyperbee = require('hyperbee')
const swarm = require('dazaar/swarm')

const dazaar = require('dazaar')
const Protocol = require('hypercore-protocol')
const derive = require('derive-key')

class CreateCore {
  static async createFreeCore (name, opts) {
    const { masterKey, storageDir, title, hbeeOpts = {} } = opts

    const market = dazaar(path.join(storageDir, 'dazaar', name), { masterKey })
    const ready = promisify(market.ready).bind(market)
    await ready()

    const keyPair = this.createKey(name, masterKey, market)

    const feed = hypercore(
      path.join(storageDir, 'core', name),
      keyPair.publicKey,
      { secretKey: keyPair.secretKey }
    )

    const fready = promisify(feed.ready).bind(feed)
    await fready()

    const seller = market.sell(feed, {
      validate (remoteKey, done) {
        return done(null, { type: 'free' })
      },
      uniqueFeed: false
    })

    const sready = promisify(seller.ready).bind(seller)
    await sready()

    const db = new Hyperbee(feed, hbeeOpts)

    let replication
    await new Promise((resolve) => {
      replication = swarm(seller, resolve)
    })

    const card = this.getCard(title, keyPair)

    return {
      id: keyPair.id,
      card,
      keyPair,
      replication,
      feed,
      seller,
      market,
      db
    }
  }

  static getCard (title, keyPair) {
    return {
      name: title,
      id: keyPair.id,
      payment: []
    }
  }

  static createKey (name, masterKey, market) {
    const keys = market.deriveHypercoreKeyPair(name)
    const kd = 'sales/' + keys.publicKey.toString('hex') + '/key-pair'
    const keyPair = Protocol.keyPair(derive('dazaar', Buffer.from(masterKey, 'hex'), kd))

    return {
      id: keyPair.publicKey.toString('hex'),
      publicKey: keys.publicKey.toString('hex'),
      secretKey: keys.secretKey.toString('hex')
    }
  }
}

module.exports = CreateCore
