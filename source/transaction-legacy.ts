import { rlpEncode } from "@zoltu/rlp-encoder"
import { addressBigintToHex, bigintToBytes, bigintToHex, bytesToHex, hexToBigint, hexToBytes } from "./converters.js"

export type TransactionLegacyUnsigned = {
	readonly type: 'legacy'
	readonly nonce: bigint
	readonly gasPrice: bigint
	readonly gasLimit: bigint
	readonly to: bigint
	readonly value: bigint
	readonly data: Uint8Array
}
export type TransactionLegacySigned = TransactionLegacyUnsigned & {
	readonly v: bigint
	readonly r: bigint
	readonly s: bigint
}
export type TransactionLegacy = TransactionLegacyUnsigned | TransactionLegacySigned

export type JsonTransactionLegacyUnsigned = {
	readonly type: 'legacy'
	readonly nonce: string
	readonly gasPrice: string
	readonly gasLimit: string
	readonly to: string
	readonly value: string
	readonly data: string
}
export type JsonTransactionLegacySigned = JsonTransactionLegacyUnsigned & {
	readonly v: string
	readonly r: string
	readonly s: string
}
export type JsonTransactionLegacy = JsonTransactionLegacyUnsigned | JsonTransactionLegacySigned

export function serializeTransactionLegacy(transaction: TransactionLegacyUnsigned): JsonTransactionLegacyUnsigned
export function serializeTransactionLegacy(transaction: TransactionLegacySigned): JsonTransactionLegacySigned
export function serializeTransactionLegacy(transaction: TransactionLegacy): JsonTransactionLegacy
export function serializeTransactionLegacy(transaction: TransactionLegacy): JsonTransactionLegacy {
	if ('v' in transaction && typeof transaction.v === 'bigint') {
		return {
			type: 'legacy',
			nonce: bigintToHex(transaction.nonce),
			gasPrice: bigintToHex(transaction.gasPrice),
			gasLimit: bigintToHex(transaction.gasLimit),
			to: addressBigintToHex(transaction.to),
			value: bigintToHex(transaction.value),
			data: bytesToHex(transaction.data),
			v: bigintToHex(transaction.v),
			r: bigintToHex(transaction.r),
			s: bigintToHex(transaction.s),
		}
	} else {
		return {
			type: 'legacy',
			nonce: bigintToHex(transaction.nonce),
			gasPrice: bigintToHex(transaction.gasPrice),
			gasLimit: bigintToHex(transaction.gasLimit),
			to: addressBigintToHex(transaction.to),
			value: bigintToHex(transaction.value),
			data: bytesToHex(transaction.data),
		}
	}
}

export function deserializeTransactionLegacy(transaction: JsonTransactionLegacyUnsigned): TransactionLegacyUnsigned
export function deserializeTransactionLegacy(transaction: JsonTransactionLegacySigned): TransactionLegacySigned
export function deserializeTransactionLegacy(transaction: JsonTransactionLegacy): TransactionLegacy
export function deserializeTransactionLegacy(transaction: JsonTransactionLegacy): TransactionLegacy {
	if ('v' in transaction && typeof transaction.v === 'string') {
		return {
			type: 'legacy',
			nonce: hexToBigint(transaction.nonce),
			gasPrice: hexToBigint(transaction.gasPrice),
			gasLimit: hexToBigint(transaction.gasLimit),
			to: hexToBigint(transaction.to),
			value: hexToBigint(transaction.value),
			data: hexToBytes(transaction.data),
			v: hexToBigint(transaction.v),
			r: hexToBigint(transaction.r),
			s: hexToBigint(transaction.s),
		}
	} else {
		return {
			type: 'legacy',
			nonce: hexToBigint(transaction.nonce),
			gasPrice: hexToBigint(transaction.gasPrice),
			gasLimit: hexToBigint(transaction.gasLimit),
			to: hexToBigint(transaction.to),
			value: hexToBigint(transaction.value),
			data: hexToBytes(transaction.data),
		}
	}
}

export function encodeTransactionLegacy(transaction: TransactionLegacy): Uint8Array {
	const toEncode = ('v' in transaction && typeof transaction.v === 'bigint')
		? [
			bigintToBytes(transaction.nonce),
			bigintToBytes(transaction.gasPrice),
			bigintToBytes(transaction.gasLimit),
			transaction.to !== null ? bigintToBytes(transaction.to, 20) : new Uint8Array(0),
			bigintToBytes(transaction.value),
			transaction.data,
			bigintToBytes(transaction.v),
			bigintToBytes(transaction.r),
			bigintToBytes(transaction.s),
		]
		: [
			bigintToBytes(transaction.nonce),
			bigintToBytes(transaction.gasPrice),
			bigintToBytes(transaction.gasLimit),
			transaction.to !== null ? bigintToBytes(transaction.to, 20) : new Uint8Array(0),
			bigintToBytes(transaction.value),
			transaction.data,
		]
	return rlpEncode(toEncode)
}
