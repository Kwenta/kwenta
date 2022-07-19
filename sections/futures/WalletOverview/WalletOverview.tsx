import { useMemo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import styled from 'styled-components';

import { Synths } from 'constants/currency';
import { Title } from '../common';
import OverviewRow from './OverviewRow';
import Positions from './Positions';
import { zeroBN } from 'utils/formatters/number';
import { FuturesPosition } from 'queries/futures/types';
import { useFuturesContext } from 'contexts/FuturesContext';
import { futuresAccountState } from 'store/futures';

type WalletOverviewProps = {
	positions: FuturesPosition[] | null;
};

const WalletOverview: FC<WalletOverviewProps> = ({ positions }) => {
	const { t } = useTranslation();
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const { useSynthsBalancesQuery } = useSynthetixQueries();

	const synthsBalancesQuery = useSynthsBalancesQuery(selectedFuturesAddress);

	const walletPosition = useMemo(() => {
		if (!positions) return null;
		let futuresPositions: FuturesPosition[] = [];
		let totalMargin = zeroBN;

		positions.forEach((position) => {
			totalMargin = totalMargin.add(position.remainingMargin);
			if (position.position) {
				futuresPositions.push(position as FuturesPosition);
			}
		});
		return {
			totalMargin,
			positions: futuresPositions,
		};
	}, [positions]);

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	const overviewRows = useMemo(
		() => [
			{
				label: t('futures.wallet-overview.balance'),
				value: sUSDBalance,
				currencyKey: Synths.sUSD,
				sign: '$',
			},
			{
				label: t('futures.wallet-overview.margin-deployed'),
				value: walletPosition?.totalMargin ?? zeroBN,
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
				{overviewRows.map(({ label, value, currencyKey, sign }, i) => (
					<OverviewRow
						key={`walletoverview-${i}`}
						subtitle={label}
						data={value}
						currencyKey={currencyKey}
						sign={sign}
					/>
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
