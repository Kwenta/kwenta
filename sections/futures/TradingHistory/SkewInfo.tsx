import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { FuturesMarket } from 'queries/futures/types';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CapitalizedText, NumericValue } from 'styles/common';
import { formatPercent } from 'utils/formatters/number';
import { HoverTransform } from '../MarketDetails/MarketDetails';
import OpenInterestBar from './OpenInterestBar';

type SkewInfoProps = {
	currencyKey: string | undefined;
};

const SkewInfo: React.FC<SkewInfoProps> = ({ currencyKey }) => {
	const { t } = useTranslation();
	const futuresMarketsQuery = useGetFuturesMarkets();

	const data = useMemo(() => {
		const futuresMarkets = futuresMarketsQuery?.data ?? [];
		return futuresMarkets.length > 0
			? futuresMarkets
					.filter((i: FuturesMarket) => i.asset === currencyKey)
					.map((i: FuturesMarket) => {
						return {
							short: i.marketSize.eq(0)
								? 0
								: i.marketSize.sub(i.marketSkew).div('2').div(i.marketSize).toNumber(),
							long: i.marketSize.eq(0)
								? 0
								: i.marketSize.add(i.marketSkew).div('2').div(i.marketSize).toNumber(),
						};
					})
			: [
					{
						short: 0,
						long: 0,
					},
			  ];
	}, [futuresMarketsQuery, currencyKey]);

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
					<HoverTransform>
						<SkewLabel>{t('futures.market.history.skew-label')}</SkewLabel>
					</HoverTransform>
				</SkewTooltip>
				<SkewValue>{formatPercent(data[0].long, { minDecimals: 0 })}</SkewValue>
			</SkewHeader>
			<OpenInterestBar skew={data} />
		</SkewContainer>
	);
};

export default SkewInfo;

const SkewTooltip = styled(StyledTooltip)`
	left: -30px;
	z-index: 2;
`;

const SkewContainer = styled.div`
	display: flex;
	flex-direction: column;
	column-gap: 5px;
	align-items: center;

	width: 100%;
	height: 55px;
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
		font-size: 12px;
		color: ${(props) => props.theme.colors.common.secondaryGray};
		width: 292px;
	}

	.value {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 12px;
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}
`;

const SkewHeader = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 10px;
`;

const SkewLabel = styled(CapitalizedText)`
	text-align: center;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const SkewValue = styled(NumericValue)`
	text-align: center;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-family: ${(props) => props.theme.fonts.mono};
`;
