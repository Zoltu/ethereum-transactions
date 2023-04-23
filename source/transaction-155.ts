import { rlpEncode } from "@zoltu/rlp-encoder"
import { addressBigintToHex, bigintToBytes, bigintToHex, bytesToHex, hexToBigint, hexToBytes } from "./converters.js"

export type Transaction155Unsigned = {
	readonly type: '155'
	readonly chainId: bigint
	readonly nonce: bigint
	readonly gasPrice: bigint
	readonly gasLimit: bigint
	readonly to: bigint
	readonly value: bigint
	readonly data: Uint8Array
}
export type Transaction155Signed = Transaction155Unsigned & {
	readonly v: bigint
	readonly r: bigint
	readonly s: bigint
}
export type Transaction155 = Transaction155Unsigned | Transaction155Signed

export type JsonTransaction155Unsigned = {
	readonly type: '155'
	readonly chainId: string
	readonly nonce: string
	readonly gasPrice: string
	readonly gasLimit: string
	readonly to: string
	readonly value: string
	readonly data: string
}
export type JsonTransaction155Signed = JsonTransaction155Unsigned & {
	readonly v: string
	readonly r: string
	readonly s: string
}
export type JsonTransaction155 = JsonTransaction155Unsigned | JsonTransaction155Signed

export function serializeTransaction155(transaction: Transaction155Unsigned): JsonTransaction155Unsigned
export function serializeTransaction155(transaction: Transaction155Signed): JsonTransaction155Signed
export function serializeTransaction155(transaction: Transaction155): JsonTransaction155
export function serializeTransaction155(transaction: Transaction155): JsonTransaction155 {
	if ('v' in transaction && typeof transaction.v === 'bigint') {
		return {
			type: '155',
			chainId: bigintToHex(transaction.chainId),
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
			type: '155',
			chainId: bigintToHex(transaction.chainId),
			nonce: bigintToHex(transaction.nonce),
			gasPrice: bigintToHex(transaction.gasPrice),
			gasLimit: bigintToHex(transaction.gasLimit),
			to: addressBigintToHex(transaction.to),
			value: bigintToHex(transaction.value),
			data: bytesToHex(transaction.data),
		}
	}
}

export function deserializeTransaction155(transaction: JsonTransaction155Unsigned): Transaction155Unsigned
export function deserializeTransaction155(transaction: JsonTransaction155Signed): Transaction155Signed
export function deserializeTransaction155(transaction: JsonTransaction155): Transaction155
export function deserializeTransaction155(transaction: JsonTransaction155): Transaction155 {
	if ('v' in transaction && typeof transaction.v === 'string') {
		return {
			type: '155',
			chainId: hexToBigint(transaction.chainId),
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
			type: '155',
			chainId: hexToBigint(transaction.chainId),
			nonce: hexToBigint(transaction.nonce),
			gasPrice: hexToBigint(transaction.gasPrice),
			gasLimit: hexToBigint(transaction.gasLimit),
			to: hexToBigint(transaction.to),
			value: hexToBigint(transaction.value),
			data: hexToBytes(transaction.data),
		}
	}
}

export function encodeTransaction155(transaction: Transaction155): Uint8Array {
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
			bigintToBytes(transaction.chainId),
			bigintToBytes(0n),
			bigintToBytes(0n),
		]
	return rlpEncode(toEncode)
}
