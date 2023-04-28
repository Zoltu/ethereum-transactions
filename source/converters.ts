import { keccak_256 } from '@noble/hashes/sha3'

export function bigintToBytes(value: bigint, numberOfBytes?: number): Uint8Array {
	// figuring out the minimum numberOfBytes is hard, so just use built-in toString for that case
	if (numberOfBytes === undefined) {
		const asHex = value.toString(16)
		return hexToBytes(`0x${asHex.length % 2 !== 0 ? '0' : ''}${asHex}`)
	}
	if (value >= 2n**BigInt(numberOfBytes * 8)) throw new Error(`Cannot encode ${value} in ${numberOfBytes} bytes.`)
	if (value < 0) throw new Error(`This function cannot encode a negative number (${value}).`)
	const result = new Uint8Array(numberOfBytes)
	for (let i = 0; i < numberOfBytes; ++i) {
		const shiftAmount = BigInt((numberOfBytes - 1 - i) * 8)
		const byte = Number((value >> shiftAmount) & 0xffn)
		result[i] = byte
	}
	return result
}

export function bytesToBigint(array: Uint8Array): bigint {
	return array.reduce((result, character, index) => {
		const shiftAmount = BigInt((array.length - 1 - index) * 8)
		const byte = BigInt(character)
		result |= byte << shiftAmount
		return result
	}, 0n)
}

export function bytesToHex(value: Uint8Array): `0x${string}` {
	return `0x${Array.from(value).map(x => x.toString(16).padStart(2, '0')).join('')}`
}

export function bigintToHex(value: bigint, numberOfBytes?: number): `0x${string}` {
	return `0x${value.toString(16).padStart((numberOfBytes ?? 0) * 2, '0')}`
}

export function hexToBigint(value: string) {
	if (value === '0x') return 0n
	if (!/^0x[a-fA-F0-9]+$/.test(value)) throw new Error(`Expected a hex encoded number but got ${value}`)
	return BigInt(value)
}

export function hexToBytes(value: string) {
	if (!/^0x[a-fA-F0-9]*$/.test(value)) throw new Error(`Expected a hex encoded byte array but got ${value}`)
	if (value.length % 2 !== 0) throw new Error(`Expected an even number of nibbles but found ${value.length - 2} nibbles.`)
	const result = new Uint8Array((value.length - 2) / 2)
	for (let i = 0; i < result.length; ++i) {
		result[i] = Number.parseInt(value.slice(i * 2 + 2, i * 2 + 4), 16)
	}
	return result
}

export function addressBigintToHex(address: bigint) {
	const addressString = address.toString(16).padStart(40, '0')
	if (address >= 2n**160n) throw new Error(`Address is larger than 20 bytes: ${addressString}`)
	const addressHash = bytesToBigint(keccak_256(addressString))
	return Array.from(addressString).reduce((result, character, index) => {
		const isLetter = /[a-fA-F]/.test(character)
		const checksumBit = addressHash & (2n**(255n - 4n * BigInt(index)))
		if (isLetter && checksumBit) result += character.toUpperCase()
		else result += character.toLowerCase()
		return result
	}, '0x')
}

export function addressHexToBigint(address: string) {
	const match = /^(:?0x)(?<address>[a-fA-F0-9]{40})$/.exec(address)
	if (match === null) throw new Error(`Expected a 40 character hex string with an optional 0x prefix but found: ${address}`)
	return BigInt(`0x${match.groups!['address']!}`)
}
