import { FC } from 'react';
import styled from 'styled-components';
import synthetix, { Synth } from 'lib/synthetix';

import Currency from 'components/Currency';
import ProgressBar from 'components/ProgressBar';

import { SynthBalance } from 'queries/walletBalances/useSynthsBalancesQuery';
import { Rates } from 'queries/rates/useExchangeRatesQuery';

import { fonts } from 'styles/theme/fonts';
import { formatPercent } from 'utils/formatters/number';
import media from 'styles/media';

type SynthBalancesProps = {
	exchangeRates: Rates | null;
	balances: SynthBalance[];
	totalUSDBalance: number;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
};

const SynthBalances: FC<SynthBalancesProps> = ({
	exchangeRates,
	balances,
	totalUSDBalance,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
}) => (
	<>
		{balances.map((synth: SynthBalance) => {
			const percent = synth.usdBalance / totalUSDBalance;
			const synthDesc =
				synthetix.synthsMap != null ? synthetix.synthsMap[synth.currencyKey]?.desc : '';

			let totalValue = synth.usdBalance;
			if (selectPriceCurrencyRate) {
				totalValue /= selectPriceCurrencyRate;
			}

			let price = exchangeRates && exchangeRates[synth.currencyKey];
			if (price != null && selectPriceCurrencyRate != null) {
				price /= selectPriceCurrencyRate;
			}

			return (
				<SynthBalanceRow key={synth.currencyKey}>
					<div>
						<Currency.Name currencyKey={synth.currencyKey} name={synthDesc} showIcon={true} />
					</div>
					<AmountCol>
						<Currency.Amount
							currencyKey={synth.currencyKey}
							amount={synth.balance}
							totalValue={totalValue}
							sign={selectedPriceCurrency.sign}
						/>
					</AmountCol>
					<ExchangeRateCol>
						{price != null && (
							<Currency.Price
								currencyKey={synth.currencyKey}
								price={price}
								sign={selectedPriceCurrency.sign}
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

const SynthBalanceRow = styled.div`
	background: ${(props) => props.theme.colors.elderberry};
	padding: 12px 22px 12px 16px;
	margin-top: 2px;
	display: grid;
	grid-gap: 20px;
	justify-content: space-between;
	align-items: center;
	grid-template-columns: repeat(4, minmax(120px, 150px));
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
	${fonts.data.small}
	margin-top: 5px;
`;

export default SynthBalances;
