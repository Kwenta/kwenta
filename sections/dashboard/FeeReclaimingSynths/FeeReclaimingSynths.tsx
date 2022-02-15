import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { useRecoilValue } from 'recoil';

import useFeeReclaimPeriodsQuery from 'queries/synths/useFeeReclaimPeriodsQuery';

import { walletAddressState } from 'store/wallet';
import { CardTitle } from 'sections/dashboard/common';
import FeeReclaimingSynth from './FeeReclaimingSynth';

const FeeReclaimingSynths: FC = () => {
	const { t } = useTranslation();

	const walletAddress = useRecoilValue(walletAddressState);
	const feeAndWaitingPeriodsQuery = useFeeReclaimPeriodsQuery(walletAddress ?? '');
	const feeAndWaitingPeriods = useMemo(() => feeAndWaitingPeriodsQuery.data ?? [], [
		feeAndWaitingPeriodsQuery.data,
	]);
	const show = useMemo(
		() => !!feeAndWaitingPeriods.find((fw) => fw.fee.gt(0) || fw.waitingPeriod !== 0),
		[feeAndWaitingPeriods]
	);

	return !show ? null : (
		<Container>
			<Title>{t('dashboard.fee-reclaiming-synths.title')}</Title>
			<Card>
				{feeAndWaitingPeriods.map(({ currencyKey, waitingPeriod, fee, noOfTrades }) => (
					<FeeReclaimingSynth
						key={currencyKey}
						currencyKey={currencyKey as CurrencyKey}
						fee={fee}
						{...{ waitingPeriod, noOfTrades }}
					/>
				))}
			</Card>
		</Container>
	);
};

const Container = styled.div`
	margin-bottom: 34px;
`;

const Title = styled(CardTitle)`
	margin-bottom: 12px;
	padding-bottom: 5px;
`;

const Card = styled.div`
	border-radius: 4px;
	background-color: ${(props) => props.theme.colors.elderberry};
	display: grid;
`;

export default FeeReclaimingSynths;
