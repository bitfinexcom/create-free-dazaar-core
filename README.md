# create-free-dazaar-core

Toolset for creating free dazaar cores, a functionality commonly used


## Usage

```js

const CC = require('@bitfinex/create-free-dazaar-core')
const keyEncoding = require('bitfinex-terminal-key-encoding')

const res = await CC.createFreeCore('BTC-USD', {
  masterKey: '0eafdb010975518a5b5bb12daeb8ac78d08646fa77023b5673d895c36c27d24c',
  storageDir: dbDir,
  title: 'Bitfinex Terminal BTCUSD Candles Dazaar Card',
  hbeeOpts: { keyEncoding }
})
```


## API

### (static) createFreeCore(name, opts) => `<Promise>` => `<Object>` data

  - `name` The unique name for the Dazaar core, e.g. `trades-BTCUSD`
  - `opts`
    - `masterKey <String>` The master key
    - `storageDir <String>` The base directory for `core` and `dazaar`
    - `title <String>` The title for the Dazaar Card
    - `hbeeOpts <Object>` Options passed directly to Hyperbee

### (static) createKey(name, masterkey, market) => `<Object>` keys

  - `name` The unique name for the Dazaar core, e.g. `trades-BTCUSD`
  - `masterKey <String>` The master key
  - `market <Object>` A dazaar market object from calling `dazaar()`

Creates a keyset for a name from a masterkey / market
