import React from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import { zeroBN } from 'utils/formatters/number';
import { useRecoilValue } from 'recoil';
import { positionState } from 'store/futures';

type MarketActionsProps = {
	marketClosed: boolean;
	openDepositModal(): void;
	openWithdrawModal(): void;
};

const MarketActions: React.FC<MarketActionsProps> = ({
	marketClosed,
	openDepositModal,
	openWithdrawModal,
}) => {
	const { t } = useTranslation();
	const position = useRecoilValue(positionState);

	return (
		<MarketActionsContainer>
			<MarketActionButton disabled={marketClosed} onClick={openDepositModal}>
				{t('futures.market.trade.button.deposit')}
			</MarketActionButton>
			<MarketActionButton
				disabled={position?.remainingMargin?.lte(zeroBN) || marketClosed}
				onClick={openWithdrawModal}
			>
				{t('futures.market.trade.button.withdraw')}
			</MarketActionButton>
		</MarketActionsContainer>
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
`;
