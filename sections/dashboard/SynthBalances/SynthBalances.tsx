import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import synthetix, { Synth } from 'lib/synthetix';
import { useTranslation, Trans } from 'react-i18next';

import ROUTES from 'constants/routes';
import { SYNTHS_MAP } from 'constants/currency';

import Currency from 'components/Currency';
import ProgressBar from 'components/ProgressBar';
import Button from 'components/Button';

import { SynthBalance } from 'queries/walletBalances/useSynthsBalancesQuery';
import { Rates } from 'queries/rates/useExchangeRatesQuery';

import { formatPercent } from 'utils/formatters/number';

import media from 'styles/media';
import { GridDivCentered, NoTextTransform } from 'styles/common';

type SynthBalancesProps = {
	exchangeRates: Rates | null;
	balances: SynthBalance[];
	totalUSDBalance: number;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
};

const { sUSD } = SYNTHS_MAP;

const SynthBalances: FC<SynthBalancesProps> = ({
	exchangeRates,
	balances,
	totalUSDBalance,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
}) => {
	const { t } = useTranslation();

	if (balances.length === 0) {
		return (
			<NoBalancesContainer>
				<Message>
					<Trans
						t={t}
						i18nKey="exchange.onboard.message"
						values={{ currencyKey: sUSD }}
						components={[<NoTextTransform />]}
					/>
				</Message>
				<Link href={ROUTES.Dashboard.Convert}>
					<Button size="lg" variant="primary" isRounded={true}>
						<Trans
							t={t}
							i18nKey="common.currency.buy-currency"
							values={{ currencyKey: sUSD }}
							components={[<NoTextTransform />]}
						/>
					</Button>
				</Link>
			</NoBalancesContainer>
		);
	}

	return (
		<>
			{balances.map((synth: SynthBalance) => {
				const percent = synth.usdBalance / totalUSDBalance;
				const synthDesc =
					synthetix.synthsMap != null ? synthetix.synthsMap[synth.currencyKey]?.description : '';

				const totalValue = synth.usdBalance;
				const price = exchangeRates && exchangeRates[synth.currencyKey];

				return (
					<SynthBalanceRow key={synth.currencyKey}>
						<div>
							<Currency.Name
								currencyKey={synth.currencyKey}
								name={t('common.currency.synthetic-currency-name', { currencyName: synthDesc })}
								showIcon={true}
							/>
						</div>
						<AmountCol>
							<Currency.Amount
								currencyKey={synth.currencyKey}
								amount={synth.balance}
								totalValue={totalValue}
								sign={selectedPriceCurrency.sign}
								conversionRate={selectPriceCurrencyRate}
							/>
						</AmountCol>
						<ExchangeRateCol>
							{price != null && (
								<Currency.Price
									currencyKey={synth.currencyKey}
									price={price}
									sign={selectedPriceCurrency.sign}
									conversionRate={selectPriceCurrencyRate}
								/>
							)}
						</ExchangeRateCol>
						<SynthBalancePercentRow>
							<ProgressBar percentage={percent} />
							<TypeDataSmall>{formatPercent(percent)}</TypeDataSmall>
						</SynthBalancePercentRow>
					</SynthBalanceRow>
				);
			})}
		</>
	);
};

const SynthBalanceRow = styled.div`
	background: ${(props) => props.theme.colors.elderberry};
	padding: 12px 22px 12px 16px;
	margin-top: 2px;
	display: grid;
	grid-gap: 20px;
	justify-content: space-between;
	align-items: center;
	grid-template-columns: repeat(4, minmax(80px, 150px));
	${media.lessThan('md')`
		grid-template-columns: auto auto;
	`}
`;

const AmountCol = styled.div`
	justify-self: flex-end;
`;

const SynthBalancePercentRow = styled.div`
	${media.lessThan('md')`
		display: none;
	`}
`;

const ExchangeRateCol = styled.div`
	justify-self: flex-end;
	${media.lessThan('md')`
		display: none;
	`}
`;

const TypeDataSmall = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	margin-top: 5px;
`;

export const NoBalancesContainer = styled(GridDivCentered)`
	width: 100%;
	border-radius: 4px;
	grid-template-columns: 1fr auto;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 16px 32px;
	margin: 0 auto;
	${media.lessThan('md')`
		justify-items: center;
		grid-template-columns: unset;
		grid-gap: 30px;
	`}
`;

export const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
`;

export default SynthBalances;
