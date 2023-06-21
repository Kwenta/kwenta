export const startInterval = (callback: () => void, ms: number) => {
	callback();
	return setInterval(callback, ms);
};
