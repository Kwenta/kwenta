import React from 'react';
import styled from 'styled-components';
import { EXTERNAL_LINKS } from 'constants/links';

const NextPrice: React.FC = () => (
	<NextPriceContainer>
		<p className="next-price-description">
			Next-Price orders are subject to volatility and execute at the very next on-chain price.{' '}
			<a href={EXTERNAL_LINKS.Trade.NextPriceBlogPost} rel="noreferrer" target="_blank">
				Learn more ↗
			</a>
		</p>
	</NextPriceContainer>
);

const NextPriceContainer = styled.div`
	margin-bottom: 16px;

	.next-price-description {
		color: ${(props) => props.theme.colors.common.secondaryGray};
		margin: 0 8px;

		a {
			color: ${(props) => props.theme.colors.common.primaryWhite};
		}
	}
`;

export default NextPrice;
