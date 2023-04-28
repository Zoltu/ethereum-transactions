export function assertNever(_: never): never {
	throw new Error(`Unreachable code reached.`)
}

export function isArray(value: unknown): value is readonly unknown[] {
	// See: https://github.com/microsoft/TypeScript/issues/17002 
	return Array.isArray(value)
}

export type UnionToIntersection<T> = (T extends unknown ? (k: T) => void : never) extends (k: infer I) => void ? I : never
export type DistributedOmit<T, K extends keyof UnionToIntersection<T>> = T extends unknown ? Pick<T, Exclude<keyof T, K>> : never
export type KeysOfUnion<T> = T extends T ? keyof T: never
export type ReadWrite<T> = T extends T ? { -readonly [K in keyof T]: T[K] } : never
