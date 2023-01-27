import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';
import { ETH_COINGECKO_ADDRESS, KWENTA_COINGECKO_ADDRESS } from 'constants/currency';
import useRewardsTimer from 'hooks/useRewardsTimer';
import { GridContainer } from 'sections/earn/grid';
import { sdk } from 'state/config';
import { claimRewards } from 'state/earn/actions';
import {
	selectEarnedRewards,
	selectKwentaAmount,
	selectLPTotalSupply,
	selectWethAmount,
	selectYieldPerDay,
} from 'state/earn/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatPercent, toWei, truncateNumbers, zeroBN } from 'utils/formatters/number';

import GridData from './GridData';

const TimeRemainingData = () => {
	const endDate = useAppSelector(({ earn }) => earn.endDate);
	const timeTillDeadline = useRewardsTimer(new Date(endDate * 1000));

	return <GridData title="Time Remaining" value={timeTillDeadline} />;
};

const StakeGrid = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const earnedRewards = useAppSelector(selectEarnedRewards);
	const kwentaAmount = useAppSelector(selectKwentaAmount);
	const wethAmount = useAppSelector(selectWethAmount);
	const lpTotalSupply = useAppSelector(selectLPTotalSupply);
	const yieldPerDay = useAppSelector(selectYieldPerDay);
	const [tokenPrices, setTokenPrices] = useState<any>(null);

	const handleClaim = useCallback(() => {
		dispatch(claimRewards());
	}, [dispatch]);

	useEffect(() => {
		const tokens = async () => {
			const coinGeckoPrices = await sdk.exchange.batchGetCoingeckoPrices(
				[KWENTA_COINGECKO_ADDRESS, ETH_COINGECKO_ADDRESS],
				true
			);

			const kwentaPrice = coinGeckoPrices
				? toWei(coinGeckoPrices[KWENTA_COINGECKO_ADDRESS]?.usd?.toString())
				: zeroBN;

			const wethPrice = coinGeckoPrices
				? toWei(coinGeckoPrices[ETH_COINGECKO_ADDRESS]?.usd?.toString())
				: zeroBN;

			setTokenPrices({
				kwentaPrice: kwentaPrice,
				wethPrice: wethPrice,
			});
		};

		(async () => {
			await tokens();
		})();
	}, []);

	const tvl = useMemo(
		() => tokenPrices?.kwentaPrice.mul(kwentaAmount).add(tokenPrices?.wethPrice.mul(wethAmount)),
		[kwentaAmount, tokenPrices?.kwentaPrice, tokenPrices?.wethPrice, wethAmount]
	);

	const tokenValue = useMemo(() => (tvl && lpTotalSupply.gt(0) ? tvl.div(lpTotalSupply) : zeroBN), [
		lpTotalSupply,
		tvl,
	]);

	const apy = useMemo(
		() =>
			tokenValue.gt(0)
				? toWei(yieldPerDay)
						.mul(tokenPrices?.kwentaPrice ?? zeroBN)
						.mul(toWei('365'))
						.div(tokenValue)
				: zeroBN,
		[tokenPrices?.kwentaPrice, tokenValue, yieldPerDay]
	);

	return (
		<GridContainer>
			<GridData title="Your Yield / Day" value={yieldPerDay} hasKwentaLogo />
			<GridData title="Your Rewards" value={truncateNumbers(earnedRewards, 4)} hasKwentaLogo>
				<Button
					fullWidth
					variant="flat"
					size="sm"
					style={{ marginTop: 10 }}
					disabled={earnedRewards.lte(0)}
					onClick={handleClaim}
				>
					Claim Rewards
				</Button>
			</GridData>
			<GridData
				title={t('dashboard.stake.tabs.staking.annual-percentage-yield')}
				value={formatPercent(apy.div(toWei('100')))}
			/>
			<TimeRemainingData />
		</GridContainer>
	);
};

export default StakeGrid;
