import { useMemo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import styled from 'styled-components';

import { walletAddressState } from 'store/wallet';

import { Synths } from 'constants/currency';
import { Title } from '../common';
import OverviewRow from './OverviewRow';
import Positions from './Positions';
import { zeroBN, formatNumber } from 'utils/formatters/number';
import { FuturesPosition } from 'queries/futures/types';

type WalletOverviewProps = {
	positions: FuturesPosition[] | null;
};

const WalletOverview: FC<WalletOverviewProps> = ({ positions }) => {
	const { t } = useTranslation();
	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const walletAddress = useRecoilValue(walletAddressState);

	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress);

	const walletPosition = useMemo(() => {
		if (!positions) return null;
		let futuresPositions: Partial<FuturesPosition>[] = [];
		let totalMargin = zeroBN;

		positions.forEach(({ margin, position }) => {
			totalMargin = totalMargin.add(margin);
			if (position) {
				futuresPositions.push(position as Partial<FuturesPosition>);
			}
		});
		return {
			totalMargin,
			positions: futuresPositions,
		};
	}, [positions]);

	const sUSDBalance = synthsWalletBalancesQuery?.data?.totalUSDBalance ?? zeroBN;

	const overviewRows = useMemo(
		() => [
			{
				label: t('futures.wallet-overview.balance'),
				value: formatNumber(sUSDBalance),
				currencyKey: Synths.sUSD,
				sign: '$',
			},
			{
				label: t('futures.wallet-overview.margin-deployed'),
				value: formatNumber(walletPosition ? walletPosition.totalMargin : zeroBN),
				currencyKey: Synths.sUSD,
				sign: '$',
			},
		],
		[t, sUSDBalance, walletPosition]
	);
	return (
		<div>
			<Balances>
				<Title>{t('futures.wallet-overview.title')}</Title>
				{overviewRows.map(({ label, value, currencyKey, sign }) => (
					<OverviewRow subtitle={label} data={value} currencyKey={currencyKey} sign={sign} />
				))}
			</Balances>
			<Positions positions={walletPosition?.positions ?? null} />
		</div>
	);
};

const Balances = styled.div`
	margin-bottom: 28px;
`;
export default WalletOverview;
