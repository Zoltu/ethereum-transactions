import { RlpItem, rlpDecode, rlpEncode } from "@zoltu/rlp-encoder"
import { signAsync } from '@noble/secp256k1'
import { keccak_256 } from '@noble/hashes/sha3'
import { addressBigintToHex, bigintToHex, bytesToBigint, bytesToHex, hexToBigint, hexToBytes, encodeAddressForRlp, encodeNumberForRlp } from "./converters.js"
import { isArray } from "./typescript.js"

export type TransactionLegacyUnsigned = {
	readonly type: 'legacy'
	readonly nonce: bigint
	readonly gasPrice: bigint
	readonly gasLimit: bigint
	readonly to: bigint | null
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
	readonly to: string | null
	readonly value: string
	readonly data: string
}
export type JsonTransactionLegacySigned = JsonTransactionLegacyUnsigned & {
	readonly v: string
	readonly r: string
	readonly s: string
}
export type JsonTransactionLegacy = JsonTransactionLegacyUnsigned | JsonTransactionLegacySigned

export function isSignedLegacy(transaction: JsonTransactionLegacy): transaction is JsonTransactionLegacySigned
export function isSignedLegacy(transaction: TransactionLegacy): transaction is TransactionLegacySigned
export function isSignedLegacy(transaction: JsonTransactionLegacy | TransactionLegacy): transaction is JsonTransactionLegacySigned | TransactionLegacySigned {
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

export async function signLegacy(transaction: TransactionLegacy, privateKey: bigint): Promise<TransactionLegacySigned> {
	if (isSignedLegacy(transaction)) return transaction
	const encoded = encodeTransactionLegacy(transaction)
	const hash = keccak_256(encoded)
	// hacky private key converting necessary until https://github.com/paulmillr/noble-secp256k1/pull/102 is merged
	const signature = await signAsync(hash, privateKey.toString(16).padStart(64, '0'))
	return {
		type: 'legacy',
		nonce: transaction.nonce,
		gasPrice: transaction.gasPrice,
		gasLimit: transaction.gasLimit,
		to: transaction.to,
		value: transaction.value,
		data: transaction.data,
		// not null assertion necessary until https://github.com/paulmillr/noble-secp256k1/pull/101 is merged
		v: BigInt(signature.recovery!) + 27n,
		r: signature.r,
		s: signature.s,
	}
}

export function serializeTransactionLegacy(transaction: TransactionLegacyUnsigned): JsonTransactionLegacyUnsigned
export function serializeTransactionLegacy(transaction: TransactionLegacySigned): JsonTransactionLegacySigned
export function serializeTransactionLegacy(transaction: TransactionLegacy): JsonTransactionLegacy
export function serializeTransactionLegacy(transaction: TransactionLegacy): JsonTransactionLegacy {
	return {
		type: 'legacy',
		nonce: bigintToHex(transaction.nonce),
		gasPrice: bigintToHex(transaction.gasPrice),
		gasLimit: bigintToHex(transaction.gasLimit),
		to: transaction.to === null ? null : addressBigintToHex(transaction.to),
		value: bigintToHex(transaction.value),
		data: bytesToHex(transaction.data),
		...isSignedLegacy(transaction) ? {
			v: bigintToHex(transaction.v),
			r: bigintToHex(transaction.r),
			s: bigintToHex(transaction.s),
		} : {}
	}
}

export function deserializeTransactionLegacy(transaction: JsonTransactionLegacyUnsigned): TransactionLegacyUnsigned
export function deserializeTransactionLegacy(transaction: JsonTransactionLegacySigned): TransactionLegacySigned
export function deserializeTransactionLegacy(transaction: JsonTransactionLegacy): TransactionLegacy
export function deserializeTransactionLegacy(transaction: JsonTransactionLegacy): TransactionLegacy {
	return {
		type: 'legacy',
		nonce: hexToBigint(transaction.nonce),
		gasPrice: hexToBigint(transaction.gasPrice),
		gasLimit: hexToBigint(transaction.gasLimit),
		to: transaction.to === null ? null : hexToBigint(transaction.to),
		value: hexToBigint(transaction.value),
		data: hexToBytes(transaction.data),
		...isSignedLegacy(transaction) ? {
			v: hexToBigint(transaction.v),
			r: hexToBigint(transaction.r),
			s: hexToBigint(transaction.s),
		} : {}
	}
}

export function encodeTransactionLegacy(transaction: TransactionLegacy): Uint8Array {
	const toEncode = [
		encodeNumberForRlp(transaction.nonce),
		encodeNumberForRlp(transaction.gasPrice),
		encodeNumberForRlp(transaction.gasLimit),
		transaction.to !== null ? encodeAddressForRlp(transaction.to) : new Uint8Array(0),
		encodeNumberForRlp(transaction.value),
		transaction.data,
		...isSignedLegacy(transaction) ? [
			encodeNumberForRlp(transaction.v),
			encodeNumberForRlp(transaction.r),
			encodeNumberForRlp(transaction.s),
		] : []
	]
	return rlpEncode(toEncode)
}

type UnsignedShape = [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array]
type SignedShape = [...UnsignedShape, Uint8Array, Uint8Array, Uint8Array]
export function decodeTransactionLegacy(encoded: Uint8Array): TransactionLegacy {
	function assertStructure(list: readonly RlpItem[]): asserts list is UnsignedShape | SignedShape {
		if (list.length !== 6 && decoded.length !== 9) throw new Error(`Expected an encoded legacy transaction which is an RLP list of either 8 or 11 items but decoded a list of ${list.length} items.`)
		list.forEach((item, index) => { if (isArray(item)) throw new Error(`Expected an encoded legacy transaction with a byte array in position ${index} but decoded a list.`) })
	}
	function isSigned(list: UnsignedShape | SignedShape): list is SignedShape {
		return list.length === 9
	}

	const decoded = rlpDecode(encoded)
	if (!isArray(decoded)) throw new Error(`Expected an encoded legacy transaction which is an RLP list of items but got something that was just a single encoded item.`)
	assertStructure(decoded)
	return {
		type: 'legacy',
		nonce: bytesToBigint(decoded[0]),
		gasPrice: bytesToBigint(decoded[1]),
		gasLimit: bytesToBigint(decoded[2]),
		to: (decoded[3].length === 0) ? null : bytesToBigint(decoded[3]),
		value: bytesToBigint(decoded[4]),
		data: decoded[5],
		...isSigned(decoded) ? {
			v: bytesToBigint(decoded[6]),
			r: bytesToBigint(decoded[7]),
			s: bytesToBigint(decoded[8]),
		} : {}
	}
}
