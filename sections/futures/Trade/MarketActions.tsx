import React from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import { zeroBN } from 'utils/formatters/number';
import { useRecoilValue } from 'recoil';
import { futuresAccountState, marketInfoState, positionState } from 'store/futures';
import DepositMarginModal from './DepositMarginModal';
import WithdrawMarginModal from './WithdrawMarginModal';
import useSynthetixQueries from '@synthetixio/queries';
import { Synths } from 'constants/currency';

const MarketActions: React.FC = () => {
	const { t } = useTranslation();
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const position = useRecoilValue(positionState);
	const marketInfo = useRecoilValue(marketInfoState);
	const [openModal, setOpenModal] = React.useState<'deposit' | 'withdraw' | null>(null);

	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(selectedFuturesAddress);
	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	return (
		<>
			<MarketActionsContainer>
				<MarketActionButton
					disabled={marketInfo?.isSuspended}
					onClick={() => setOpenModal('deposit')}
					noOutline
				>
					{t('futures.market.trade.button.deposit')}
				</MarketActionButton>
				<MarketActionButton
					disabled={position?.remainingMargin?.lte(zeroBN) || marketInfo?.isSuspended}
					onClick={() => setOpenModal('withdraw')}
					noOutline
				>
					{t('futures.market.trade.button.withdraw')}
				</MarketActionButton>
			</MarketActionsContainer>
			{openModal === 'deposit' && (
				<DepositMarginModal sUSDBalance={sUSDBalance} onDismiss={() => setOpenModal(null)} />
			)}

			{openModal === 'withdraw' && (
				<WithdrawMarginModal sUSDBalance={sUSDBalance} onDismiss={() => setOpenModal(null)} />
			)}
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
