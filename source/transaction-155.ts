import { RlpItem, rlpDecode, rlpEncode } from "@zoltu/rlp-encoder"
import { keccak_256 } from "@noble/hashes/sha3"
import { signAsync } from "@noble/secp256k1"
import { addressBigintToHex, bigintToHex, bytesToBigint, bytesToHex, hexToBigint, hexToBytes } from "./converters.js"
import { isArray } from "./typescript.js"
import { encodeAddressForRlp, encodeNumberForRlp } from "./transaction.js"

export type Transaction155Unsigned = {
	readonly type: '155'
	readonly chainId: bigint
	readonly nonce: bigint
	readonly gasPrice: bigint
	readonly gasLimit: bigint
	readonly to: bigint | null
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
	readonly to: string | null
	readonly value: string
	readonly data: string
}
export type JsonTransaction155Signed = JsonTransaction155Unsigned & {
	readonly v: string
	readonly r: string
	readonly s: string
}
export type JsonTransaction155 = JsonTransaction155Unsigned | JsonTransaction155Signed

export function isSigned155(transaction: JsonTransaction155): transaction is JsonTransaction155Signed
export function isSigned155(transaction: Transaction155): transaction is Transaction155Signed
export function isSigned155(transaction: JsonTransaction155 | Transaction155): transaction is JsonTransaction155Signed | Transaction155Signed {
	if (!('v' in transaction)) return false
	if (!('r' in transaction)) return false
	if (!('s' in transaction)) return false
	if (typeof transaction.v === 'string') {
		if (typeof transaction.r !== 'string') return false
		if (typeof transaction.s !== 'string') return false
		return true
	} else if (typeof transaction.v === 'bigint') {
		if (typeof transaction.r !== 'bigint') return false
		if (typeof transaction.s !== 'bigint') return false
		return true
	} else {
		return false
	}
}

export async function sign155(transaction: Transaction155, privateKey: bigint): Promise<Transaction155Signed> {
	if (isSigned155(transaction)) return transaction
	const encoded = encodeTransaction155(transaction)
	const hash = keccak_256(encoded)
	const signature = await signAsync(hash, privateKey.toString(16).padStart(64, '0'))
	return {
		type: '155',
		nonce: transaction.nonce,
		gasPrice: transaction.gasPrice,
		gasLimit: transaction.gasLimit,
		to: transaction.to,
		value: transaction.value,
		data: transaction.data,
		chainId: transaction.chainId,
		// not null assertion necessary until https://github.com/paulmillr/noble-secp256k1/pull/101 is merged
		v: BigInt(signature.recovery!) + 35n + 2n * transaction.chainId,
		r: signature.r,
		s: signature.s,
	}
}

export function serializeTransaction155(transaction: Transaction155Unsigned): JsonTransaction155Unsigned
export function serializeTransaction155(transaction: Transaction155Signed): JsonTransaction155Signed
export function serializeTransaction155(transaction: Transaction155): JsonTransaction155
export function serializeTransaction155(transaction: Transaction155): JsonTransaction155 {
	return {
		type: '155',
		chainId: bigintToHex(transaction.chainId),
		nonce: bigintToHex(transaction.nonce),
		gasPrice: bigintToHex(transaction.gasPrice),
		gasLimit: bigintToHex(transaction.gasLimit),
		to: transaction.to === null ? null : addressBigintToHex(transaction.to),
		value: bigintToHex(transaction.value),
		data: bytesToHex(transaction.data),
		...isSigned155(transaction) ? {
			v: bigintToHex(transaction.v),
			r: bigintToHex(transaction.r),
			s: bigintToHex(transaction.s),
		} : {}
	}
}

export function deserializeTransaction155(transaction: JsonTransaction155Unsigned): Transaction155Unsigned
export function deserializeTransaction155(transaction: JsonTransaction155Signed): Transaction155Signed
export function deserializeTransaction155(transaction: JsonTransaction155): Transaction155
export function deserializeTransaction155(transaction: JsonTransaction155): Transaction155 {
	return {
		type: '155',
		chainId: hexToBigint(transaction.chainId),
		nonce: hexToBigint(transaction.nonce),
		gasPrice: hexToBigint(transaction.gasPrice),
		gasLimit: hexToBigint(transaction.gasLimit),
		to: transaction.to === null ? null : hexToBigint(transaction.to),
		value: hexToBigint(transaction.value),
		data: hexToBytes(transaction.data),
		...isSigned155(transaction) ? {
			v: hexToBigint(transaction.v),
			r: hexToBigint(transaction.r),
			s: hexToBigint(transaction.s),
		} : {}
	}
}

export function encodeTransaction155(transaction: Transaction155): Uint8Array {
	const toEncode = [
		encodeNumberForRlp(transaction.nonce),
		encodeNumberForRlp(transaction.gasPrice),
		encodeNumberForRlp(transaction.gasLimit),
		transaction.to !== null ? encodeAddressForRlp(transaction.to) : new Uint8Array(0),
		encodeNumberForRlp(transaction.value),
		transaction.data,
		...isSigned155(transaction) ? [
			encodeNumberForRlp(transaction.v),
			encodeNumberForRlp(transaction.r),
			encodeNumberForRlp(transaction.s),
		] : [
			encodeNumberForRlp(transaction.chainId),
			encodeNumberForRlp(0n),
			encodeNumberForRlp(0n),
		]
	]
	return rlpEncode(toEncode)
}

type UnsignedShape = [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array]
type SignedShape = UnsignedShape
export function decodeTransaction155(encoded: Uint8Array): Transaction155 {
	function assertStructure(list: readonly RlpItem[]): asserts list is UnsignedShape | SignedShape {
		if (list.length !== 9) throw new Error(`Expected an encoded 155 transaction which is an RLP list of 9 items but decoded a list of ${list.length} items.`)
		list.forEach((item, index) => { if (isArray(item)) throw new Error(`Expected an encoded 155 transaction with a byte array in position ${index} but decoded a list.`) })
	}
	const decoded = rlpDecode(encoded)
	if (!isArray(decoded)) throw new Error(`Expected an encoded 155 transaction which is an RLP list of items but got something that was just a single encoded item.`)
	assertStructure(decoded)
	const v = bytesToBigint(decoded[6])
	const r = bytesToBigint(decoded[7])
	const s = bytesToBigint(decoded[8])
	return {
		type: '155',
		nonce: bytesToBigint(decoded[0]),
		gasPrice: bytesToBigint(decoded[1]),
		gasLimit: bytesToBigint(decoded[2]),
		to: (decoded[3].length === 0) ? null : bytesToBigint(decoded[3]),
		value: bytesToBigint(decoded[4]),
		data: decoded[5],
		...(r === 0n && s === 0n) ? {
			chainId: v
		} : {
			chainId: (v - 35n) / 2n,
			v, r, s
		}
	}
}

export function isEncodedTransaction155(encodedTransaction: Uint8Array): boolean {
	// possibilities: unsigned_155 + signed_155 + unsigned_155 + signed_155 + typed_transaction
	if (encodedTransaction.length === 0 || encodedTransaction[0]! < 0xc0) return false
	// possibilities: unsigned_155 + signed_155 + unsigned_155 + signed_155
	const decoded = rlpDecode(encodedTransaction)
	if (!isArray(decoded)) throw new Error(`Expected an RLP encoded list but got a single RLP encoded item.`)
	if (decoded.length !== 9) return false
	// possibilities: signed_155 + unsigned_155 + signed_155
	if (!(decoded[7] instanceof Uint8Array)) throw new Error(`Expected the 7th item of the RLP encoded transaction to be an item but it was a list.`)
	if (!(decoded[8] instanceof Uint8Array)) throw new Error(`Expected the 8th item of the RLP encoded transaction to be an item but it was a list.`)
	const r = bytesToBigint(decoded[7])
	const s = bytesToBigint(decoded[8])
	if (r === 0n && s === 0n) return true
	// possibilities: signed_155 + signed_155
	if (!(decoded[6] instanceof Uint8Array)) throw new Error(`Expected the 7th item of the RLP encoded transaction to be an item but it was a list.`)
	const v = bytesToBigint(decoded[6])
	if (v >= 35) return true
	// possibilities: signed_155
	return false
}
