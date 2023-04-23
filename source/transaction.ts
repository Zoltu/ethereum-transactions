import { rlpDecode } from '@zoltu/rlp-encoder'
import { JsonTransaction155, Transaction155, deserializeTransaction155, encodeTransaction155, serializeTransaction155 } from './transaction-155.js'
import { JsonTransaction1559, Transaction1559, deserializeTransaction1559, encodeTransaction1559, serializeTransaction1559 } from './transaction-1559.js'
import { JsonTransaction2930, Transaction2930, deserializeTransaction2930, encodeTransaction2930, serializeTransaction2930 } from './transaction-2930.js'
import { JsonTransactionLegacy, TransactionLegacy, deserializeTransactionLegacy, encodeTransactionLegacy, serializeTransactionLegacy } from './transaction-legacy.js'
import { DistributedOmit, assertNever, isArray } from './typescript.js'
import { bytesToBigint } from './converters.js'

export * from './transaction-legacy.js'
export * from './transaction-155.js'
export * from './transaction-2930.js'
export * from './transaction-1559.js'

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

export function encodeTransaction(transaction: Transaction): Uint8Array {
	switch (transaction.type) {
		case 'legacy': return encodeTransactionLegacy(transaction)
		case '155': return encodeTransaction155(transaction)
		case '2930': return encodeTransaction2930(transaction)
		case '1559': return encodeTransaction1559(transaction)
		default: assertNever(transaction)
	}
}

export function decodeTransaction(transaction: Uint8Array): Transaction {
	if (transaction.length === 0) throw new Error(`Expected an encoded transaction but got an empty byte array.`)
	switch (transaction[0]) {
		case 2: return decodeTransaction1559(transaction)
		case 1: return decodeTransaction2930(transaction)
		default: {
			if (transaction[0]! < 0xc0) throw new Error(`Expected an encoded transaction but first byte is not an expected transaction type or legacy transaction RLP byte.`)
			const decoded = rlpDecode(transaction)
			if (!isArray(decoded)) throw new Error(`Expected an RLP encoded list but got a single RLP encoded item.`)
			if (decoded.length === 6) return decodeTransactionLegacy(transaction)
			if (decoded.length !== 9) throw new Error(`Expected an RLP encoded list of 9 items but got ${decoded.length} items.`)
			if (!(decoded[7] instanceof Uint8Array)) throw new Error(`Expected the 7th item of the RLP encoded transaction to be an item but it was a list.`)
			if (!(decoded[8] instanceof Uint8Array)) throw new Error(`Expected the 8th item of the RLP encoded transaction to be an item but it was a list.`)
			const r = bytesToBigint(decoded[7])
			const s = bytesToBigint(decoded[8])
			const isSigned = r !== 0n || s !== 0n
			if (!isSigned) return decodeTransaction155(transaction)
			return decodeTransactionLegacy(transaction)
		}
	}
}
