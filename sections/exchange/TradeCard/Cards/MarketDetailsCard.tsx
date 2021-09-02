import { useTranslation, Trans } from 'react-i18next';
import { FC } from 'react';
import styled, { useTheme } from 'styled-components';
import { CurrencyKey, MARKET_HOURS_SYNTHS, Synths } from 'constants/currency';

import Etherscan from 'containers/Etherscan';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Card from 'components/Card';

import { NO_VALUE } from 'constants/placeholder';
import { Period } from 'constants/period';

import { FlexDivRowCentered, NoTextTransform, ExternalLink } from 'styles/common';

import { truncateAddress } from 'utils/formatters/string';
import { formatCurrency } from 'utils/formatters/number';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useMarketHoursTimer from 'sections/exchange/hooks/useMarketHoursTimer';
import { marketIsOpen, marketNextTransition } from 'utils/marketHours';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';

type MarketDetailsCardProps = {
	currencyKey: CurrencyKey | null;
	priceRate: number | null;
	className?: string;
};

const MarketDetailsCard: FC<MarketDetailsCardProps> = ({ currencyKey, priceRate, ...rest }) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const { tokensMap } = Connector.useContainer();

	const {
		useHistoricalVolumeQuery,
		useHistoricalRatesQuery,
		useSynthMarketCapQuery,
	} = useSynthetixQueries();

	const {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	} = useSelectedPriceCurrency();
	const theme = useTheme();

	const vol24HQuery = useHistoricalVolumeQuery(Period.ONE_DAY);
	const historicalRates24HQuery = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY);
	const synthMarketCapQuery = useSynthMarketCapQuery(currencyKey);

	let marketCap = synthMarketCapQuery.isSuccess ? synthMarketCapQuery.data ?? null : null;
	let rates24High = historicalRates24HQuery.isSuccess
		? historicalRates24HQuery.data?.high ?? null
		: null;
	let rates24Low = historicalRates24HQuery.isSuccess
		? historicalRates24HQuery.data?.low ?? null
		: null;
	let volume24H =
		vol24HQuery.isSuccess && currencyKey != null
			? (vol24HQuery.data && vol24HQuery.data[currencyKey]) ?? null
			: null;

	if (selectPriceCurrencyRate != null) {
		if (rates24High) {
			rates24High /= selectPriceCurrencyRate.toNumber();
		}
		if (rates24Low) {
			rates24Low /= selectPriceCurrencyRate.toNumber();
		}
		if (volume24H) {
			volume24H = getPriceAtCurrentRate(volume24H);
		}
		if (marketCap) {
			marketCap = getPriceAtCurrentRate(marketCap);
		}
	}

	const token = tokensMap != null && currencyKey != null ? tokensMap[currencyKey] : null;

	const timer = useMarketHoursTimer(
		marketNextTransition((currencyKey as CurrencyKey) ?? '') ?? null
	);
	const isOpen = marketIsOpen((currencyKey as CurrencyKey) ?? '');

	const volume24HItem = (
		<Item>
			<Label>{t('exchange.market-details-card.24h-vol')}</Label>
			<Value>
				{volume24H != null
					? formatCurrency(selectedPriceCurrency.name, volume24H, {
							sign: selectedPriceCurrency.sign,
					  })
					: NO_VALUE}
			</Value>
		</Item>
	);

	const rates24HighItem = (
		<Item>
			<Label>{t('exchange.market-details-card.24h-high')}</Label>
			<Value>
				{rates24High != null
					? `${formatCurrency(selectedPriceCurrency.name, rates24High, {
							sign: selectedPriceCurrency.sign,
							// TODO: use Synths.sKRW after Synths are corrected
							minDecimals:
								currencyKey === ('sKRW' as CurrencyKey) || currencyKey === Synths.sJPY ? 4 : 2,
					  })}`
					: NO_VALUE}
			</Value>
		</Item>
	);

	const tokenAddressItem = (
		<Item>
			<Label>
				{token?.address ? (
					<Trans
						i18nKey="common.currency.currency-contract"
						values={{ currencyKey }}
						components={[<NoTextTransform />]}
					/>
				) : (
					t('common.contract')
				)}
			</Label>
			<Value>
				{token?.address && etherscanInstance != null ? (
					<ExternalLink href={etherscanInstance.tokenLink(token.address)}>
						{truncateAddress(token.address, 6, 4)}
					</ExternalLink>
				) : (
					NO_VALUE
				)}
			</Value>
		</Item>
	);

	const marketCapItem = (
		<Item>
			<Label>{t('exchange.market-details-card.market-cap')}</Label>
			<Value>
				{marketCap != null
					? formatCurrency(selectedPriceCurrency.name, marketCap, {
							sign: selectedPriceCurrency.sign,
					  })
					: NO_VALUE}
			</Value>
		</Item>
	);

	const rates24HLowItem = (
		<Item>
			<Label>{t('exchange.market-details-card.24h-low')}</Label>
			<Value>
				{rates24Low != null
					? `${formatCurrency(selectedPriceCurrency.name, rates24Low, {
							sign: selectedPriceCurrency.sign,
							minDecimals: /*currencyKey === Synths.sKRW || */ currencyKey === Synths.sJPY ? 4 : 2,
					  })}`
					: NO_VALUE}
			</Value>
		</Item>
	);

	const priceFeedItem = (
		<Item>
			<Label>{t('exchange.market-details-card.price-feed')}</Label>
			<Value>
				{token?.feed != null && etherscanInstance != null ? (
					<ExternalLink href={etherscanInstance.tokenLink(token.feed)}>
						{truncateAddress(token.feed, 6, 4)}
					</ExternalLink>
				) : (
					NO_VALUE
				)}
			</Value>
		</Item>
	);

	return (
		<Card className="market-details-card" {...rest}>
			<StyledCardHeader lowercase={true}>
				<CardHeaderItems>{t('exchange.market-details-card.title')}</CardHeaderItems>
				<CardHeaderItems>
					{currencyKey && MARKET_HOURS_SYNTHS.has(currencyKey) && currencyKey !== 'sUSD' && (
						<>
							<Dot background={isOpen ? theme.colors.green : theme.colors.red} />
							{t(`exchange.market-details-card.${isOpen ? 'closes-in' : 'opens-in'}`)}{' '}
							<CountdownTimer>{timer}</CountdownTimer>
						</>
					)}
				</CardHeaderItems>
			</StyledCardHeader>
			<DesktopOnlyView>
				<StyledCardBody>
					<Column>
						{volume24HItem}
						{rates24HighItem}
						{tokenAddressItem}
					</Column>
					<Column>
						{marketCapItem}
						{rates24HLowItem}
						{priceFeedItem}
					</Column>
				</StyledCardBody>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledCardBody>
					<Column>
						{volume24HItem}
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

const CountdownTimer = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Dot = styled.span<{ background: string }>`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background-color: ${(props) => props.background};
	margin-right: 6px;
`;

export default MarketDetailsCard;
