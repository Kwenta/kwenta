import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { selectOrderType } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

const OrderWarning: React.FC = () => {
	const { t } = useTranslation();
	const orderType = useAppSelector(selectOrderType);

	return (
		<Container>
			<p className="description">
				{orderType === 'delayed offchain'
					? t('futures.market.trade.delayed-order.description')
					: t('futures.market.trade.market-order.description')}
			</p>
		</Container>
	);
};

const Container = styled.div`
	margin-bottom: 16px;

	.description {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
		margin: 0 8px;

		a {
			color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		}
	}
`;

export default OrderWarning;
