import { bigintToBytes } from './converters.js'
import { JsonTransaction155, Transaction155, Transaction155Signed, decodeTransaction155, deserializeTransaction155, encodeTransaction155, isEncodedTransaction155, isSigned155, serializeTransaction155, sign155 } from './transaction-155.js'
import { JsonTransaction1559, Transaction1559, Transaction1559Signed, decodeTransaction1559, deserializeTransaction1559, encodeTransaction1559, isSigned1559, serializeTransaction1559, sign1559 } from './transaction-1559.js'
import { JsonTransaction2930, Transaction2930, Transaction2930Signed, decodeTransaction2930, deserializeTransaction2930, encodeTransaction2930, isSigned2930, serializeTransaction2930, sign2930 } from './transaction-2930.js'
import { JsonTransactionLegacy, TransactionLegacy, TransactionLegacySigned, decodeTransactionLegacy, deserializeTransactionLegacy, encodeTransactionLegacy, isSignedLegacy, serializeTransactionLegacy, signLegacy } from './transaction-legacy.js'
import { DistributedOmit, assertNever } from './typescript.js'

export * from './transaction-legacy.js'
export * from './transaction-155.js'
export * from './transaction-2930.js'
export * from './transaction-1559.js'

export type TransactionSigned = TransactionLegacySigned | Transaction155Signed | Transaction2930Signed | Transaction1559Signed
export type Transaction = TransactionLegacy | Transaction155 | Transaction2930 | Transaction1559
export type JsonTransaction = JsonTransactionLegacy | JsonTransaction155 | JsonTransaction2930 | JsonTransaction1559

export function serializeTransaction(transaction: Transaction): JsonTransaction {
	switch (transaction.type) {
		case 'legacy': return serializeTransactionLegacy(transaction)
		case '155': return serializeTransaction155(transaction)
		case '2930': return serializeTransaction2930(transaction)
		case '1559': return serializeTransaction1559(transaction)
		default: assertNever(transaction)
	}
}

export function deserializeTransaction(transaction: DistributedOmit<JsonTransaction, 'type'>): Transaction {
	function typeStampTransaction(transaction: DistributedOmit<JsonTransaction, 'type'>): JsonTransaction {
		if (is1559Transaction(transaction)) return { type: '1559', ...transaction }
		if (is2930Transaction(transaction)) return { type: '2930', ...transaction }
		if (is155Transaction(transaction)) return { type: '155', ...transaction }
		if (isLegacyTransaction(transaction)) return { type: 'legacy', ...transaction }
		assertNever(transaction)
	}
	function is1559Transaction(transaction: DistributedOmit<JsonTransaction, 'type'>): transaction is DistributedOmit<JsonTransaction1559, 'type'> {
		return 'maxFeePerGas' in transaction && typeof transaction.maxFeePerGas === 'string'
	}
	function is2930Transaction(transaction: DistributedOmit<JsonTransaction, 'type'>): transaction is DistributedOmit<JsonTransaction2930, 'type'> {
		if (is1559Transaction(transaction)) return false
		return 'accessList' in transaction && typeof transaction.accessList === 'string'
	}
	function is155Transaction(transaction: DistributedOmit<JsonTransaction, 'type'>): transaction is DistributedOmit<JsonTransaction155, 'type'> {
		if (is1559Transaction(transaction)) return false
		if (is2930Transaction(transaction)) return false
		if ('chainId' in transaction && typeof transaction.chainId === 'string') return true
		if ('v' in transaction && typeof transaction.v === 'string' && BigInt(transaction.v) >= 35n) return true
		return false
	}
	function isLegacyTransaction(transaction: DistributedOmit<JsonTransaction, 'type'>): transaction is DistributedOmit<JsonTransactionLegacy, 'type'> {
		if (is1559Transaction(transaction)) return false
		if (is2930Transaction(transaction)) return false
		if (is155Transaction(transaction)) return false
		return true
	}

	const typedTransaction = typeStampTransaction(transaction)
	switch (typedTransaction.type) {
		case 'legacy': return deserializeTransactionLegacy(typedTransaction)
		case '155': return deserializeTransaction155(typedTransaction)
		case '2930': return deserializeTransaction2930(typedTransaction)
		case '1559': return deserializeTransaction1559(typedTransaction)
		default: assertNever(typedTransaction)
	}
}

export function isSigned(transaction: Transaction): transaction is TransactionSigned {
	switch (transaction.type) {
		case 'legacy': return isSignedLegacy(transaction)
		case '155': return isSigned155(transaction)
		case '2930': return isSigned2930(transaction)
		case '1559': return isSigned1559(transaction)
	}
}

export function signTransaction(transaction: TransactionLegacy, privateKey: bigint): Promise<TransactionLegacySigned>
export function signTransaction(transaction: Transaction155, privateKey: bigint): Promise<Transaction155Signed>
export function signTransaction(transaction: Transaction2930, privateKey: bigint): Promise<Transaction2930Signed>
export function signTransaction(transaction: Transaction1559, privateKey: bigint): Promise<Transaction1559Signed>
export function signTransaction(transaction: Transaction, privateKey: bigint): Promise<TransactionSigned>
export function signTransaction(transaction: Transaction, privateKey: bigint): Promise<TransactionSigned> {
	switch (transaction.type) {
		case 'legacy': return signLegacy(transaction, privateKey)
		case '155': return sign155(transaction, privateKey)
		case '2930': return sign2930(transaction, privateKey)
		case '1559': return sign1559(transaction, privateKey)
	}
}

export function encodeTransaction(transaction: Transaction): Uint8Array {
	switch (transaction.type) {
		case 'legacy': return encodeTransactionLegacy(transaction)
		case '155': return encodeTransaction155(transaction)
		case '2930': return encodeTransaction2930(transaction)
		case '1559': return encodeTransaction1559(transaction)
		default: assertNever(transaction)
	}
}

export function decodeTransaction(encodedTransaction: Uint8Array): Transaction {
	if (encodedTransaction.length === 0) throw new Error(`Expected an encoded transaction but got an empty byte array.`)
	switch (encodedTransaction[0]) {
		case 2: return decodeTransaction1559(encodedTransaction)
		case 1: return decodeTransaction2930(encodedTransaction)
		default: {
			if (encodedTransaction[0]! < 0xc0) throw new Error(`Expected an encoded transaction but first byte is not an expected transaction type or legacy transaction RLP byte.`)
			if (isEncodedTransaction155(encodedTransaction)) return decodeTransaction155(encodedTransaction)
			else return decodeTransactionLegacy(encodedTransaction)
		}
	}
}

export function encodeNumberForRlp(value: bigint) {
	if (value === 0n) return new Uint8Array(0)
	return bigintToBytes(value)
}
export function encodeAddressForRlp(value: bigint) {
	return bigintToBytes(value, 20)
}
export function encodeHashForRlp(value: bigint) {
	return bigintToBytes(value, 32)
}