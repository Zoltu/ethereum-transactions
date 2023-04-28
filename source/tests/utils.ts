import { hexToBytes } from "../converters.js"

export function assertEqual(expected: unknown, actual: unknown): void {
	if (typeof expected !== typeof actual) throw new Error(`Equality check failed on types.\nExpected type: ${typeof expected}\nActual type  : ${typeof actual}`)
	if (expected instanceof Uint8Array) {
		if (!(actual instanceof Uint8Array)) throw new Error(`Equality check on Uint8Array type failed.\nExpected: Uint8Array\nActual  : ${typeof actual}.`)
		return assertEqual(Array.from(expected), Array.from(actual))
	}
	if (Array.isArray(expected)) {
		if (!Array.isArray(actual)) throw new Error(`Equality check on array type failed.\nExpected ${actual} to be an array.`)
		if (expected.length !== actual.length) throw new Error()
		for (let i = 0; i < expected.length; ++i) {
			if (typeof expected[i] === 'object' && typeof expected[i] !== null) assertEqual(expected[i], actual[i])
			if (expected[i] !== actual[i]) throw new Error(`Equality check of array elements failed.\nExpected: ${jsonStringify(expected)}\nActual  : ${jsonStringify(actual)}`)
		}
		return
	}
	if (expected !== undefined && typeof expected === 'object' && expected !== null) {
		for (const key in expected) {
			const expectedValue = (expected as Record<string, unknown>)[key]
			const actualValue = (actual as Record<string, unknown>)[key]
			if (typeof expectedValue === 'object' && typeof expectedValue !== null) return assertEqual(expectedValue, actualValue)
			if (expectedValue !== actualValue) throw new Error(`Equality check of object property '${key}' failed.\nExpected: ${jsonStringify(expectedValue)}\nActual  : ${jsonStringify(actualValue)}`)
		}
		return
	}
	if (expected !== actual) throw new Error(`Equality check failed.\nExpected: ${actual}\nActual  : ${expected}`)
}

export function jsonStringify(value: unknown, space?: string | number | undefined): string {
    return JSON.stringify(value, (_key, value) => {
		if (typeof value === 'bigint') return `0x${value.toString(16)}n`
		if (value instanceof Uint8Array) return `b'${Array.from(value).map(x => x.toString(16).padStart(2, '0')).join('')}'`
		return value
    }, space)
}
export function jsonParse(text: string): unknown {
	return JSON.parse(text, (_key: string, value: unknown) => {
		if (typeof value !== 'string') return value
		if (/^0x[a-fA-F0-9]+n$/.test(value)) return BigInt(value.slice(0, -1))
		const bytesMatch = /^b'(:<hex>[a-fA-F0-9])+'$/.exec(value)
		if (bytesMatch && 'groups' in bytesMatch && bytesMatch.groups && 'hex' in bytesMatch.groups) return hexToBytes(`0x${bytesMatch.groups['hex']}`)
		return value
	})
}
