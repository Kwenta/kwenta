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
			},
			price: 2500,
			liquidationPrice: 2000,
			margin: 10000,
			marginChange: -8,
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
