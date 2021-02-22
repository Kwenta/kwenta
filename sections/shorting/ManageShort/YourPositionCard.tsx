import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import Etherscan from 'containers/Etherscan';

import Card from 'components/Card';

import { Short } from 'queries/short/types';

import { formatCurrency, formatNumber, formatPercent } from 'utils/formatters/number';
import { formatDateWithTime } from 'utils/formatters/date';

import { FlexDivRow, ExternalLink } from 'styles/common';
import media from 'styles/media';

import LinkIcon from 'assets/svg/app/link.svg';

import synthetix from 'lib/synthetix';

import { SHORT_C_RATIO } from '../ShortingCard/components/CRatioSelector/CRatioSelector';

import { NO_VALUE } from 'constants/placeholder';
import { SYNTHS_MAP } from 'constants/currency';

interface YourPositionCardProps {
	short: Short;
}

const YourPositionCard: FC<YourPositionCardProps> = ({ short }) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();

	const collateralValue = useMemo(
		() => short.collateralLockedAmount * short.collateralLockedPrice,
		[short.collateralLockedAmount, short.collateralLockedPrice]
	);

	const collateralCRatio = useMemo(
		() => collateralValue / (short.synthBorrowedAmount * short.synthBorrowedPrice),
		[collateralValue, short.synthBorrowedAmount, short.synthBorrowedPrice]
	);

	const liquidationPrice = useMemo(
		() => collateralValue / (short.synthBorrowedAmount * (short.contractData?.minCratio ?? 0)),
		[collateralValue, short.synthBorrowedAmount, short.contractData?.minCratio]
	);

	// TOOD: confirm when this should be positive/negative
	const positiveCollateralCRatio = useMemo(() => collateralCRatio > SHORT_C_RATIO.highRisk, [
		collateralCRatio,
	]);

	// TODO: implement
	const PnL = 1;

	const isPositivePnL = useMemo(() => PnL > 0, [PnL]);

	return (
		<StyledCard>
			<StyledCardHeader>
				{t('shorting.history.manageShort.subtitle')}
				{etherscanInstance != null && short.txHash ? (
					<StyledExternalLink href={etherscanInstance.txLink(short.txHash)}>
						<StyledLinkIcon src={LinkIcon} viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`} />
					</StyledExternalLink>
				) : (
					NO_VALUE
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
								currencyKey: short.collateralLocked,
							})}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manageShort.fields.interestRate', {
								asset: short.synthBorrowed,
							})}
						</LightFieldText>
						<DataField>{formatNumber(0)}</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manageShort.fields.profitLoss', {
								asset: short.collateralLocked,
							})}
						</LightFieldText>
						{/* 
				      need to put profit loss here. this is just a placeholder for now
				    */}
						<DataField positive={isPositivePnL}>
							{isPositivePnL ? '+' : '-'}
							{formatCurrency(SYNTHS_MAP.sUSD, 1, { sign: synthetix.synthsMap?.sUSD.sign })}
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
						<DataField positive={positiveCollateralCRatio}>
							{formatPercent(collateralCRatio)}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>
							{t('shorting.history.manageShort.fields.interestAccrued')}
						</LightFieldText>
						<DataField>
							{formatCurrency(short.synthBorrowed, short.interestAccrued ?? 0, {
								currencyKey: short.synthBorrowed,
							})}
						</DataField>
					</Row>
					<Row>
						<LightFieldText>{t('shorting.history.manageShort.fields.date')}</LightFieldText>
						<DataField>{formatDateWithTime(short.createdAt)}</DataField>
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

const DataField = styled.div<{ positive?: boolean }>`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) =>
		props.positive != null
			? props.positive
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
