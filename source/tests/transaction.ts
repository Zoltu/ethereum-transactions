import { describe, should } from 'micro-should'
import { testCases as ethersTestCases } from './ethers-transactions.js'
import { testCases as ethers1559TestCases } from './ethers-eip1559.js'
import { Transaction1559Unsigned, Transaction155Unsigned, Transaction2930Unsigned, TransactionLegacyUnsigned, decodeTransaction, encodeTransaction } from '../transaction.js'
import { addressHexToBigint, hexToBigint, hexToBytes } from '../converters.js'
import { assertEqual } from './utils.js'

describe('encode', () => {
	describe('legacy', () => {
		describe('unsigned', () => {
			for (const testCase of ethersTestCases) {
				should(testCase.name, () => {
					const transaction: TransactionLegacyUnsigned = {
						type: 'legacy',
						to: testCase.to !== undefined ? BigInt(testCase.to) : null,
						data: hexToBytes(testCase.data ?? '0x'),
						gasLimit: hexToBigint(testCase.gasLimit ?? '0x0'),
						gasPrice: hexToBigint(testCase.gasPrice ?? '0x0'),
						nonce: hexToBigint(testCase.nonce ?? '0x0'),
						value: hexToBigint(testCase.value ?? '0x0'),
					}
					const expectedRlpBytes = hexToBytes(testCase.unsignedTransaction)
					const actualRlpBytes = encodeTransaction(transaction)
					assertEqual(expectedRlpBytes, actualRlpBytes)
				})
			}
		})
	})
	describe('155', () => {
		describe('unsigned', () => {
			for (const testCase of ethersTestCases) {
				should(testCase.name, () => {
					const transaction: Transaction155Unsigned = {
						type: '155',
						chainId: 5n,
						to: testCase.to !== undefined ? BigInt(testCase.to) : null,
						data: hexToBytes(testCase.data ?? '0x'),
						gasLimit: hexToBigint(testCase.gasLimit ?? '0x0'),
						gasPrice: hexToBigint(testCase.gasPrice ?? '0x0'),
						nonce: hexToBigint(testCase.nonce ?? '0x0'),
						value: hexToBigint(testCase.value ?? '0x0'),
					}
					const expectedRlpBytes = hexToBytes(testCase.unsignedTransactionChainId5)
					const actualRlpBytes = encodeTransaction(transaction)
					assertEqual(expectedRlpBytes, actualRlpBytes)
				})
			}
		})
	})
	describe('2930', () => {
		describe('unsigned', () => {
			for (const testCase of ethers1559TestCases) {
				const testCaseTransaction = testCase.tx
				if (testCaseTransaction.type !== 1) continue
				should(testCase.name, () => {
					const transaction: Transaction2930Unsigned = {
						type: '2930',
						chainId: BigInt(testCaseTransaction.chainId ?? 0),
						nonce: BigInt(testCaseTransaction.nonce ?? 0),
						gasPrice: hexToBigint(testCaseTransaction.gasPrice ?? '0x0'),
						gasLimit: hexToBigint(testCaseTransaction.gasLimit ?? '0x0'),
						to: testCaseTransaction.to === undefined ? null : addressHexToBigint(testCaseTransaction.to),
						value: hexToBigint(testCaseTransaction.value ?? '0x0'),
						data: hexToBytes(testCaseTransaction.data ?? '0x'),
						accessList: (testCaseTransaction.accessList ?? []).map(tuple => [addressHexToBigint(tuple.address), tuple.storageKeys.map(hexToBigint)]),
					}
					const expectedRlpBytes = hexToBytes(testCase.unsigned)
					const actualRlpBytes = encodeTransaction(transaction)
					assertEqual(expectedRlpBytes, actualRlpBytes)
				})
			}
		})			
	})
	describe('1559', () => {
		describe('unsigned', () => {
			for (const testCase of ethers1559TestCases) {
				const testCaseTransaction = testCase.tx
				if (testCaseTransaction.type !== 2) continue
				should(testCase.name, () => {
					const transaction: Transaction1559Unsigned = {
						type: '1559',
						chainId: BigInt(testCaseTransaction.chainId ?? 0),
						nonce: BigInt(testCaseTransaction.nonce ?? 0),
						maxPriorityFeePerGas: hexToBigint(testCaseTransaction.maxPriorityFeePerGas ?? '0x0'),
						maxFeePerGas: hexToBigint(testCaseTransaction.maxFeePerGas ?? '0x0'),
						gasLimit: hexToBigint(testCaseTransaction.gasLimit ?? '0x0'),
						to: testCaseTransaction.to === undefined ? null : addressHexToBigint(testCaseTransaction.to),
						value: hexToBigint(testCaseTransaction.value ?? '0x0'),
						data: hexToBytes(testCaseTransaction.data ?? '0x'),
						accessList: (testCaseTransaction.accessList ?? []).map(tuple => [addressHexToBigint(tuple.address), tuple.storageKeys.map(hexToBigint)]),
					}
					const expectedRlpBytes = hexToBytes(testCase.unsigned)
					const actualRlpBytes = encodeTransaction(transaction)
					assertEqual(expectedRlpBytes, actualRlpBytes)
				})
			}
		})			
	})
})
describe('decode', () => {
	describe('legacy', () => {
		describe('unsigned', () => {
			for (const testCase of ethersTestCases) {
				should(testCase.name, () => {
					const expectedTransaction: TransactionLegacyUnsigned = {
						type: 'legacy',
						to: testCase.to !== undefined ? BigInt(testCase.to) : null,
						data: hexToBytes(testCase.data ?? '0x'),
						gasLimit: hexToBigint(testCase.gasLimit ?? '0x0'),
						gasPrice: hexToBigint(testCase.gasPrice ?? '0x0'),
						nonce: hexToBigint(testCase.nonce ?? '0x0'),
						value: hexToBigint(testCase.value ?? '0x0'),
					}
					const actualTransaction = decodeTransaction(hexToBytes(testCase.unsignedTransaction))
					assertEqual(expectedTransaction, actualTransaction)
				})
			}
		})
	})
	describe('155', () => {
		describe('unsigned', () => {
			for (const testCase of ethersTestCases) {
				should(testCase.name, () => {
					const expectedTransaction: Transaction155Unsigned = {
						type: '155',
						chainId: 5n,
						to: testCase.to !== undefined ? BigInt(testCase.to) : null,
						data: hexToBytes(testCase.data ?? '0x'),
						gasLimit: hexToBigint(testCase.gasLimit ?? '0x0'),
						gasPrice: hexToBigint(testCase.gasPrice ?? '0x0'),
						nonce: hexToBigint(testCase.nonce ?? '0x0'),
						value: hexToBigint(testCase.value ?? '0x0'),
					}
					const actualTransaction = decodeTransaction(hexToBytes(testCase.unsignedTransactionChainId5))
					assertEqual(expectedTransaction, actualTransaction)
				})
			}
		})
	})
	describe('2930', () => {
		describe('unsigned', () => {
			for (const testCase of ethers1559TestCases) {
				const testCaseTransaction = testCase.tx
				if (testCaseTransaction.type !== 1) continue
				should(testCase.name, () => {
					const expectedTransaction: Transaction2930Unsigned = {
						type: '2930',
						chainId: BigInt(testCaseTransaction.chainId ?? 0),
						nonce: BigInt(testCaseTransaction.nonce ?? 0),
						gasPrice: hexToBigint(testCaseTransaction.gasPrice ?? '0x0'),
						gasLimit: hexToBigint(testCaseTransaction.gasLimit ?? '0x0'),
						to: testCaseTransaction.to === undefined ? null : addressHexToBigint(testCaseTransaction.to),
						value: hexToBigint(testCaseTransaction.value ?? '0x0'),
						data: hexToBytes(testCaseTransaction.data ?? '0x'),
						accessList: (testCaseTransaction.accessList ?? []).map(tuple => [addressHexToBigint(tuple.address), tuple.storageKeys.map(hexToBigint)]),
					}
					const actualTransaction = decodeTransaction(hexToBytes(testCase.unsigned))
					assertEqual(expectedTransaction, actualTransaction)
				})
			}
		})
	})
	describe('1559', () => {
		describe('unsigned', () => {
			for (const testCase of ethers1559TestCases) {
				const testCaseTransaction = testCase.tx
				if (testCaseTransaction.type !== 2) continue
				should(testCase.name, () => {
					const expectedTransaction: Transaction1559Unsigned = {
						type: '1559',
						chainId: BigInt(testCaseTransaction.chainId ?? 0),
						nonce: BigInt(testCaseTransaction.nonce ?? 0),
						maxPriorityFeePerGas: hexToBigint(testCaseTransaction.maxPriorityFeePerGas ?? '0x0'),
						maxFeePerGas: hexToBigint(testCaseTransaction.maxFeePerGas ?? '0x0'),
						gasLimit: hexToBigint(testCaseTransaction.gasLimit ?? '0x0'),
						to: testCaseTransaction.to === undefined ? null : addressHexToBigint(testCaseTransaction.to),
						value: hexToBigint(testCaseTransaction.value ?? '0x0'),
						data: hexToBytes(testCaseTransaction.data ?? '0x'),
						accessList: (testCaseTransaction.accessList ?? []).map(tuple => [addressHexToBigint(tuple.address), tuple.storageKeys.map(hexToBigint)]),
					}
					const actualTransaction = decodeTransaction(hexToBytes(testCase.unsigned))
					assertEqual(expectedTransaction, actualTransaction)
				})
			}
		})
	})
})
