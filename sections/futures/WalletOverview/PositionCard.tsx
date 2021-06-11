import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Card from 'components/Card';
import { FlexDivRowCentered } from 'styles/common';
import { Data, Subtitle } from '../common';
import { formatCurrency } from 'utils/formatters/number';
import { SYNTHS_MAP } from 'constants/currency';

export type Position = {
	position: {
		side: PositionSide;
		amount: number;
	};
	price: number;
	liquidationPrice: number;
	margin: number;
	marginChange: number;
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
					<Data>{formatCurrency(SYNTHS_MAP.sUSD, position.position.amount, { sign: '$' })}</Data>
				</StyledFlexDivRowCentered>
				<StyledFlexDivRowCentered>
					<StyledSubtitle>{t('futures.wallet-overview.positions.price')}</StyledSubtitle>
					<Data>{formatCurrency(SYNTHS_MAP.sUSD, position.price, { sign: '$' })}</Data>
				</StyledFlexDivRowCentered>
				<StyledFlexDivRowCentered>
					<StyledSubtitle>{t('futures.wallet-overview.positions.liquidation')}</StyledSubtitle>
					<Data>{formatCurrency(SYNTHS_MAP.sUSD, position.liquidationPrice, { sign: '$' })}</Data>
				</StyledFlexDivRowCentered>
				<StyledFlexDivRowCentered>
					<StyledSubtitle>{t('futures.wallet-overview.positions.pnl')}</StyledSubtitle>
					<Data>{formatCurrency(SYNTHS_MAP.sUSD, position.margin, { sign: '$' })}</Data>
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

const StyledSubtitle = styled(Subtitle)``;
