import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import useGetCrossMarginAccountOverview from 'queries/futures/useGetCrossMarginAccountOverview';
import { zeroBN } from 'utils/formatters/number';

import CrossMarginOnboard from '../CrossMarginOnboard';

const CrossMarginAccountActions: React.FC = () => {
	const { t } = useTranslation();
	const [openModal, setOpenModal] = React.useState<'deposit' | 'withdraw' | null>(null);

	const query = useGetCrossMarginAccountOverview();
	const freeMargin = query.data?.freeMargin || zeroBN;

	return (
		<>
			<MarketActionsContainer>
				<MarketActionButton onClick={() => setOpenModal('deposit')} noOutline>
					{t('futures.market.trade.button.deposit')}
				</MarketActionButton>
				<MarketActionButton
					disabled={freeMargin.lte(zeroBN)}
					onClick={() => setOpenModal('withdraw')}
					noOutline
				>
					{t('futures.market.trade.button.withdraw')}
				</MarketActionButton>
			</MarketActionsContainer>
			{openModal === 'deposit' && (
				<CrossMarginOnboard isOpen={openModal === 'deposit'} onClose={() => setOpenModal(null)} />
			)}
		</>
	);
};

export default CrossMarginAccountActions;

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
