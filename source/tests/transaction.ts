import { describe, should } from 'micro-should'
import { testCases } from './ethers-transactions.js'
import { Transaction, Transaction1559Unsigned, Transaction155Unsigned, Transaction2930Unsigned, TransactionLegacyUnsigned, decodeTransaction, encodeTransaction, getSigner, isSigned, signTransaction } from '../transaction.js'
import { addressHexToBigint, bigintToHex, hexToBigint, hexToBytes } from '../converters.js'
import { assertEqual } from './utils.js'

async function test(unsigned: Transaction, privateKey: bigint, unsignedRlp: Uint8Array, signedRlp: Uint8Array) {
	// sign
	const signed = await signTransaction(unsigned, privateKey)

	// encode unsigned
	const encodedUnsigned = encodeTransaction(unsigned)
	assertEqual(unsignedRlp, encodedUnsigned)

	// decode unsigned
	const decodedUnsigned = decodeTransaction(unsignedRlp)
	assertEqual(unsigned, decodedUnsigned)

	// encode signed
	const encodedSigned = encodeTransaction(signed)
	assertEqual(signedRlp, encodedSigned)

	// decode signed
	const decodedSigned = decodeTransaction(signedRlp)
	assertEqual(signed, decodedSigned)
}

describe('legacy', () => {
	for (const testCase of testCases) {
		should(testCase.name, async () => {
			const unsigned: TransactionLegacyUnsigned = {
				type: 'legacy',
				to: testCase.transaction.to !== undefined ? addressHexToBigint(testCase.transaction.to) : null,
				data: hexToBytes(testCase.transaction.data ?? '0x'),
				gasLimit: hexToBigint(testCase.transaction.gasLimit ?? '0x0'),
				gasPrice: hexToBigint(testCase.transaction.gasPrice ?? '0x0'),
				nonce: BigInt(testCase.transaction.nonce ?? 0),
				value: hexToBigint(testCase.transaction.value ?? '0x0'),
			}
			await test(unsigned, hexToBigint(testCase.privateKey), hexToBytes(testCase.unsignedLegacy), hexToBytes(testCase.signedLegacy))
		})
	}
})
describe('155', () => {
	for (const testCase of testCases) {
		// https://github.com/ethereumjs/ethereumjs-monorepo/pull/2671
		const chainId = testCase.transaction.chainId
		if (chainId === undefined || chainId === null || chainId === '' || chainId === '0x' || BigInt(chainId) === 0n) continue

		should(testCase.name, async () => {
			const unsigned: Transaction155Unsigned = {
				type: '155',
				chainId: hexToBigint(testCase.transaction.chainId ?? '0x0'),
				to: testCase.transaction.to !== undefined ? addressHexToBigint(testCase.transaction.to) : null,
				data: hexToBytes(testCase.transaction.data ?? '0x'),
				gasLimit: hexToBigint(testCase.transaction.gasLimit ?? '0x0'),
				gasPrice: hexToBigint(testCase.transaction.gasPrice ?? '0x0'),
				nonce: BigInt(testCase.transaction.nonce ?? 0),
				value: hexToBigint(testCase.transaction.value ?? '0x0'),
			}
			await test(unsigned, hexToBigint(testCase.privateKey), hexToBytes(testCase.unsignedEip155), hexToBytes(testCase.signedEip155))
		})
	}
})
describe('2930', () => {
	for (const testCase of testCases) {
		should(testCase.name, async () => {
			const unsigned: Transaction2930Unsigned = {
				type: '2930',
				chainId: hexToBigint(testCase.transaction.chainId ?? '0x1'),
				to: testCase.transaction.to !== undefined ? addressHexToBigint(testCase.transaction.to) : null,
				data: hexToBytes(testCase.transaction.data ?? '0x'),
				gasLimit: hexToBigint(testCase.transaction.gasLimit ?? '0x0'),
				gasPrice: hexToBigint(testCase.transaction.gasPrice ?? '0x0'),
				nonce: BigInt(testCase.transaction.nonce ?? 0),
				value: hexToBigint(testCase.transaction.value ?? '0x0'),
				accessList: (testCase.transaction.accessList ?? []).map(tuple => [addressHexToBigint(tuple.address), tuple.storageKeys.map(hexToBigint)])
			}
			await test(unsigned, hexToBigint(testCase.privateKey), hexToBytes(testCase.unsignedBerlin), hexToBytes(testCase.signedBerlin))
		})
	}
})
describe('1559', () => {
	for (const testCase of testCases) {
		should(testCase.name, async () => {
			const unsigned: Transaction1559Unsigned = {
				type: '1559',
				chainId: hexToBigint(testCase.transaction.chainId ?? '0x1'),
				to: testCase.transaction.to !== undefined ? addressHexToBigint(testCase.transaction.to) : null,
				data: hexToBytes(testCase.transaction.data ?? '0x'),
				gasLimit: hexToBigint(testCase.transaction.gasLimit ?? '0x0'),
				maxPriorityFeePerGas: hexToBigint(testCase.transaction.maxPriorityFeePerGas ?? '0x0'),
				maxFeePerGas: hexToBigint(testCase.transaction.maxFeePerGas ?? '0x0'),
				nonce: BigInt(testCase.transaction.nonce ?? 0),
				value: hexToBigint(testCase.transaction.value ?? '0x0'),
				accessList: (testCase.transaction.accessList ?? []).map(tuple => [addressHexToBigint(tuple.address), tuple.storageKeys.map(hexToBigint)])
			}
			await test(unsigned, hexToBigint(testCase.privateKey), hexToBytes(testCase.unsignedLondon), hexToBytes(testCase.signedLondon))
		})
	}
})

describe('recover sender', () => {
	const cases = [
		{ name: 'legacy1', signerAddress: 0xd4fe407789e11a27b7888a324ec597435353dc35n, signedTransactionBytes: hexToBytes('0xf86b018502540be40082520894df90dea0e0bf5ca6d2a7f0cb86874ba6714f463e872386f26fc100008029a0c933e91702f2131f5565eafbad1eaccb6086dab9c5d6eba1bf454f3106099d3da015467094f7d60d0cd16702cee4460863cb94165714dd0d26a0df24995f785dcf') },
		{ name: 'legacy2', signerAddress: 0x801040E2965D0cf9d73FEe4ccc8eEA9eeBbC491en, signedTransactionBytes: hexToBytes('0xf89982028882237e819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33c1ba0ba61344dc955b2f0e5dbc3c65e023e1c718539465131acb8a51b2ef75620114aa03366e9f2294bf2eca7322f3954b9b38745c40602239e3d7fa693667206907518') },
		{ name: '155', signerAddress: 0x801040E2965D0cf9d73FEe4ccc8eEA9eeBbC491en, signedTransactionBytes: hexToBytes('0xf89e82028882237e819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33c850108097e62a0f141fe1b7e2fc1ed5d2b6ea4f04f92053e18f07274e2bda1c6852438c1895229a075553a7ae158a3fd46f75b547e847b59e2876f9a42de7a26d016db33232516de') },
		{ name: '2930', signerAddress: 0x801040E2965D0cf9d73FEe4ccc8eEA9eeBbC491en, signedTransactionBytes: hexToBytes('0x01f89f848404bf1f82028882237e819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33cc080a0775f29642af1045b40e5beae8e6bce2dc9e222023b7a50372be6824dbb7434fba05dacfff85752a0b9fd860bc751c17235a670d318a8b9494d664c1b87e33ac8dd') },
		{ name: '1559', signerAddress: 0x801040E2965D0cf9d73FEe4ccc8eEA9eeBbC491en, signedTransactionBytes: hexToBytes('0x02f8a5848404bf1f820288832c7e6384346d9246819d946eb893e3466931517a04a17d153a6330c3f2f1dd82c854b5889e365e59664fb881554ba1175519b5195b1d20390beb806d8f2cda7893e6f79848195dba4c905db6d7257ffb5eefea35f18ae33cc080a0f1003f96c6c6620dd46db36d2ae9f12d363947eb0db088c678b6ad1cf494aa6fa06085b5abbf448de5d622dc820da590cfdb6bb77b41c6650962b998a941f8d701') },
		// { name: '', signerAddress: 0x0n, signedTransactionBytes: hexToBytes('') },
	]
	for (const testCase of cases) {
		should(testCase.name, () => {
			const transaction = decodeTransaction(testCase.signedTransactionBytes)
			if (!isSigned(transaction)) throw new Error(`wat?`)
			const actualSigner = getSigner(transaction)
			assertEqual(bigintToHex(testCase.signerAddress), bigintToHex(actualSigner))
		})
	}
})
