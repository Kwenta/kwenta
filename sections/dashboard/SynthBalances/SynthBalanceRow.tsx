import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Wei from '@synthetixio/wei';

import Currency from 'components/Currency';
import ProgressBar from 'components/ProgressBar';

import { Period, PERIOD_IN_HOURS } from 'constants/period';
import { ethers } from 'ethers';

import useSynthetixQueries, { Rates, SynthBalance } from '@synthetixio/queries';

import { formatPercent } from 'utils/formatters/number';

import media from 'styles/media';
import { GridDivCentered } from 'styles/common';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import Connector from 'containers/Connector';

import { calculateTimestampForPeriod } from 'utils/formatters/date';

import { getMinAndMaxRate, calculateRateChange } from 'queries/rates/utils';

export type SynthBalanceRowProps = {
	exchangeRates: Rates | null;
	synth: SynthBalance;
	totalUSDBalance: Wei;
};

const SynthBalanceRow: FC<SynthBalanceRowProps> = ({ exchangeRates, synth, totalUSDBalance }) => {
	const { t } = useTranslation();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const { exchanges } = useSynthetixQueries();
	const { synthsMap } = Connector.useContainer();

	// const { useHistoricalRatesQuery } = useSynthetixQueries();

	const currencyKey = synth.currencyKey;
	const percent = synth.usdBalance.div(totalUSDBalance).toNumber();

	const synthDesc = synthsMap != null ? synthsMap[synth.currencyKey]?.description : '';

	const totalValue = synth.usdBalance;
	const price = exchangeRates && exchangeRates[synth.currencyKey];
	// return <div>hi</div>;
	// const historicalRates = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY);
	const twentyFourHoursAgo = useMemo(
		() => calculateTimestampForPeriod(PERIOD_IN_HOURS.ONE_DAY),
		[]
	);

	const historicalRatesQuery = exchanges.useGetRateUpdates(
		{
			first: Number.MAX_SAFE_INTEGER,
			where: {
				timestamp_gte: twentyFourHoursAgo,
				synth: ethers.utils.formatBytes32String(currencyKey),
			},
		},
		{
			id: true,
			currencyKey: true,
			synth: true,
			rate: true,
			block: true,
			timestamp: true,
		}
	);

	const historicalRates = historicalRatesQuery.isSuccess ? historicalRatesQuery.data : [];

	const [low, high] = getMinAndMaxRate(historicalRates);
	const change = calculateRateChange(historicalRates); // KM-NOTE: update the fn with the one from js-monorepo. confirm it still works
	const rates = {
		rates: historicalRates.reverse(),
		low,
		high,
		change,
	};

	return (
		<>
			<Container>
				<div>
					<Currency.Name
						currencyKey={currencyKey}
						name={t('common.currency.synthetic-currency-name', { currencyName: synthDesc })}
						showIcon={true}
					/>
				</div>
				<AmountCol>
					<Currency.Amount
						currencyKey={currencyKey}
						amount={synth.balance}
						totalValue={totalValue}
						sign={selectedPriceCurrency.sign}
						conversionRate={selectPriceCurrencyRate}
						formatAmountOptions={{ minDecimals: 4 }}
						formatTotalValueOptions={{ minDecimals: 2 }}
					/>
				</AmountCol>
				<ExchangeRateCol>
					{price != null && (
						<Currency.Price
							currencyKey={currencyKey}
							price={price}
							sign={selectedPriceCurrency.sign}
							conversionRate={selectPriceCurrencyRate}
							change={rates.change}
						/>
					)}
				</ExchangeRateCol>
				<SynthBalancePercentRow>
					<ProgressBar percentage={percent} />
					<TypeDataSmall>{formatPercent(percent)}</TypeDataSmall>
				</SynthBalancePercentRow>
			</Container>
		</>
	);
};

const Container = styled.div`
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

export default SynthBalanceRow;
