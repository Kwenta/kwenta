import React from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import Card from 'components/Card';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { Data, Subtitle } from '../common';
import { formatCurrency } from 'utils/formatters/number';
import { CurrencyKey, SYNTHS_MAP } from 'constants/currency';
import ChangePercent from 'components/ChangePercent';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import WarningIcon from 'assets/svg/app/liquidation-warning.svg';

export type Position = {
	position: {
		side: PositionSide;
		amount: number;
		currency: CurrencyKey;
	};
	price: number;
	liquidationPrice: number;
	margin: number;
	marginChange: number;
	riskOfLiquidation: boolean;
};

export enum PositionSide {
	LONG = 'long',
	SHORT = 'short',
}

type PositionCardProps = {
	position: Position;
};

const PositionCard: React.FC<PositionCardProps> = ({ position }) => {
	const { t } = useTranslation();

	return (
		<StyledCard>
			<StyledCardBody>
				<StyledFlexDivRowCentered>
					<StyledSubtitle>{t('futures.wallet-overview.positions.position.title')}</StyledSubtitle>
					<StyledFlexDivRow>
						<StyledCurrencyIcon currencyKey={position.position.currency} />
						<StyledData>
							{formatCurrency(position.position.currency, position.position.amount, { sign: '$' })}
						</StyledData>
						<PositionSideTag side={position.position.side}>
							{position.position.side}
						</PositionSideTag>
					</StyledFlexDivRow>
				</StyledFlexDivRowCentered>
				<StyledFlexDivRowCentered>
					<StyledSubtitle>{t('futures.wallet-overview.positions.price')}</StyledSubtitle>
					<Data>{formatCurrency(SYNTHS_MAP.sUSD, position.price, { sign: '$' })}</Data>
				</StyledFlexDivRowCentered>
				<StyledFlexDivRowCentered>
					<StyledFlexDivRow>
						<StyledSubtitle>{t('futures.wallet-overview.positions.liquidation')}</StyledSubtitle>
						{position.riskOfLiquidation && <StyledSvg src={WarningIcon} />}
					</StyledFlexDivRow>
					<Data>{formatCurrency(SYNTHS_MAP.sUSD, position.liquidationPrice, { sign: '$' })}</Data>
				</StyledFlexDivRowCentered>
				<StyledFlexDivRowCentered>
					<StyledSubtitle>{t('futures.wallet-overview.positions.pnl')}</StyledSubtitle>
					<StyledFlexDivRow>
						<StyledData>
							{formatCurrency(SYNTHS_MAP.sUSD, position.margin, { sign: '$' })}
						</StyledData>
						<ChangePercent value={position.marginChange} />
					</StyledFlexDivRow>
				</StyledFlexDivRowCentered>
			</StyledCardBody>
		</StyledCard>
	);
};
export default PositionCard;

const StyledCard = styled(Card)`
	margin-bottom: 16px;
`;

const StyledCardBody = styled(Card.Body)`
	padding: 4px ​12px;
	background: ${(props) => props.theme.colors.navy};
`;

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)`
	justify-content: space-between;
	margin-bottom: 4px;
`;

const StyledFlexDivRow = styled(FlexDivRow)`
	justify-content: flex-start;
	align-items: center;
`;

const StyledSubtitle = styled(Subtitle)``;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	margin-right: 4px;
`;

const StyledData = styled(Data)`
	margin-right: 4px;
`;

const StyledSvg = styled(Svg)`
	margin-left: 4px;
`;

const PositionSideTag = styled.div<{ side: PositionSide }>`
	color: ${(props) => props.theme.colors.navy};
	font-family: ${(props) => props.theme.fonts.bold};
	background: ${(props) =>
		props.side === PositionSide.LONG ? props.theme.colors.green : props.theme.colors.red};
	text-transform: uppercase;
	padding: 2px 4px;
`;
