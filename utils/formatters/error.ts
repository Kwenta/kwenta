const REVERT_REGEX = /execution reverted: /;

export const formatRevert = (revertMsg: string) => {
	if (!revertMsg) return '';
	return revertMsg.replace(REVERT_REGEX, '');
};

export const isMMUserDeniedError = (message: string) => {
	return message.includes('User denied transaction signature');
};
