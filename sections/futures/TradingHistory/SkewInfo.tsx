import StyledTooltip from 'components/Tooltip/StyledTooltip';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import * as _ from 'lodash/fp';
import { FuturesMarket } from 'queries/futures/types';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CapitalizedText, NumericValue } from 'styles/common';
import { formatCurrency, formatPercent } from 'utils/formatters/number';
import OpenInterestBar from './OpenInterestBar';

type SkewInfoProps = {
	currencyKey: string | undefined;
};

const SkewInfo: React.FC<SkewInfoProps> = ({ currencyKey }) => {
	const { t } = useTranslation();

	const futuresMarketsQuery = useGetFuturesMarkets();

	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const futuresMarkets = useMemo(() => futuresMarketsQuery?.data ?? [], [futuresMarketsQuery]);
	const data = useMemo(() => {
		return futuresMarkets.length > 0
			? futuresMarkets
					.filter((i: FuturesMarket) => i.asset === currencyKey)
					.map((i: FuturesMarket) => {
						const basePriceRate = _.defaultTo(0, Number(i.price));
						return {
							short: i.marketSize.eq(0)
								? 0
								: i.marketSize.sub(i.marketSkew).div('2').div(i.marketSize).toNumber(),
							long: i.marketSize.eq(0)
								? 0
								: i.marketSize.add(i.marketSkew).div('2').div(i.marketSize).toNumber(),
							shortValue: i.marketSize.eq(0)
								? 0
								: i.marketSize.sub(i.marketSkew).div('2').mul(basePriceRate).toNumber(),
							longValue: i.marketSize.eq(0)
								? 0
								: i.marketSize.add(i.marketSkew).div('2').mul(basePriceRate).toNumber(),
						};
					})
			: [
					{
						short: 0,
						long: 0,
						shortValue: 0,
						longValue: 0,
					},
			  ];
	}, [futuresMarkets, currencyKey]);

	const long = formatCurrency(selectedPriceCurrency.name, data[0].longValue, { sign: '$' });
	const short = formatCurrency(selectedPriceCurrency.name, data[0].shortValue, { sign: '$' });

	return (
		<SkewContainer>
			<SkewHeader>
				<SkewValue>{formatPercent(data[0].short, { minDecimals: 0 })}</SkewValue>
				<SkewTooltip
					preset="bottom"
					width={'310px'}
					height={'auto'}
					content={t('futures.market.history.skew-tooltip')}
				>
					<WithCursor cursor="help">
						<SkewLabel>{t('futures.market.history.skew-label')}</SkewLabel>
					</WithCursor>
				</SkewTooltip>
				<SkewValue>{formatPercent(data[0].long, { minDecimals: 0 })}</SkewValue>
			</SkewHeader>
			<OpenInterestBar skew={data} />
			<OpenInterestRow>
				<p className="red">{short}</p>
				<p className="green">{long}</p>
			</OpenInterestRow>
		</SkewContainer>
	);
};

export default SkewInfo;

const WithCursor = styled.div<{ cursor: 'help' }>`
	cursor: ${(props) => props.cursor};
`;

const OpenInterestRow = styled.div`
	display: flex;
	width: 100%;
	justify-content: space-between;
	line-height: 16px;
	padding-bottom: 10px;
	padding-top: 10px;
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.mono};

	:last-child {
		padding-bottom: 0;
	}
	.green {
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}
`;

const SkewTooltip = styled(StyledTooltip)`
	left: -30px;
	z-index: 2;
	padding: 10px;
`;

const SkewContainer = styled.div`
	display: flex;
	flex-direction: column;
	column-gap: 5px;
	align-items: center;

	width: 100%;
	height: auto;
	padding: 10px;
	margin-bottom: 16px;
	box-sizing: border-box;

	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	box-sizing: border-box;

	p,
	span {
		margin: 0;
		text-align: left;
	}

	.heading {
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.gray};
		width: 292px;
	}

	.value {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.button.text};
	}
`;

const SkewHeader = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 5px;
`;

const SkewLabel = styled(CapitalizedText)`
	text-align: center;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 13px;
`;

const SkewValue = styled(NumericValue)`
	text-align: center;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.mono};
`;
