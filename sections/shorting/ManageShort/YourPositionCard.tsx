import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import Etherscan from 'containers/Etherscan';

import Card from 'components/Card';

import { SYNTHS_MAP } from 'constants/currency';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { ShortPosition } from 'queries/collateral/useCollateralShortPositionQuery';

import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { formatDateWithTime } from 'utils/formatters/date';

import { FlexDivRow, ExternalLink } from 'styles/common';
import media from 'styles/media';

import LinkIcon from 'assets/svg/app/link.svg';

import synthetix from 'lib/synthetix';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { getExchangeRatesForCurrencies } from 'utils/currencies';

import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';
import { NO_VALUE } from 'constants/placeholder';

type YourPositionCardProps = {
	short: ShortPosition;
};

const YourPositionCard: FC<YourPositionCardProps> = ({ short }) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const collateralShortContractInfoQuery = useCollateralShortContractInfoQuery();

	const collateralShortInfo = useMemo(
		() =>
			collateralShortContractInfoQuery.isSuccess
				? collateralShortContractInfoQuery.data ?? null
				: null,
		[collateralShortContractInfoQuery.isSuccess, collateralShortContractInfoQuery.data]
	);

	const minCollateralRatio = useMemo(() => collateralShortInfo?.minCollateralRatio ?? zeroBN, [
		collateralShortInfo?.minCollateralRatio,
	]);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const collateralLockedPrice = useMemo(
		() =>
			getExchangeRatesForCurrencies(
				exchangeRates,
				short.collateralLocked,
				selectedPriceCurrency.name
			),
		[exchangeRates, selectedPriceCurrency.name, short.collateralLocked]
	);

	const collateralValue = useMemo(
		() => short.collateralLockedAmount.multipliedBy(collateralLockedPrice),
		[short.collateralLockedAmount, collateralLockedPrice]
	);

	const liquidationPrice = useMemo(
		() => collateralValue.dividedBy(short.synthBorrowedAmount.multipliedBy(minCollateralRatio)),
		[collateralValue, short.synthBorrowedAmount, minCollateralRatio]
	);

	const isPositivePnL = useMemo(() => (short.profitLoss != null ? short.profitLoss.gt(0) : null), [
		short.profitLoss,
	]);

	return (
		<StyledCard>
			<StyledCardHeader>
				{t('shorting.history.manageShort.subtitle')}
				{etherscanInstance != null && short.txHash && (
					<StyledExternalLink href={etherscanInstance.txLink(short.txHash)}>
						<StyledLinkIcon src={LinkIcon} viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`} />
					</StyledExternalLink>
				)}
			</StyledCardHeader>
			<StyledCardBody>
				<LeftCol>
					<Row>
						<LightFieldText>{t('shorting.history.manageShort.fields.collateral')}</LightFieldText>
						<DataField>
							{formatCurrency(short.collateralLocked, short.collateralLockedAmount, {
								currencyKey: short.collateralLocked,
							})}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manageShort.fields.liquidationPrice')}
						</LightFieldText>
						<DataField>
							{formatCurrency(short.collateralLocked, liquidationPrice, {
								currencyKey: short.synthBorrowed,
								sign: selectedPriceCurrency.sign,
							})}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manageShort.fields.interestRate', {
								asset: short.synthBorrowed,
							})}
						</LightFieldText>
						<DataField>{formatPercent(0)}</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manageShort.fields.profitLoss', {
								asset: short.collateralLocked,
							})}
						</LightFieldText>
						<DataField isPositive={isPositivePnL}>
							{short.profitLoss != null ? (
								<>
									{isPositivePnL ? '+' : '-'}
									{formatCurrency(SYNTHS_MAP.sUSD, short.profitLoss, {
										sign: synthetix.synthsMap?.sUSD.sign,
									})}
								</>
							) : (
								NO_VALUE
							)}
						</DataField>
					</Row>
				</LeftCol>
				<RightCol>
					<Row>
						<LightFieldText>{t('shorting.history.manageShort.fields.shorting')}</LightFieldText>
						<DataField>
							{formatCurrency(short.synthBorrowed, short.synthBorrowedAmount, {
								currencyKey: short.synthBorrowed,
							})}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manageShort.fields.collateralRatio')}
						</LightFieldText>
						<DataField isPositive={short.collateralRatio.gt(minCollateralRatio)}>
							{formatPercent(short.collateralRatio)}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manageShort.fields.accruedInterest')}
						</LightFieldText>
						<DataField>
							{formatCurrency(short.synthBorrowed, short.accruedInterest ?? 0, {
								currencyKey: short.synthBorrowed,
							})}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>{t('shorting.history.manageShort.fields.date')}</LightFieldText>
						<DataField>
							{short.createdAt != null ? formatDateWithTime(short.createdAt) : NO_VALUE}
						</DataField>
					</Row>
				</RightCol>
			</StyledCardBody>
		</StyledCard>
	);
};

const StyledCard = styled(Card)`
	margin-bottom: 30px;
`;

const StyledCardHeader = styled(Card.Header)`
	height: 45px;
	justify-content: space-between;
`;

const StyledCardBody = styled(Card.Body)`
	padding: 0;
	display: grid;
	grid-gap: 20px;
	grid-auto-flow: column;

	${media.lessThan('md')`
		grid-auto-flow: row;
		grid-gap: unset;
	`}
`;

const StyledExternalLink = styled(ExternalLink)``;

const Row = styled(FlexDivRow)`
	padding: 10px 18px;
	border-bottom: 0.5px solid ${(props) => props.theme.colors.navy};
`;

const LeftCol = styled.div``;

const RightCol = styled.div`
	${Row} {
		&:last-child {
			border-bottom: none;
		}
	}
`;

const LightFieldText = styled.div`
	color: ${(props) => props.theme.colors.blueberry};
`;

const DataField = styled.div<{ isPositive?: boolean | null }>`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) =>
		props.isPositive != null
			? props.isPositive
				? props.theme.colors.green
				: props.theme.colors.red
			: props.theme.colors.white};
`;

const StyledLinkIcon = styled(Svg)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

export default YourPositionCard;
