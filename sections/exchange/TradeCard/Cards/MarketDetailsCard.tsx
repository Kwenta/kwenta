import { useTranslation, Trans } from 'react-i18next';
import { FC } from 'react';
import styled from 'styled-components';
import { CurrencyKey, Synths } from 'constants/currency';

import Etherscan from 'containers/Etherscan';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Card from 'components/Card';

import { NO_VALUE } from 'constants/placeholder';
import { Period } from 'constants/period';

import { FlexDivRowCentered, NoTextTransform, ExternalLink } from 'styles/common';

import { truncateAddress } from 'utils/formatters/string';
import { formatCurrency } from 'utils/formatters/number';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
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
			rates24High /= selectPriceCurrencyRate;
		}
		if (rates24Low) {
			rates24Low /= selectPriceCurrencyRate;
		}
		if (volume24H) {
			volume24H = getPriceAtCurrentRate(volume24H);
		}
		if (marketCap) {
			marketCap = getPriceAtCurrentRate(marketCap);
		}
	}

	const token = tokensMap != null && currencyKey != null ? tokensMap[currencyKey] : null;

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
							minDecimals:
								/*currencyKey === SYNTHS_MAP.sKRW || */ currencyKey === Synths.sJPY ? 4 : 2,
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
			<StyledCardHeader>{t('exchange.market-details-card.title')}</StyledCardHeader>
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

export default MarketDetailsCard;
