import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const DelayedOrderWarning: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Container>
			<p className="description">
				{t('futures.market.trade.delayed-order.description')} {/* TODO: Add link to blog */}
				{/* <a href={EXTERNAL_LINKS.Trade.NextPriceBlogPost} rel="noreferrer" target="_blank">
					{t('futures.market.trade.next-price.learn-more')} ↗
				</a> */}
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

export default DelayedOrderWarning;
