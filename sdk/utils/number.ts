import Wei, { WeiSource, wei } from '@synthetixio/wei';

export const weiFromWei = (weiAmount: WeiSource) => {
	if (weiAmount instanceof Wei) {
		const precisionDiff = 18 - weiAmount.p;
		return wei(weiAmount, 18, true).div(10 ** precisionDiff);
	} else {
		return wei(weiAmount, 18, true);
	}
};
