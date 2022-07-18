const REVERT_REGEX = /execution reverted: /;

export const formatRevert = (revertMsg: string) => {
	return revertMsg.replace(REVERT_REGEX, '');
};
