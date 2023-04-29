import { describe, should } from 'micro-should'
import { testCases } from './ethers-transactions.js'
import { Transaction, Transaction1559Unsigned, Transaction155Unsigned, Transaction2930Unsigned, TransactionLegacyUnsigned, decodeTransaction, encodeTransaction, signTransaction } from '../transaction.js'
import { addressHexToBigint, hexToBigint, hexToBytes } from '../converters.js'
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
