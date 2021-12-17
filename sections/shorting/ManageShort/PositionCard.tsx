import { FC, useMemo } from 'react';
import styled from 'styled-components';
import useSynthetixQueries from '@synthetixio/queries';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { BigNumber } from 'ethers';
import { wei } from '@synthetixio/wei';

import ArrowRightIcon from 'assets/svg/app/arrow-right.svg';
import BlockExplorer from 'containers/BlockExplorer';
import Card from 'components/Card';
import InfoIcon from 'assets/svg/app/info.svg';
import LinkIcon from 'assets/svg/app/link.svg';
import ProfitLoss from 'sections/shorting/components/ProfitLoss';
import media from 'styles/media';
import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import {
	FlexDivRow,
	ExternalLink,
	FlexDivRowCentered,
	InfoTooltip,
	InfoTooltipContent,
} from 'styles/common';
import { NO_VALUE } from 'constants/placeholder';
import { ShortPosition } from 'queries/collateral/useCollateralShortPositionQuery';
import { ShortingTab } from './constants';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { formatDateWithTime } from 'utils/formatters/date';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

type PositionCardProps = {
	short: ShortPosition;
	inputAmount: string;
	activeTab: string;
};

const PositionCard: FC<PositionCardProps> = ({ short, inputAmount, activeTab }) => {
	const { t } = useTranslation();
	const { blockExplorerInstance } = BlockExplorer.useContainer();

	const { useExchangeRatesQuery } = useSynthetixQueries();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();

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
	const collateralShortContractInfoQuery = useCollateralShortContractInfoQuery();

	const collateralShortInfo = useMemo(
		() =>
			collateralShortContractInfoQuery.isSuccess
				? collateralShortContractInfoQuery.data ?? null
				: null,
		[collateralShortContractInfoQuery.isSuccess, collateralShortContractInfoQuery.data]
	);

	const minCollateralRatio = useMemo(() => collateralShortInfo?.minCollateralRatio, [
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

	const liquidationPrice = useMemo(
		() =>
			short.synthBorrowedAmount && minCollateralRatio && short.synthBorrowedAmount.gt(0)
				? short.collateralLockedAmount
						.mul(collateralLockedPrice)
						.div(short.synthBorrowedAmount.mul(minCollateralRatio))
				: wei(0),
		[
			short.collateralLockedAmount,
			collateralLockedPrice,
			minCollateralRatio,
			short.synthBorrowedAmount,
		]
	);

	const inputChangePreview = useMemo(() => {
		if (inputAmount !== '') {
			let collateralLockedAmount = short.collateralLockedAmount;
			let synthBorrowedAmount = short.synthBorrowedAmount;

			if (isCollateralTab) {
				collateralLockedAmount = isAddCollateralTab
					? collateralLockedAmount.add(inputAmount)
					: collateralLockedAmount.sub(inputAmount);
			}

			if (isPositionTab) {
				synthBorrowedAmount = isIncreasePositionTab
					? synthBorrowedAmount.add(inputAmount)
					: synthBorrowedAmount.sub(inputAmount);
			}

			const collateralValue = collateralLockedAmount.mul(collateralLockedPrice);
			const liquidationPrice = synthBorrowedAmount.gt(0)
				? collateralValue.div(synthBorrowedAmount.mul(minCollateralRatio))
				: wei(0);

			return {
				collateralLockedAmount: collateralLockedAmount.lt(0) ? zeroBN : collateralLockedAmount,
				collateralValue: collateralValue.lt(0) ? zeroBN : collateralValue,
				liquidationPrice: liquidationPrice.lt(0) ? zeroBN : liquidationPrice,
				synthBorrowedAmount: synthBorrowedAmount.lt(0) ? zeroBN : synthBorrowedAmount,
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

	const liquidationPriceDisplayed = formatCurrency(
		short.collateralLocked,
		selectPriceCurrencyRate != null
			? liquidationPrice.div(selectPriceCurrencyRate)
			: liquidationPrice,
		{
			currencyKey: short.synthBorrowed,
			sign: selectedPriceCurrency.sign,
		}
	);
	const minCollateralRatioPct = useMemo(
		() => (minCollateralRatio ? formatPercent(minCollateralRatio) : ''),
		[minCollateralRatio]
	);

	return (
		<StyledCard>
			<StyledCardHeader>
				{t('shorting.history.manage-short.subtitle')}
				{blockExplorerInstance != null && short.txHash && (
					<StyledExternalLink href={blockExplorerInstance.txLink(short.txHash)}>
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
							{liquidationPriceDisplayed}
							{inputChangePreview != null && (
								<>
									{arrowIcon}
									{formatCurrency(
										short.collateralLocked,
										selectPriceCurrencyRate != null
											? inputChangePreview.liquidationPrice.div(selectPriceCurrencyRate)
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
									? short.profitLoss?.div(selectPriceCurrencyRate)
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
						<DataField
							isPositive={
								BigNumber.isBigNumber(minCollateralRatio)
									? short.collateralRatio.gt(minCollateralRatio)
									: null
							}
						>
							{formatPercent(short.collateralRatio)}{' '}
							<InfoTooltip
								content={
									<div>
										<div>{t('shorting.history.manage-short.collateral-ratio-tooltip.line1')}</div>
										<div>
											{t('shorting.history.manage-short.collateral-ratio-tooltip.line2', {
												percent: minCollateralRatioPct,
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
