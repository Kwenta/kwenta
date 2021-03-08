import { FC } from 'react';
import styled from 'styled-components';

import { SYNTHS_MAP } from 'constants/currency';

import media from 'styles/media';

import CRatioSelector from './components/CRatioSelector';

import useShort from '../hooks/useShort';

const ShortingCard: FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useShort({
		defaultBaseCurrencyKey: SYNTHS_MAP.sETH,
		defaultQuoteCurrencyKey: SYNTHS_MAP.sUSD,
	});

	return (
		<Container>
			<ConvertContainer>
				<ExchangeCards>
					{quoteCurrencyCard}
					{baseCurrencyCard}
					<CRatioSelectorContainer>
						<CRatioSelector />
					</CRatioSelectorContainer>
				</ExchangeCards>
				<ExchangeFooter>{footerCard}</ExchangeFooter>
			</ConvertContainer>
		</Container>
	);
};

const Container = styled.div`
	position: relative;
	margin-bottom: 30px;
`;

const ConvertContainer = styled.div``;

const CRatioSelectorContainer = styled.div`
	position: absolute;
	padding: 6px;
	border-radius: 4px;
	background: ${(props) => props.theme.colors.elderberry};
	border: 2px solid ${(props) => props.theme.colors.black};
	left: 50%;
	transform: translate(-50%, -50%);
	margin-left: -14px;
	width: 70px;
	top: 50%;
	margin-top: -3px;
	${media.lessThan('md')`
		margin-left: 0;
		margin-top: -14px;
	`}
`;

export const ExchangeFooter = styled.div`
	.footer-card {
		max-width: 1000px;
	}
`;

export const ExchangeCards = styled.div`
	position: relative;
	display: grid;
	grid-template-columns: auto auto;
	grid-gap: 2px;
	padding-bottom: 2px;
	width: 100%;
	margin: 0 auto;
	${media.lessThan('md')`
		grid-template-columns: unset;
		grid-template-rows: auto auto;
		padding-bottom: 24px;
	`}

	.currency-card {
		padding: 0 14px;
		${media.lessThan('md')`
			padding: unset;
		`}
		.currency-wallet-container {
			width: 90%;
			${media.lessThan('md')`
				width: 100%;
			`}
		}
	}
	.currency-card-base {
		.currency-card-body {
			position: relative;
			left: 30px;
			${media.lessThan('md')`
				left: unset;
			`}
		}
	}
`;

export default ShortingCard;
