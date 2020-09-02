import { useTranslation, Trans } from 'react-i18next';
import { FC } from 'react';
import styled from 'styled-components';
import { USD_SIGN, CurrencyKey } from 'constants/currency';

import Card from 'components/Card';

import { NO_VALUE } from 'constants/placeholder';
import { Period } from 'constants/period';

import { FlexDivRowCentered, NoTextTransform, ExternalLink } from 'styles/common';

import { truncateAddress } from 'utils/formatters/string';
import { formatFiatCurrency } from 'utils/formatters/number';

import useHistoricalVolumeQuery from 'queries/rates/useHistoricalVolumeQuery';
import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';

import synthetix, { Token } from 'lib/synthetix';
import Etherscan from 'containers/Etherscan';
import { get } from 'lodash';

type MarketDetailsCardProps = {
	currencyKey: CurrencyKey | null;
};

const MarketDetailsCard: FC<MarketDetailsCardProps> = ({ currencyKey }) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();

	const volume24H = useHistoricalVolumeQuery(currencyKey, Period.ONE_DAY);
	const historicalRates24H = useHistoricalRatesQuery(currencyKey, Period.ONE_DAY);

	const rates24High = historicalRates24H.data?.high ?? null;
	const rates24Low = historicalRates24H.data?.low ?? null;
	const marketCapUSD = null;

	const token =
		synthetix.tokensMap != null && currencyKey != null ? synthetix.tokensMap[currencyKey] : null;

	return (
		<StyledCard>
			<Card.Header>{t('exchange.market-details-card.title')}</Card.Header>
			<StyledCardBody>
				<Column>
					<Item>
						<Label>{t('exchange.market-details-card.24h-vol')}</Label>
						<Value>
							{volume24H.data != null
								? formatFiatCurrency(volume24H.data, { sign: USD_SIGN })
								: NO_VALUE}
						</Value>
					</Item>
					<Item>
						<Label>{t('exchange.market-details-card.24h-high')}</Label>
						<Value>
							{rates24High != null
								? `${formatFiatCurrency(rates24High, { sign: USD_SIGN })}`
								: NO_VALUE}
						</Value>
					</Item>
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
				</Column>
				<Column>
					<Item>
						<Label>{t('exchange.market-details-card.market-cap')}</Label>
						<Value>
							{marketCapUSD != null
								? formatFiatCurrency(marketCapUSD, { sign: USD_SIGN })
								: NO_VALUE}
						</Value>
					</Item>
					<Item>
						<Label>{t('exchange.market-details-card.24h-low')}</Label>
						<Value>
							{rates24Low != null
								? `${formatFiatCurrency(rates24Low, { sign: USD_SIGN })}`
								: NO_VALUE}
						</Value>
					</Item>
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
				</Column>
			</StyledCardBody>
		</StyledCard>
	);
};

const StyledCard = styled(Card)`
	max-width: 618px;
	width: 100%;
`;

const StyledCardBody = styled(Card.Body)`
	display: grid;
	grid-gap: 40px;
	grid-auto-flow: column;
	padding: 0 18px;
`;

const Item = styled(FlexDivRowCentered)`
	border-bottom: 1px solid #282834;
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
