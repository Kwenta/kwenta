import { useTranslation } from 'react-i18next';
import { FC, useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';

import { CurrencyKey, MARKET_HOURS_SYNTHS } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';
import { FlexDivRowCentered } from 'styles/common';
import { formatCurrency } from 'utils/formatters/number';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Card from 'components/Card';
import useMarketHoursTimer from 'sections/exchange/hooks/useMarketHoursTimer';
import { marketNextTransition, marketIsOpen } from 'utils/marketHours';
import useSynthetixQueries from '@synthetixio/queries';

type MarketDetailsCardProps = {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	className?: string;
};

const MarketDetailsCard: FC<MarketDetailsCardProps> = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	...rest
}) => {
	const { t } = useTranslation();
	const pairCurrencyName = `${quoteCurrencyKey}/${baseCurrencyKey}`;
	const theme = useTheme();
	const [rates24High, setRates24High] = useState(0);
	const [rates24Low, setRates24Low] = useState(0);
	const { subgraph } = useSynthetixQueries();
	const yesterday = Math.floor(new Date().setDate(new Date().getDate() - 1) / 1000);
	const rates24hQuery = subgraph.useGetRateUpdates(
		{
			where: {
				synth: baseCurrencyKey === 'sUSD' ? quoteCurrencyKey : baseCurrencyKey,
				timestamp_gte: yesterday,
			},
			orderDirection: 'desc',
			orderBy: 'rate',
		},
		{ rate: true }
	);

	useEffect(() => {
		if (rates24hQuery.isSuccess && rates24hQuery.data.length) {
			setRates24Low(rates24hQuery.data[rates24hQuery.data.length - 1].rate.toNumber());
			setRates24High(rates24hQuery.data[0].rate.toNumber());
		}
	}, [rates24hQuery.data]);

	const quoteCurrencyMarketTimer = useMarketHoursTimer(
		marketNextTransition((quoteCurrencyKey as CurrencyKey) ?? '') ?? null
	);
	const quoteCurrencyMarketIsOpen = marketIsOpen((quoteCurrencyKey as CurrencyKey) ?? '');

	const baseCurrencyMarketTimer = useMarketHoursTimer(
		marketNextTransition((baseCurrencyKey as CurrencyKey) ?? '') ?? null
	);
	const baseCurrencyMarketIsOpen = marketIsOpen((baseCurrencyKey as CurrencyKey) ?? '');

	const rates24HighItem = (
		<Item>
			<Label>{t('exchange.market-details-card.24h-high')}</Label>
			<Value>
				{rates24High != null
					? `${formatCurrency(pairCurrencyName, rates24High, {
							minDecimals: 4,
					  })}`
					: NO_VALUE}
			</Value>
		</Item>
	);

	const rates24HLowItem = (
		<Item>
			<Label>{t('exchange.market-details-card.24h-low')}</Label>
			<Value>
				{rates24Low != null
					? `${formatCurrency(pairCurrencyName, rates24Low, {
							minDecimals: 4,
					  })}`
					: NO_VALUE}
			</Value>
		</Item>
	);

	return (
		<Card className="market-details-card" {...rest}>
			<StyledCardHeader lowercase>
				<CardHeaderItems>{t('exchange.market-details-card.title')}</CardHeaderItems>
				<CardHeaderItems>
					{quoteCurrencyKey &&
						MARKET_HOURS_SYNTHS.has(quoteCurrencyKey) &&
						quoteCurrencyKey !== 'sUSD' && (
							<MarketHoursStatus>
								<Dot
									background={quoteCurrencyMarketIsOpen ? theme.colors.green : theme.colors.red}
								/>
								{quoteCurrencyKey}{' '}
								{t(
									`exchange.market-details-card.${
										quoteCurrencyMarketIsOpen ? 'closes-in' : 'opens-in'
									}`
								)}{' '}
								<CountdownTimer>{quoteCurrencyMarketTimer}</CountdownTimer>
							</MarketHoursStatus>
						)}
					{baseCurrencyKey &&
						MARKET_HOURS_SYNTHS.has(baseCurrencyKey) &&
						baseCurrencyKey !== 'sUSD' && (
							<MarketHoursStatus>
								<Dot
									background={baseCurrencyMarketIsOpen ? theme.colors.green : theme.colors.red}
								/>
								{baseCurrencyKey}{' '}
								{t(
									`exchange.market-details-card.${
										baseCurrencyMarketIsOpen ? 'closes-in' : 'opens-in'
									}`
								)}{' '}
								<CountdownTimer>{baseCurrencyMarketTimer}</CountdownTimer>
							</MarketHoursStatus>
						)}
				</CardHeaderItems>
			</StyledCardHeader>
			<DesktopOnlyView>
				<StyledCardBody>
					<Column>{rates24HighItem}</Column>
					<Column>{rates24HLowItem}</Column>
				</StyledCardBody>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledCardBody>
					<Column>
						{rates24HighItem}
						{rates24HLowItem}
					</Column>
				</StyledCardBody>
			</MobileOrTabletView>
		</Card>
	);
};

const StyledCardBody = styled(Card.Body)`
	display: grid;
	grid-gap: 40px;
	grid-auto-flow: column;
	padding: 8px 18px;
`;

const StyledCardHeader = styled(Card.Header)`
	height: 40px;
	display: flex;
	justify-content: space-between;
`;

const CardHeaderItems = styled.div`
	line-height: 0.8;
	display: flex;
	justify-content: space-between;
`;

const MarketHoursStatus = styled.div``;

const CountdownTimer = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Item = styled(FlexDivRowCentered)`
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	padding: 8px 0;
`;

const Column = styled.div`
	${Item}:last-child {
		border-bottom: 0;
	}
`;

const Label = styled.div`
	text-transform: capitalize;
`;

const Value = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Dot = styled.span<{ background: string }>`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background-color: ${(props) => props.background};
	margin-left: 16px;
	margin-right: 6px;
`;

export default MarketDetailsCard;
