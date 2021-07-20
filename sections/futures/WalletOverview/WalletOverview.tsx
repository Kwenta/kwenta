import { useMemo, FC } from 'react';
import { useTranslation } from 'react-i18next';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import { SYNTHS_MAP } from 'constants/currency';
import { Title } from '../common';
import OverviewRow from './OverviewRow';
import PerformanceChart from './PerformanceChart';
import Positions from './Positions';
import { zeroBN, formatNumber } from 'utils/formatters/number';
import { FuturesPosition } from 'queries/futures/types';

type WalletOverviewProps = {
	positions: FuturesPosition[] | null;
};

const WalletOverview: FC<WalletOverviewProps> = ({ positions }) => {
	const { t } = useTranslation();
	const balancesQuery = useSynthsBalancesQuery();

	const walletPosition = useMemo(() => {
		if (!positions) return null;
		let futuresPositions: Partial<FuturesPosition>[] = [];
		let totalMargin = zeroBN;

		positions.forEach(({ margin, position, order }) => {
			totalMargin = totalMargin.plus(margin);
			if (position) {
				futuresPositions.push(position as Partial<FuturesPosition>);
			}
		});
		return {
			totalMargin,
			positions: futuresPositions,
		};
	}, [positions]);

	const sUSDBalance = balancesQuery?.data?.totalUSDBalance ?? zeroBN;

	const overviewRows = useMemo(
		() => [
			{
				label: t('futures.wallet-overview.balance'),
				value: formatNumber(sUSDBalance),
				currencyKey: SYNTHS_MAP.sUSD,
				sign: '$',
			},
			{
				label: t('futures.wallet-overview.margin-deployed'),
				value: formatNumber(walletPosition ? walletPosition.totalMargin : zeroBN),
				currencyKey: SYNTHS_MAP.sUSD,
				sign: '$',
			},
		],
		[t, sUSDBalance, walletPosition]
	);
	return (
		<div>
			<Title>{t('futures.wallet-overview.title')}</Title>
			{overviewRows.map(({ label, value, currencyKey, sign }) => (
				<OverviewRow subtitle={label} data={value} currencyKey={currencyKey} sign={sign} />
			))}
			<PerformanceChart changeNumber={2000} changePercent={8} />
			<Positions positions={walletPosition?.positions ?? null} />
		</div>
	);
};
export default WalletOverview;
