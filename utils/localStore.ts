export const set = (key: string, value: any) => {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem(key, JSON.stringify(value));
	}
};

export function get<T>(key: string): T | null {
	if (typeof window !== 'undefined') {
		const item = window.localStorage.getItem(key);
		try {
			if (item != null) {
				return JSON.parse(item);
			}
		} catch (e) {
			console.error(e);
		}
	}
	return null;
}

export default {
	set,
	get,
};
