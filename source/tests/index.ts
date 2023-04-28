import { describe, should } from 'micro-should'
import './converters.js'
import './transaction.js'
import { assertEqual, jsonParse, jsonStringify } from './utils.js'

describe('utils', () => {
	should('stringify bigints', () => {
		const expected = '"0x5n"'
		const actual = jsonStringify(5n)
		assertEqual(expected, actual)
	})
	should('stringify bigger ints', () => {
		const expected = '"0x1234abcdn"'
		const actual = jsonStringify(0x1234abcdn)
		assertEqual(expected, actual)
	})
	should('stringify bigger ints in objects', () => {
		const expected = '{"key":"0x1234abcdn"}'
		const actual = jsonStringify({key: 0x1234abcdn})
		assertEqual(expected, actual)
	})
	should('stringify bigger ints in arrays', () => {
		const expected = '["0x1234abcdn"]'
		const actual = jsonStringify([0x1234abcdn])
		assertEqual(expected, actual)
	})
	should('parse bigints', () => {
		const expected = 0x5n
		const actual = jsonParse('"0x5n"')
		assertEqual(expected, actual)
	})
	should('parse bigger ints', () => {
		const expected = 0x1234abcdn
		const actual = jsonParse('"0x1234abcdn"')
		assertEqual(expected, actual)
	})
	should('parse bigger ints in objects', () => {
		const expected = {key: 0x1234abcdn}
		const actual = jsonParse('{"key":"0x1234abcdn"}')
		assertEqual(expected, actual)
	})
	should('parse bigger ints in arrays', () => {
		const expected = [0x1234abcdn]
		const actual = jsonParse('["0x1234abcdn"]')
		assertEqual(expected, actual)
	})
})

should.run()