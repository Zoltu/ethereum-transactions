import { RlpItem, rlpDecode, rlpEncode } from "@zoltu/rlp-encoder"
import { keccak_256 } from "@noble/hashes/sha3"
import { signAsync } from "@noble/secp256k1"
import { addressBigintToHex, bigintToHex, bytesToBigint, bytesToHex, hexToBigint, hexToBytes, encodeAddressForRlp, encodeHashForRlp, encodeNumberForRlp } from "./converters.js"
import { isArray } from "./typescript.js"

export type Transaction2930Unsigned = {
	readonly type: '2930'
	readonly chainId: bigint
	readonly nonce: bigint
	readonly gasPrice: bigint
	readonly gasLimit: bigint
	readonly to: bigint | null
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
	readonly to: string | null
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

export function isSigned2930(transaction: JsonTransaction2930): transaction is JsonTransaction2930Signed
export function isSigned2930(transaction: Transaction2930): transaction is Transaction2930Signed
export function isSigned2930(transaction: JsonTransaction2930 | Transaction2930): transaction is JsonTransaction2930Signed | Transaction2930Signed {
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

export async function sign2930(transaction: Transaction2930, privateKey: bigint): Promise<Transaction2930Signed> {
	if (isSigned2930(transaction)) return transaction
	const encoded = encodeTransaction2930(transaction)
	const hash = keccak_256(encoded)
	const signature = await signAsync(hash, privateKey.toString(16).padStart(64, '0'))
	return {
		type: '2930',
		chainId: transaction.chainId,
		nonce: transaction.nonce,
		gasPrice: transaction.gasPrice,
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

export function serializeTransaction2930(transaction: Transaction2930Unsigned): JsonTransaction2930Unsigned
export function serializeTransaction2930(transaction: Transaction2930Signed): JsonTransaction2930Signed
export function serializeTransaction2930(transaction: Transaction2930): JsonTransaction2930
export function serializeTransaction2930(transaction: Transaction2930): JsonTransaction2930 {
	return {
		type: '2930',
		chainId: bigintToHex(transaction.chainId),
		nonce: bigintToHex(transaction.nonce),
		gasPrice: bigintToHex(transaction.gasPrice),
		gasLimit: bigintToHex(transaction.gasLimit),
		to: transaction.to === null ? null : addressBigintToHex(transaction.to),
		value: bigintToHex(transaction.value),
		data: bytesToHex(transaction.data),
		accessList: transaction.accessList.map(([address, storageKeys]) => [addressBigintToHex(address), storageKeys.map(slot => bigintToHex(slot, 32))]),
		...isSigned2930(transaction) ? {
			yParity: bigintToHex(transaction.yParity),
			r: bigintToHex(transaction.r),
			s: bigintToHex(transaction.s),
		} : {}
	}
}

export function deserializeTransaction2930(transaction: JsonTransaction2930Unsigned): Transaction2930Unsigned
export function deserializeTransaction2930(transaction: JsonTransaction2930Signed): Transaction2930Signed
export function deserializeTransaction2930(transaction: JsonTransaction2930): Transaction2930
export function deserializeTransaction2930(transaction: JsonTransaction2930): Transaction2930 {
	return {
		type: '2930',
		chainId: hexToBigint(transaction.chainId),
		nonce: hexToBigint(transaction.nonce),
		gasPrice: hexToBigint(transaction.gasPrice),
		gasLimit: hexToBigint(transaction.gasLimit),
		to: transaction.to === null ? null : hexToBigint(transaction.to),
		value: hexToBigint(transaction.value),
		data: hexToBytes(transaction.data),
		accessList: transaction.accessList.map(x => [hexToBigint(x[0]), x[1].map(y => hexToBigint(y))]),
		...isSigned2930(transaction) ? {
			yParity: hexToBigint(transaction.yParity),
			r: hexToBigint(transaction.r),
			s: hexToBigint(transaction.s),
		} : {}
	}
}

export function encodeTransaction2930(transaction: Transaction2930): Uint8Array {
	const toEncode = [
		encodeNumberForRlp(transaction.chainId),
		encodeNumberForRlp(transaction.nonce),
		encodeNumberForRlp(transaction.gasPrice),
		encodeNumberForRlp(transaction.gasLimit),
		transaction.to !== null ? encodeAddressForRlp(transaction.to) : new Uint8Array(0),
		encodeNumberForRlp(transaction.value),
		transaction.data,
		transaction.accessList.map(([address, storageKeys]) => [encodeAddressForRlp(address), storageKeys.map(slot => encodeHashForRlp(slot))]),
		...isSigned2930(transaction) ? [
			encodeNumberForRlp(transaction.yParity),
			encodeNumberForRlp(transaction.r),
			encodeNumberForRlp(transaction.s),
		] : []
	]
	return new Uint8Array([1, ...rlpEncode(toEncode)])
}

type UnsignedShape = [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, [Uint8Array, Uint8Array[]][]]
type SignedShape = [...UnsignedShape, Uint8Array, Uint8Array, Uint8Array]
export function decodeTransaction2930(encoded: Uint8Array): Transaction2930 {
	function assertStructure(list: readonly RlpItem[]): asserts list is UnsignedShape | SignedShape {
		if (list.length !== 8 && list.length !== 11) throw new Error(`Expected an encoded 2930 transaction which is an RLP list of either 8 or 11 items but decoded a list of ${list.length} items.`)
		for (let i = 0; i < list.length; ++i) {
			if (i !== 7 && isArray(list[i])) throw new Error(`Expected an encoded 2930 transaction with a byte array in position ${i} but decoded a list.`)
			if (i === 7 && list[i] instanceof Uint8Array) throw new Error(`Expected an encoded 2930 transaction with an accessList in position 7 but decoded a byte array.`)
		}
	}
	function isSigned(list: UnsignedShape | SignedShape): list is SignedShape {
		return list.length === 11
	}
	const decoded = rlpDecode(encoded.slice(1))
	if (!isArray(decoded)) throw new Error(`Expected an encoded 2930 transaction which is an RLP list of items but got something that was just a single encoded item.`)
	assertStructure(decoded)
	return {
		type: '2930',
		chainId: bytesToBigint(decoded[0]),
		nonce: bytesToBigint(decoded[1]),
		gasPrice: bytesToBigint(decoded[2]),
		gasLimit: bytesToBigint(decoded[3]),
		to: (decoded[4].length === 0) ? null : bytesToBigint(decoded[4]),
		value: bytesToBigint(decoded[5]),
		data: decoded[6],
		accessList: decoded[7].map(tuple => [bytesToBigint(tuple[0]), tuple[1].map(storageKey => bytesToBigint(storageKey))]),
		...isSigned(decoded) ? {
			yParity: bytesToBigint(decoded[8]),
			r: bytesToBigint(decoded[9]),
			s: bytesToBigint(decoded[10]),
		} : {}
	}
}
