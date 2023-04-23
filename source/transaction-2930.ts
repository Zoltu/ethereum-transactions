import { rlpEncode } from "@zoltu/rlp-encoder"
import { addressBigintToHex, bigintToBytes, bigintToHex, bytesToHex, hexToBigint, hexToBytes } from "./converters.js"

export type Transaction2930Unsigned = {
	readonly type: '2930'
	readonly chainId: bigint
	readonly nonce: bigint
	readonly gasPrice: bigint
	readonly gasLimit: bigint
	readonly to: bigint
	readonly value: bigint
	readonly data: Uint8Array
	readonly accessList: [bigint, bigint[]][]
}
export type Transaction2930Signed = Transaction2930Unsigned & {
	readonly yParity: bigint
	readonly r: bigint
	readonly s: bigint
}
export type Transaction2930 = Transaction2930Unsigned | Transaction2930Signed

export type JsonTransaction2930Unsigned = {
	readonly type: '2930'
	readonly chainId: string
	readonly nonce: string
	readonly gasPrice: string
	readonly gasLimit: string
	readonly to: string
	readonly value: string
	readonly data: string
	readonly accessList: [string, string[]][]
}
export type JsonTransaction2930Signed = JsonTransaction2930Unsigned & {
	readonly yParity: string
	readonly r: string
	readonly s: string
}
export type JsonTransaction2930 = JsonTransaction2930Unsigned | JsonTransaction2930Signed

export function serializeTransaction2930(transaction: Transaction2930Unsigned): JsonTransaction2930Unsigned
export function serializeTransaction2930(transaction: Transaction2930Signed): JsonTransaction2930Signed
export function serializeTransaction2930(transaction: Transaction2930): JsonTransaction2930
export function serializeTransaction2930(transaction: Transaction2930): JsonTransaction2930 {
	if ('yParity' in transaction && typeof transaction.yParity === 'bigint') {
		return {
			type: '2930',
			chainId: bigintToHex(transaction.chainId),
			nonce: bigintToHex(transaction.nonce),
			gasPrice: bigintToHex(transaction.gasPrice),
			gasLimit: bigintToHex(transaction.gasLimit),
			to: addressBigintToHex(transaction.to),
			value: bigintToHex(transaction.value),
			data: bytesToHex(transaction.data),
			accessList: transaction.accessList.map(x => [bigintToHex(x[0]), x[1].map(y => bigintToHex(y))]),
			yParity: bigintToHex(transaction.yParity),
			r: bigintToHex(transaction.r),
			s: bigintToHex(transaction.s),
		}
	} else {
		return {
			type: '2930',
			chainId: bigintToHex(transaction.chainId),
			nonce: bigintToHex(transaction.nonce),
			gasPrice: bigintToHex(transaction.gasPrice),
			gasLimit: bigintToHex(transaction.gasLimit),
			to: addressBigintToHex(transaction.to),
			value: bigintToHex(transaction.value),
			data: bytesToHex(transaction.data),
			accessList: transaction.accessList.map(x => [bigintToHex(x[0]), x[1].map(y => bigintToHex(y))]),
		}
	}
}

export function deserializeTransaction2930(transaction: JsonTransaction2930Unsigned): Transaction2930Unsigned
export function deserializeTransaction2930(transaction: JsonTransaction2930Signed): Transaction2930Signed
export function deserializeTransaction2930(transaction: JsonTransaction2930): Transaction2930
export function deserializeTransaction2930(transaction: JsonTransaction2930): Transaction2930 {
	if ('yParity' in transaction && typeof transaction.yParity === 'string') {
		return {
			type: '2930',
			chainId: hexToBigint(transaction.chainId),
			nonce: hexToBigint(transaction.nonce),
			gasPrice: hexToBigint(transaction.gasPrice),
			gasLimit: hexToBigint(transaction.gasLimit),
			to: hexToBigint(transaction.to),
			value: hexToBigint(transaction.value),
			data: hexToBytes(transaction.data),
			accessList: transaction.accessList.map(x => [hexToBigint(x[0]), x[1].map(y => hexToBigint(y))]),
			yParity: hexToBigint(transaction.yParity),
			r: hexToBigint(transaction.r),
			s: hexToBigint(transaction.s),
		}
	} else {
		return {
			type: '2930',
			chainId: hexToBigint(transaction.chainId),
			nonce: hexToBigint(transaction.nonce),
			gasPrice: hexToBigint(transaction.gasPrice),
			gasLimit: hexToBigint(transaction.gasLimit),
			to: hexToBigint(transaction.to),
			value: hexToBigint(transaction.value),
			data: hexToBytes(transaction.data),
			accessList: transaction.accessList.map(x => [hexToBigint(x[0]), x[1].map(y => hexToBigint(y))]),
		}
	}
}

export function encodeTransaction2930(transaction: Transaction2930): Uint8Array {
	const toEncode = ('yParity' in transaction && typeof transaction.yParity === 'bigint')
		? [
			bigintToBytes(transaction.chainId),
			bigintToBytes(transaction.nonce),
			bigintToBytes(transaction.gasPrice),
			bigintToBytes(transaction.gasLimit),
			transaction.to !== null ? bigintToBytes(transaction.to, 20) : new Uint8Array(0),
			bigintToBytes(transaction.value),
			transaction.data,
			transaction.accessList.map(([address, storageKeys]) => [bigintToBytes(address, 20), storageKeys.map(slot => bigintToBytes(slot, 32))]),
			bigintToBytes(transaction.yParity),
			bigintToBytes(transaction.r),
			bigintToBytes(transaction.s),
		]
		: [
			bigintToBytes(transaction.chainId),
			bigintToBytes(transaction.nonce),
			bigintToBytes(transaction.gasPrice),
			bigintToBytes(transaction.gasLimit),
			transaction.to !== null ? bigintToBytes(transaction.to, 20) : new Uint8Array(0),
			bigintToBytes(transaction.value),
			transaction.data,
			transaction.accessList.map(([address, storageKeys]) => [bigintToBytes(address, 20), storageKeys.map(slot => bigintToBytes(slot, 32))]),
		]
	return new Uint8Array([1, ...rlpEncode(toEncode)])
}
