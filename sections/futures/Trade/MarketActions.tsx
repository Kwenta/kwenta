import useSynthetixQueries from '@synthetixio/queries';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import { futuresAccountState, marketInfoState, positionState } from 'store/futures';
import { isL2State } from 'store/wallet';
import { zeroBN } from 'utils/formatters/number';

import DepositMarginModal from './DepositMarginModal';
import WithdrawMarginModal from './WithdrawMarginModal';

const MarketActions: React.FC = () => {
	const { t } = useTranslation();
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const position = useRecoilValue(positionState);
	const marketInfo = useRecoilValue(marketInfoState);
	const isL2 = useRecoilValue(isL2State);
	const [openModal, setOpenModal] = React.useState<'deposit' | 'withdraw' | null>(null);

	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(selectedFuturesAddress);
	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.['sUSD']?.balance ?? zeroBN;

	return (
		<>
			<MarketActionsContainer>
				<MarketActionButton
					data-testid="futures-market-trade-button-deposit"
					disabled={marketInfo?.isSuspended || !isL2 || !selectedFuturesAddress}
					onClick={() => setOpenModal('deposit')}
					noOutline
				>
					{t('futures.market.trade.button.deposit')}
				</MarketActionButton>
				<MarketActionButton
					data-testid="futures-market-trade-button-withdraw"
					disabled={
						position?.remainingMargin?.lte(zeroBN) ||
						marketInfo?.isSuspended ||
						!isL2 ||
						!selectedFuturesAddress
					}
					onClick={() => setOpenModal('withdraw')}
					noOutline
				>
					{t('futures.market.trade.button.withdraw')}
				</MarketActionButton>
			</MarketActionsContainer>
			{openModal === 'deposit' && (
				<DepositMarginModal sUSDBalance={sUSDBalance} onDismiss={() => setOpenModal(null)} />
			)}

			{openModal === 'withdraw' && <WithdrawMarginModal onDismiss={() => setOpenModal(null)} />}
		</>
	);
};

export default MarketActions;

const MarketActionsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 15px;
	margin-bottom: 16px;
`;

const MarketActionButton = styled(Button)`
	font-size: 15px;
	height: 40px;
	background-color: transparent;
	color: ${(props) => props.theme.colors.selectedTheme.gray};

	&:hover:enabled {
		color: ${(props) => props.theme.colors.selectedTheme.button.text};
		background-color: ${(props) => props.theme.colors.selectedTheme.button.fill};
	}
`;
