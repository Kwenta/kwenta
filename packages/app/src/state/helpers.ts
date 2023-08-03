import { FuturesMarginType } from '@kwenta/sdk/types'
import Wei, { wei } from '@synthetixio/wei'

// Redux recommends that values stored in state are serializable
// (Generally for diffing, performance and persistence reasons).
//
// However, we store a lot of values that are Wei instances in
// state, so we are faced with the challenge of having to
// serialize those values, and then deserialize them in
// selectors.
//
// These functions look for these values (recursively for nested ones),
// and replace them with strings (when serializing), or replace the string
// values (read from a map) with a Wei instance (when deserializing).
//
// Currently, this comes at the cost of sacrificing types.

export const serializeWeiObject = (object: object) => {
	return Object.entries(object).reduce((acc, [key, value]) => {
		if (!value) {
			acc[key] = value
		} else if (value instanceof Wei) {
			acc[key] = value.toString()
		} else if (typeof value === 'object') {
			acc[key] = serializeWeiObject(value)
		} else {
			acc[key] = value
		}

		return acc
	}, {} as any)
}

// TODO: This deserialization algorithm can be improved
export const deserializeWeiObject = (object: object, keys: Set<string>, prefix?: string) => {
	return Object.entries(object).reduce((acc, [key, value]) => {
		if (!value) {
			acc[key] = value
		} else if (keys.has(prefix ? `${prefix}.${key}` : key)) {
			acc[key] = wei(value)
		} else if (typeof value === 'object') {
			acc[key] = deserializeWeiObject(value, keys, key)
		} else {
			acc[key] = value
		}

		return acc
	}, {} as any)
}

export const accountType = (type: FuturesMarginType) =>
	type === FuturesMarginType.CROSS_MARGIN ? 'crossMargin' : 'smartMargin'
