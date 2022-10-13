import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { EXTERNAL_LINKS } from 'constants/links';

const NextPrice: React.FC = () => {
	const { t } = useTranslation();

	return (
		<NextPriceContainer>
			<p className="next-price-description">
				{t('futures.market.trade.next-price.description')}{' '}
				<a href={EXTERNAL_LINKS.Trade.NextPriceBlogPost} rel="noreferrer" target="_blank">
					{t('futures.market.trade.next-price.learn-more')} ↗
				</a>
			</p>
		</NextPriceContainer>
	);
};

const NextPriceContainer = styled.div`
	margin-bottom: 16px;

	.next-price-description {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
		margin: 0 8px;

		a {
			color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		}
	}
`;

export default NextPrice;
