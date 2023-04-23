import { rlpEncode } from "@zoltu/rlp-encoder"
import { addressBigintToHex, bigintToBytes, bigintToHex, bytesToHex, hexToBigint, hexToBytes } from "./converters.js"

export type Transaction1559Unsigned = {
	readonly type: '1559'
	readonly chainId: bigint
	readonly nonce: bigint
	readonly maxPriorityFeePerGas: bigint
	readonly maxFeePerGas: bigint
	readonly gasLimit: bigint
	readonly to: bigint
	readonly value: bigint
	readonly data: Uint8Array
	readonly accessList: [bigint, bigint[]][]
}
export type Transaction1559Signed = Transaction1559Unsigned & {
	readonly yParity: bigint
	readonly r: bigint
	readonly s: bigint
}
export type Transaction1559 = Transaction1559Unsigned | Transaction1559Signed

export type JsonTransaction1559Unsigned = {
	readonly type: '1559'
	readonly chainId: string
	readonly nonce: string
	readonly maxPriorityFeePerGas: string
	readonly maxFeePerGas: string
	readonly gasLimit: string
	readonly to: string
	readonly value: string
	readonly data: string
	readonly accessList: [string, string[]][]
}
export type JsonTransaction1559Signed = JsonTransaction1559Unsigned & {
	readonly yParity: string
	readonly r: string
	readonly s: string
}
export type JsonTransaction1559 = JsonTransaction1559Unsigned | JsonTransaction1559Signed

export function serializeTransaction1559(transaction: Transaction1559Unsigned): JsonTransaction1559Unsigned
export function serializeTransaction1559(transaction: Transaction1559Signed): JsonTransaction1559Signed
export function serializeTransaction1559(transaction: Transaction1559): JsonTransaction1559
export function serializeTransaction1559(transaction: Transaction1559): JsonTransaction1559 {
	if ('yParity' in transaction && typeof transaction.yParity === 'bigint') {
		return {
			type: '1559',
			chainId: bigintToHex(transaction.chainId),
			nonce: bigintToHex(transaction.nonce),
			maxPriorityFeePerGas: bigintToHex(transaction.maxPriorityFeePerGas),
			maxFeePerGas: bigintToHex(transaction.maxFeePerGas),
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
			type: '1559',
			chainId: bigintToHex(transaction.chainId),
			nonce: bigintToHex(transaction.nonce),
			maxPriorityFeePerGas: bigintToHex(transaction.maxPriorityFeePerGas),
			maxFeePerGas: bigintToHex(transaction.maxFeePerGas),
			gasLimit: bigintToHex(transaction.gasLimit),
			to: addressBigintToHex(transaction.to),
			value: bigintToHex(transaction.value),
			data: bytesToHex(transaction.data),
			accessList: transaction.accessList.map(x => [bigintToHex(x[0]), x[1].map(y => bigintToHex(y))])
		}
	}
}

export function deserializeTransaction1559(transaction: JsonTransaction1559Unsigned): Transaction1559Unsigned
export function deserializeTransaction1559(transaction: JsonTransaction1559Signed): Transaction1559Signed
export function deserializeTransaction1559(transaction: JsonTransaction1559): Transaction1559
export function deserializeTransaction1559(transaction: JsonTransaction1559): Transaction1559 {
	if ('yParity' in transaction && typeof transaction.yParity === 'string') {
		return {
			type: '1559',
			chainId: hexToBigint(transaction.chainId),
			nonce: hexToBigint(transaction.nonce),
			maxPriorityFeePerGas: hexToBigint(transaction.maxPriorityFeePerGas),
			maxFeePerGas: hexToBigint(transaction.maxFeePerGas),
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
			type: '1559',
			chainId: hexToBigint(transaction.chainId),
			nonce: hexToBigint(transaction.nonce),
			maxPriorityFeePerGas: hexToBigint(transaction.maxPriorityFeePerGas),
			maxFeePerGas: hexToBigint(transaction.maxFeePerGas),
			gasLimit: hexToBigint(transaction.gasLimit),
			to: hexToBigint(transaction.to),
			value: hexToBigint(transaction.value),
			data: hexToBytes(transaction.data),
			accessList: transaction.accessList.map(x => [hexToBigint(x[0]), x[1].map(y => hexToBigint(y))]),
		}
	}
}

export function encodeTransaction1559(transaction: Transaction1559): Uint8Array {
	const toEncode = ('yParity' in transaction && typeof transaction.yParity === 'bigint')
		? [
			bigintToBytes(transaction.chainId),
			bigintToBytes(transaction.nonce),
			bigintToBytes(transaction.maxPriorityFeePerGas),
			bigintToBytes(transaction.maxFeePerGas),
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
			bigintToBytes(transaction.maxPriorityFeePerGas),
			bigintToBytes(transaction.maxFeePerGas),
			bigintToBytes(transaction.gasLimit),
			transaction.to !== null ? bigintToBytes(transaction.to, 20) : new Uint8Array(0),
			bigintToBytes(transaction.value),
			transaction.data,
			transaction.accessList.map(([address, storageKeys]) => [bigintToBytes(address, 20), storageKeys.map(slot => bigintToBytes(slot, 32))]),
		]
	return new Uint8Array([2, ...rlpEncode(toEncode)])
}
