import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Wei from '@synthetixio/wei';

import Currency from 'components/Currency';
import ProgressBar from 'components/ProgressBar';

import { SynthBalance } from '@synthetixio/queries';

import { formatPercent } from 'utils/formatters/number';

import media from 'styles/media';
import { GridDivCentered } from 'styles/common';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import Connector from 'containers/Connector';
import { Synths } from 'constants/currency';

type DeprecatedSynthsTableRowProps = {
	synth: SynthBalance;
	totalUSDBalance: Wei;
};

const DeprecatedSynthsTableRow: FC<DeprecatedSynthsTableRowProps> = ({
	synth,
	totalUSDBalance,
}) => {
	const { t } = useTranslation();
	const { selectPriceCurrencyRate } = useSelectedPriceCurrency();

	const { synthsMap } = Connector.useContainer();

	const currencyKey = synth.currencyKey;
	const percent = synth.usdBalance.div(totalUSDBalance).toNumber();

	const synthDesc = synthsMap != null ? synthsMap[synth.currencyKey]?.description : '';

	const totalValue = synth.usdBalance;

	return (
		<>
			<Container>
				<div>
					<Currency.Name
						currencyKey={currencyKey}
						name={t('common.currency.synthetic-currency-name', { currencyName: synthDesc })}
						showIcon
						isDeprecated
					/>
				</div>
				<AmountCol>
					<Currency.Amount
						currencyKey={Synths.sUSD}
						amount={synth.usdBalance}
						totalValue={totalValue}
						conversionRate={selectPriceCurrencyRate}
						formatAmountOptions={{ minDecimals: 2, currencyKey: Synths.sUSD }}
						formatTotalValueOptions={{ minDecimals: 2 }}
						showTotalValue={false}
					/>{' '}
					{Synths.sUSD}
				</AmountCol>
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
`;

export default DeprecatedSynthsTableRow;
