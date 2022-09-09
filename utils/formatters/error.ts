const REVERT_REGEX = /execution reverted: /;

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
