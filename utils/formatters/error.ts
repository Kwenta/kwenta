const REVERT_REGEX = /execution reverted: /;

const KNOWN_ERROR_PATTERNS: Record<string, string> = {
	'order too old, use cancel': 'Order too old, use cancel',
	'executability not reached': 'Cannot execute yet, try again in a few seconds',
	'cannot cancel yet': 'Cannot cancel order yet',
	'Insufficient margin': 'Insufficient margin',
	'Max leverage exceeded': 'Max leverage exceeded',
};

export const formatRevert = (revertMsg: string) => {
	if (!revertMsg) return '';
	return revertMsg.replace(REVERT_REGEX, '');
};

export const isUserDeniedError = (message: string | undefined) => {
	if (!message) return false;
	return (
		message.includes('User denied transaction signature') ||
		message.includes('user rejected transaction')
	);
};

export const getKnownError = (message: string | undefined) => {
	if (!message) return '';

	const knownKey = Object.keys(KNOWN_ERROR_PATTERNS).find((k) => message.includes(k));
	return knownKey ? KNOWN_ERROR_PATTERNS[knownKey] : message;
};
