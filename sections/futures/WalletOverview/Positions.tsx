import { SYNTHS_MAP } from 'constants/currency';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivCol } from 'styles/common';
import { Subheader } from '../common';
import PositionCard, { PositionSide } from './PositionCard';

type PositionsProps = {};

const Positions: React.FC<PositionsProps> = ({}) => {
	const { t } = useTranslation();

	const userPositions = [
		{
			position: {
				side: PositionSide.LONG,
				amount: 1000,
				currency: SYNTHS_MAP.sBTC,
			},
			price: 2500,
			liquidationPrice: 2000,
			margin: 10000,
			marginChange: 0.2,
			riskOfLiquidation: false,
		},
		{
			position: {
				side: PositionSide.SHORT,
				amount: 1500,
				currency: SYNTHS_MAP.sETH,
			},
			price: 2500,
			liquidationPrice: 3000,
			margin: 5321,
			marginChange: -0.33,
			riskOfLiquidation: true,
		},
	];

	return (
		<FlexDivCol>
			<StyledSubheader>{t('futures.wallet-overview.positions.title')}</StyledSubheader>
			{userPositions.map((position, i) => (
				<PositionCard key={i} position={position} />
			))}
		</FlexDivCol>
	);
};
export default Positions;

const StyledSubheader = styled(Subheader)`
	margin-bottom: 16px;
`;
