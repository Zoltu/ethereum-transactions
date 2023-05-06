# ethereum-transactions
A low dependency library that can encode, decode, and sign Ethereum transactions.

## Features
* 3 dependencies with **no transitive dependencies** ('@noble/hashes' for keccak256, '@noble/secp256k1' for signing and recovery, '@zoltu/rlp-encoder' for encoding/decoding).
* Legacy, EIP-155, EIP-2930 (Berlin), and EIP-1559 (London) transaction types supported.
* Signed and unsigned transactions supported.
* Deserialize from standard JSON-RPC wire format into a smaller footprint native JS in-memory representation (bigints, Uint8Arrays).
* Deduce transaction type from encoded or wire serialized forms.
* Sign transactions.
* Recover sender from signed transactions.
* Has tests!

## Usage
```bash
# always npm install with --ignore-scripts to mitigate risk of supply chain attacks
npm install --ignore-scripts @zoltu/ethereum-transactions
```

### Decode & Serialize
```ts
import { hexToBytes } from '@zoltu/ethereum-transactions/converters.js'
import { decodeTransaction, serializeTransaction } from '@zoltu/ethereum-transactions'

const encodedTransaction = hexToBytes('0x02f862848404bf1f820288832c7e6384346d9246819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33cc0')
const decodedTransaction = decodeTransaction(encodedTransaction)
const serializedTransaction = serializeTransaction(decodedTransaction)
console.log(serializedTransaction)
// {
// 	type: '1559',
// 	chainId: '0x8404bf1f',
// 	nonce: '0x288',
// 	maxPriorityFeePerGas: '0x2c7e63',
// 	maxFeePerGas: '0x346d9246',
// 	gasLimit: '0x9d',
// 	to: '0x6Eb893e3466931517a04a17D153a6330c3f2f1dD',
// 	value: '0xc854',
// 	data: '0x889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33c',
// 	accessList: []
// }
```

### Deserialize & Encode
```ts
import { bytesToHex } from '@zoltu/ethereum-transactions/converters.js'
import { deserializeTransaction, encodeTransaction } from '@zoltu/ethereum-transactions'

const serializedTransaction = {
	chainId: '0x8404bf1f',
	nonce: '0x288',
	maxPriorityFeePerGas: '0x2c7e63',
	maxFeePerGas: '0x346d9246',
	gasLimit: '0x9d',
	to: '0x6Eb893e3466931517a04a17D153a6330c3f2f1dD',
	value: '0xc854',
	data: '0x889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33c',
	accessList: []
}
const deserializedTransaction = deserializeTransaction(serializedTransaction)
const encodedTransaction = encodeTransaction(deserializedTransaction)
console.log(bytesToHex(encodedTransaction))
// 0x02f862848404bf1f820288832c7e6384346d9246819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33cc0
```

### Signing & Recovery
```ts
import { hexToBytes, addressBigintToHex } from '@zoltu/ethereum-transactions/converters.js'
import { decodeTransaction, serializeTransaction, signTransaction, getSigner } from '@zoltu/ethereum-transactions'

const encodedTransaction = hexToBytes('0x02f862848404bf1f820288832c7e6384346d9246819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33cc0')
const decodedTransaction = decodeTransaction(encodedTransaction)
const signedTransaction = await signTransaction(decodedTransaction, 0x2bf558dce44ca98616ee629199215ae5401c97040664637c48e3b74e66bcb3aen)
console.log(serializeTransaction(signedTransaction))
// {
// 	type: '1559',
// 	chainId: '0x8404bf1f',
// 	nonce: '0x288',
// 	maxPriorityFeePerGas: '0x2c7e63',
// 	maxFeePerGas: '0x346d9246',
// 	gasLimit: '0x9d',
// 	to: '0x6Eb893e3466931517a04a17D153a6330c3f2f1dD',
// 	value: '0xc854',
// 	data: '0x889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33c',
// 	accessList: [],
// 	yParity: '0x0',
// 	r: '0xf1003f96c6c6620dd46db36d2ae9f12d363947eb0db088c678b6ad1cf494aa6f',
// 	s: '0x6085b5abbf448de5d622dc820da590cfdb6bb77b41c6650962b998a941f8d701'
// }
const signer = getSigner(signedTransaction)
console.log(addressBigintToHex(signer))
// 0x801040E2965D0cf9d73FEe4ccc8eEA9eeBbC491e
```
