import Wei, { wei } from '@synthetixio/wei';

type WeiObject = { [key: string]: any };

export const serializeWeiObject = (object: WeiObject) => {
	return Object.entries(object).reduce((acc, [key, value]) => {
		if (!value) {
			acc[key] = value;
		} else if (value instanceof Wei) {
			acc[key] = value.toString();
		} else if (typeof value === 'object') {
			acc[key] = serializeWeiObject(value);
		} else {
			acc[key] = value;
		}

		return acc;
	}, {} as Record<string, any>);
};

// TODO: This hydration algorithm can be improved
export const hydrateWeiObject = (object: WeiObject, keys: Set<string>, prefix?: string) => {
	return Object.entries(object).reduce((acc, [key, value]) => {
		if (!value) {
			acc[key] = value;
		} else if (keys.has(prefix ? `${prefix}.${key}` : key)) {
			acc[key] = wei(value);
		} else if (typeof value === 'object') {
			acc[key] = hydrateWeiObject(value, keys, key);
		} else {
			acc[key] = value;
		}

		return acc;
	}, {} as WeiObject);
};
