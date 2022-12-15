import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal } from 'state/app/selectors';
import { selectMarketInfo, selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import TransferIsolatedMarginModal from './TransferIsolatedMarginModal';

const MarketActions: React.FC = () => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const dispatch = useAppDispatch();
	const position = useAppSelector(selectPosition);
	const marketInfo = useAppSelector(selectMarketInfo);
	const openModal = useAppSelector(selectOpenModal);

	const isL2 = useIsL2();

	return (
		<>
			<MarketActionsContainer>
				<MarketActionButton
					data-testid="futures-market-trade-button-deposit"
					disabled={marketInfo?.isSuspended || !isL2 || !walletAddress}
					onClick={() => dispatch(setOpenModal('futures_isolated_transfer'))}
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
						!walletAddress
					}
					onClick={() => dispatch(setOpenModal('futures_isolated_transfer'))}
					noOutline
				>
					{t('futures.market.trade.button.withdraw')}
				</MarketActionButton>
			</MarketActionsContainer>
			{openModal === 'futures_isolated_transfer' && (
				<TransferIsolatedMarginModal
					defaultTab="deposit"
					onDismiss={() => dispatch(setOpenModal(null))}
				/>
			)}

			{openModal === 'futures_isolated_transfer' && (
				<TransferIsolatedMarginModal
					defaultTab="withdraw"
					onDismiss={() => dispatch(setOpenModal(null))}
				/>
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
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		background-color: ${(props) => props.theme.colors.selectedTheme.button.fill};
	}
`;
