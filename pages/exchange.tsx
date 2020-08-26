import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CurrencyKey } from 'constants/currency';
import { DEFAULT_BASE_SYNTH, DEFAULT_QUOTE_SYNTH } from 'constants/defaults';
import CurrencyCard from 'sections/exchange/CurrencyCard';
import { FlexDivCentered, resetButtonCSS } from 'styles/common';
import styled from 'styled-components';

import ArrowsIcon from 'assets/svg/app/arrows.svg';

const ExchangePage = () => {
	const { t } = useTranslation();

	const [baseCurrencyKey, setBaseCurrencyKey] = useState<CurrencyKey>(DEFAULT_BASE_SYNTH);
	const [baseCurrencyAmount, setBaseCurrencyAmount] = useState<string>('');
	const [quoteCurrencyKey, setQuoteCurrencyKey] = useState<CurrencyKey>(DEFAULT_QUOTE_SYNTH);
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useState<string>('');

	const walletBalances = {
		[baseCurrencyKey]: 0,
		[quoteCurrencyKey]: 0,
	};

	const swapCurrencies = () => {
		const base = baseCurrencyKey;
		const quote = quoteCurrencyKey;

		setBaseCurrencyKey(quote);
		setQuoteCurrencyKey(base);
	};

	return (
		<>
			<Head>
				<title>{t('exchange.page-title')}</title>
			</Head>
			<CardsContainer>
				<div>
					<CurrencyCard
						side="base"
						currencyKey={baseCurrencyKey}
						amount={baseCurrencyAmount}
						onAmounChange={(e) => setBaseCurrencyAmount(e.target.value)}
						walletBalance={walletBalances[baseCurrencyKey]}
					/>
				</div>
				<Spacer>
					<SwapCurrenciesButton onClick={swapCurrencies}>
						<ArrowsIcon />
					</SwapCurrenciesButton>
				</Spacer>
				<div>
					<CurrencyCard
						side="quote"
						currencyKey={quoteCurrencyKey}
						amount={quoteCurrencyAmount}
						onAmounChange={(e) => setQuoteCurrencyAmount(e.target.value)}
						walletBalance={walletBalances[quoteCurrencyKey]}
					/>
				</div>
			</CardsContainer>
		</>
	);
};

const CardsContainer = styled(FlexDivCentered)`
	justify-content: center;
`;

const Spacer = styled.div`
	padding: 0 16px;
`;

const SwapCurrenciesButton = styled.button`
	${resetButtonCSS};
	background-color: ${(props) => props.theme.colors.elderberry};
	color: ${(props) => props.theme.colors.white};
	height: 32px;
	width: 32px;
	border-radius: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export default ExchangePage;
