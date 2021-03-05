import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import Etherscan from 'containers/Etherscan';

import Card from 'components/Card';

import ArrowRightIcon from 'assets/svg/app/arrow-right.svg';
import InfoIcon from 'assets/svg/app/info.svg';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { ShortPosition } from 'queries/collateral/useCollateralShortPositionQuery';

import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { formatDateWithTime } from 'utils/formatters/date';

import {
	FlexDivRow,
	ExternalLink,
	FlexDivRowCentered,
	InfoTooltip,
	InfoTooltipContent,
} from 'styles/common';
import media from 'styles/media';

import LinkIcon from 'assets/svg/app/link.svg';

import ProfitLoss from 'sections/shorting/components/ProfitLoss';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { getExchangeRatesForCurrencies } from 'utils/currencies';

import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';
import { NO_VALUE } from 'constants/placeholder';

import { ShortingTab } from './constants';
import { MIN_COLLATERAL_RATIO } from '../constants';

type PositionCardProps = {
	short: ShortPosition;
	inputAmount: string;
	activeTab: string;
};

const PositionCard: FC<PositionCardProps> = ({ short, inputAmount, activeTab }) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();
	const collateralShortContractInfoQuery = useCollateralShortContractInfoQuery();

	const isAddCollateralTab = useMemo(() => activeTab === ShortingTab.AddCollateral, [activeTab]);
	const isRemoveCollateralTab = useMemo(() => activeTab === ShortingTab.RemoveCollateral, [
		activeTab,
	]);
	const isCollateralTab = useMemo(() => isAddCollateralTab || isRemoveCollateralTab, [
		isAddCollateralTab,
		isRemoveCollateralTab,
	]);

	const isIncreasePositionTab = useMemo(() => activeTab === ShortingTab.IncreasePosition, [
		activeTab,
	]);
	const isDecreasePositionTab = useMemo(() => activeTab === ShortingTab.DecreasePosition, [
		activeTab,
	]);
	const isPositionTab = useMemo(() => isIncreasePositionTab || isDecreasePositionTab, [
		isIncreasePositionTab,
		isDecreasePositionTab,
	]);

	const collateralShortInfo = useMemo(
		() =>
			collateralShortContractInfoQuery.isSuccess
				? collateralShortContractInfoQuery.data ?? null
				: null,
		[collateralShortContractInfoQuery.isSuccess, collateralShortContractInfoQuery.data]
	);

	const minCollateralRatio = useMemo(
		() => collateralShortInfo?.minCollateralRatio ?? MIN_COLLATERAL_RATIO,
		[collateralShortInfo?.minCollateralRatio]
	);

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

	const inputChangePreview = useMemo(() => {
		if (inputAmount !== '') {
			let collateralLockedAmount = short.collateralLockedAmount;
			let synthBorrowedAmount = short.synthBorrowedAmount;

			if (isCollateralTab) {
				collateralLockedAmount = isAddCollateralTab
					? collateralLockedAmount.plus(inputAmount)
					: collateralLockedAmount.minus(inputAmount);
			}

			if (isPositionTab) {
				synthBorrowedAmount = isIncreasePositionTab
					? synthBorrowedAmount.plus(inputAmount)
					: synthBorrowedAmount.minus(inputAmount);
			}

			const collateralValue = collateralLockedAmount.multipliedBy(collateralLockedPrice);

			const liquidationPrice = collateralValue.dividedBy(
				synthBorrowedAmount.multipliedBy(minCollateralRatio)
			);

			return {
				collateralLockedAmount: collateralLockedAmount.isNegative()
					? zeroBN
					: collateralLockedAmount,
				collateralValue: collateralValue.isNegative() ? zeroBN : collateralValue,
				liquidationPrice: liquidationPrice.isNegative() ? zeroBN : liquidationPrice,
				synthBorrowedAmount: synthBorrowedAmount.isNegative() ? zeroBN : synthBorrowedAmount,
			};
		}
		return null;
	}, [
		inputAmount,
		collateralLockedPrice,
		isAddCollateralTab,
		isIncreasePositionTab,
		minCollateralRatio,
		short.collateralLockedAmount,
		short.synthBorrowedAmount,
		isCollateralTab,
		isPositionTab,
	]);

	const arrowIcon = (
		<ArrowIcon>
			<Svg src={ArrowRightIcon} viewBox={`0 0 ${ArrowRightIcon.width} ${ArrowRightIcon.height}`} />
		</ArrowIcon>
	);

	return (
		<StyledCard>
			<StyledCardHeader>
				{t('shorting.history.manage-short.subtitle')}
				{etherscanInstance != null && short.txHash && (
					<StyledExternalLink href={etherscanInstance.txLink(short.txHash)}>
						<StyledLinkIcon src={LinkIcon} viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`} />
					</StyledExternalLink>
				)}
			</StyledCardHeader>
			<StyledCardBody>
				<LeftCol>
					<Row>
						<LightFieldText>{t('shorting.history.manage-short.fields.collateral')}</LightFieldText>
						<DataField>
							{formatCurrency(short.collateralLocked, short.collateralLockedAmount, {
								currencyKey: short.collateralLocked,
							})}
							{isCollateralTab && inputChangePreview != null && (
								<>
									{arrowIcon}
									{formatCurrency(
										short.collateralLocked,
										inputChangePreview.collateralLockedAmount,
										{
											currencyKey: short.collateralLocked,
										}
									)}
								</>
							)}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manage-short.fields.liquidation-price')}
						</LightFieldText>
						<DataField>
							{formatCurrency(
								short.collateralLocked,
								selectPriceCurrencyRate != null
									? liquidationPrice.dividedBy(selectPriceCurrencyRate)
									: liquidationPrice,
								{
									currencyKey: short.synthBorrowed,
									sign: selectedPriceCurrency.sign,
								}
							)}
							{inputChangePreview != null && (
								<>
									{arrowIcon}
									{formatCurrency(
										short.collateralLocked,
										selectPriceCurrencyRate != null
											? inputChangePreview.liquidationPrice.dividedBy(selectPriceCurrencyRate)
											: inputChangePreview.liquidationPrice,
										{
											currencyKey: short.synthBorrowed,
											sign: selectedPriceCurrency.sign,
										}
									)}
								</>
							)}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manage-short.fields.interest-rate', {
								asset: short.synthBorrowed,
							})}
						</LightFieldText>
						<DataField>{formatPercent(0)}</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manage-short.fields.profit-loss', {
								asset: short.collateralLocked,
							})}
						</LightFieldText>
						<ProfitLoss
							value={
								selectPriceCurrencyRate != null
									? short.profitLoss?.dividedBy(selectPriceCurrencyRate)
									: short.profitLoss
							}
						/>
					</Row>
				</LeftCol>
				<RightCol>
					<Row>
						<LightFieldText>{t('shorting.history.manage-short.fields.shorting')}</LightFieldText>
						<DataField>
							{formatCurrency(short.synthBorrowed, short.synthBorrowedAmount, {
								currencyKey: short.synthBorrowed,
							})}
							{isPositionTab && inputChangePreview != null && (
								<>
									{arrowIcon}
									{formatCurrency(short.synthBorrowed, inputChangePreview.synthBorrowedAmount, {
										currencyKey: short.synthBorrowed,
									})}
								</>
							)}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manage-short.fields.collateral-ratio')}
						</LightFieldText>
						<DataField isPositive={short.collateralRatio.gt(minCollateralRatio)}>
							{formatPercent(short.collateralRatio)}{' '}
							<InfoTooltip
								content={
									<div>
										<div>{t('shorting.history.manage-short.collateral-ratio-tooltip.line1')}</div>
										<div>
											{t('shorting.history.manage-short.collateral-ratio-tooltip.line2', {
												percent: formatPercent(minCollateralRatio),
											})}
										</div>
									</div>
								}
								arrow={false}
							>
								<InfoTooltipContent>
									<Svg src={InfoIcon} />
								</InfoTooltipContent>
							</InfoTooltip>
						</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manage-short.fields.accrued-interest')}
						</LightFieldText>
						<DataField>
							{formatCurrency(short.synthBorrowed, short.accruedInterest ?? 0, {
								currencyKey: short.synthBorrowed,
							})}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>{t('shorting.history.manage-short.fields.date')}</LightFieldText>
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
	grid-template-columns: 1fr 1fr;

	${media.lessThan('md')`
		grid-template-columns: unset;
		grid-template-rows: 1fr 1fr;
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

const DataField = styled(FlexDivRowCentered)<{ isPositive?: boolean | null }>`
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

const ArrowIcon = styled.span`
	margin: 0 10px;
`;

export default PositionCard;
