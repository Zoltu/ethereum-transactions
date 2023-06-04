import { RlpItem, rlpDecode, rlpEncode } from "@zoltu/rlp-encoder"
import { keccak_256 } from "@noble/hashes/sha3"
import { signAsync } from "@noble/secp256k1"
import { addressBigintToHex, bigintToHex, bytesToBigint, bytesToHex, hexToBigint, hexToBytes, encodeAddressForRlp, encodeHashForRlp, encodeNumberForRlp } from "./converters.js"
import { isArray } from "./typescript.js"

export type Transaction1559Unsigned = {
	readonly type: '1559'
	readonly chainId: bigint
	readonly nonce: bigint
	readonly maxPriorityFeePerGas: bigint
	readonly maxFeePerGas: bigint
	readonly gasLimit: bigint
	readonly to: bigint | null
	readonly value: bigint
	readonly data: Uint8Array
	readonly accessList: readonly (readonly [bigint, readonly bigint[]])[]
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
	readonly to: string | null
	readonly value: string
	readonly data: string
	readonly accessList: readonly (readonly [string, readonly string[]])[]
}
export type JsonTransaction1559Signed = JsonTransaction1559Unsigned & {
	readonly yParity: string
	readonly r: string
	readonly s: string
}
export type JsonTransaction1559 = JsonTransaction1559Unsigned | JsonTransaction1559Signed

export function isSigned1559(transaction: JsonTransaction1559): transaction is JsonTransaction1559Signed
export function isSigned1559(transaction: Transaction1559): transaction is Transaction1559Signed
export function isSigned1559(transaction: JsonTransaction1559 | Transaction1559): transaction is JsonTransaction1559Signed | Transaction1559Signed {
	if (!('yParity' in transaction)) return false
	if (!('r' in transaction)) return false
	if (!('s' in transaction)) return false
	if (typeof transaction.yParity === 'string') {
		if (typeof transaction.r !== 'string') return false
		if (typeof transaction.s !== 'string') return false
		return true
	} else if (typeof transaction.yParity === 'bigint') {
		if (typeof transaction.r !== 'bigint') return false
		if (typeof transaction.s !== 'bigint') return false
		return true
	} else {
		return false
	}
}

export async function sign1559(transaction: Transaction1559, privateKey: bigint): Promise<Transaction1559Signed> {
	if (isSigned1559(transaction)) return transaction
	const encoded = encodeTransaction1559(transaction)
	const hash = keccak_256(encoded)
	const signature = await signAsync(hash, privateKey.toString(16).padStart(64, '0'))
	return {
		type: '1559',
		chainId: transaction.chainId,
		nonce: transaction.nonce,
		maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
		maxFeePerGas: transaction.maxFeePerGas,
		gasLimit: transaction.gasLimit,
		to: transaction.to,
		value: transaction.value,
		data: transaction.data,
		accessList: transaction.accessList,
		// not null assertion necessary until https://github.com/paulmillr/noble-secp256k1/pull/101 is merged
		yParity: BigInt(signature.recovery!),
		r: signature.r,
		s: signature.s,
	}
}

export function serializeTransaction1559(transaction: Transaction1559Unsigned): JsonTransaction1559Unsigned
export function serializeTransaction1559(transaction: Transaction1559Signed): JsonTransaction1559Signed
export function serializeTransaction1559(transaction: Transaction1559): JsonTransaction1559
export function serializeTransaction1559(transaction: Transaction1559): JsonTransaction1559 {
	return {
		type: '1559',
		chainId: bigintToHex(transaction.chainId),
		nonce: bigintToHex(transaction.nonce),
		maxPriorityFeePerGas: bigintToHex(transaction.maxPriorityFeePerGas),
		maxFeePerGas: bigintToHex(transaction.maxFeePerGas),
		gasLimit: bigintToHex(transaction.gasLimit),
		to: transaction.to === null ? null : addressBigintToHex(transaction.to),
		value: bigintToHex(transaction.value),
		data: bytesToHex(transaction.data),
		accessList: transaction.accessList.map(([address, storageKeys]) => [addressBigintToHex(address), storageKeys.map(slot => bigintToHex(slot, 32))]),
		...isSigned1559(transaction) ? {
			yParity: bigintToHex(transaction.yParity),
			r: bigintToHex(transaction.r),
			s: bigintToHex(transaction.s),
		} : {}
	}
}

export function deserializeTransaction1559(transaction: JsonTransaction1559Unsigned): Transaction1559Unsigned
export function deserializeTransaction1559(transaction: JsonTransaction1559Signed): Transaction1559Signed
export function deserializeTransaction1559(transaction: JsonTransaction1559): Transaction1559
export function deserializeTransaction1559(transaction: JsonTransaction1559): Transaction1559 {
	return {
		type: '1559',
		chainId: hexToBigint(transaction.chainId),
		nonce: hexToBigint(transaction.nonce),
		maxPriorityFeePerGas: hexToBigint(transaction.maxPriorityFeePerGas),
		maxFeePerGas: hexToBigint(transaction.maxFeePerGas),
		gasLimit: hexToBigint(transaction.gasLimit),
		to: transaction.to === null ? null : hexToBigint(transaction.to),
		value: hexToBigint(transaction.value),
		data: hexToBytes(transaction.data),
		accessList: transaction.accessList.map(x => [hexToBigint(x[0]), x[1].map(y => hexToBigint(y))]),
		...isSigned1559(transaction) ? {
			yParity: hexToBigint(transaction.yParity),
			r: hexToBigint(transaction.r),
			s: hexToBigint(transaction.s),
		} : {}
	}
}

export function encodeTransaction1559(transaction: Transaction1559): Uint8Array {
	const toEncode = [
		encodeNumberForRlp(transaction.chainId),
		encodeNumberForRlp(transaction.nonce),
		encodeNumberForRlp(transaction.maxPriorityFeePerGas),
		encodeNumberForRlp(transaction.maxFeePerGas),
		encodeNumberForRlp(transaction.gasLimit),
		transaction.to !== null ? encodeAddressForRlp(transaction.to) : new Uint8Array(0),
		encodeNumberForRlp(transaction.value),
		transaction.data,
		transaction.accessList.map(([address, storageKeys]) => [encodeAddressForRlp(address), storageKeys.map(slot => encodeHashForRlp(slot))]),
		...isSigned1559(transaction) ? [
			encodeNumberForRlp(transaction.yParity),
			encodeNumberForRlp(transaction.r),
			encodeNumberForRlp(transaction.s),
		] : []
	]
	return new Uint8Array([2, ...rlpEncode(toEncode)])
}

type UnsignedShape = [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, [Uint8Array, Uint8Array[]][]]
type SignedShape = [...UnsignedShape, Uint8Array, Uint8Array, Uint8Array]
export function decodeTransaction1559(encoded: Uint8Array): Transaction1559 {
	function assertStructure(list: readonly RlpItem[]): asserts list is UnsignedShape | SignedShape {
		if (list.length !== 9 && list.length !== 12) throw new Error(`Expected an encoded 1559 transaction which is an RLP list of either 9 or 12 items but decoded a list of ${list.length} items.`)
		for (let i = 0; i < list.length; ++i) {
			if (i !== 8 && isArray(list[i])) throw new Error(`Expected an encoded 1559 transaction with a byte array in position ${i} but decoded a list.`)
			if (i === 8 && list[i] instanceof Uint8Array) throw new Error(`Expected an encoded 1559 transaction with an accessList in position ${i} but decoded a byte array.`)
		}
	}
	function isSigned(list: UnsignedShape | SignedShape): list is SignedShape {
		return list.length === 12
	}

	const decoded = rlpDecode(encoded.slice(1))
	if (!isArray(decoded)) throw new Error(`Expected an encoded 1559 transaction which is an RLP list of items but got something that was just a single encoded item.`)
	assertStructure(decoded)
	return {
		type: '1559',
		chainId: bytesToBigint(decoded[0]),
		nonce: bytesToBigint(decoded[1]),
		maxPriorityFeePerGas: bytesToBigint(decoded[2]),
		maxFeePerGas: bytesToBigint(decoded[3]),
		gasLimit: bytesToBigint(decoded[4]),
		to: (decoded[5].length === 0) ? null : bytesToBigint(decoded[5]),
		value: bytesToBigint(decoded[6]),
		data: decoded[7],
		accessList: decoded[8].map(tuple => [bytesToBigint(tuple[0]), tuple[1].map(storageKey => bytesToBigint(storageKey))]),
		...isSigned(decoded) ? {
			yParity: bytesToBigint(decoded[9]),
			r: bytesToBigint(decoded[10]),
			s: bytesToBigint(decoded[11]),
		} : {}
	}
}
