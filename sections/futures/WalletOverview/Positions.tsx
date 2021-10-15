import { Synths } from 'constants/currency';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { FuturesPosition } from 'queries/futures/types';

import ROUTES from 'constants/routes';
import { FlexDivCol } from 'styles/common';
import { Subheader } from '../common';
import { PositionSide } from '../types';
import PositionCard from './PositionCard';

import Button from 'components/Button';
import { wei } from '@synthetixio/wei';
import { CurrencyKey } from 'constants/currency';

type PositionsProps = {
	positions: FuturesPosition[] | null;
};

const DEFAULT_ASSET = Synths.sBTC;

const Positions: React.FC<PositionsProps> = ({ positions }) => {
	const { t } = useTranslation();
	const router = useRouter();

	const defaultPosition = {
		asset: Synths.sBTC,
		order: null,
		remainingMargin: wei('500'),
		position: {
			side: PositionSide.LONG,
			lastPrice: wei('40000'),
			size: wei('1'),
			liquidationPrice: wei('35000'),
			canLiquidatePosition: true,
			roiChange: wei('0.1'),
			roi: wei('100'),
		},
	};

	return (
		<FlexDivCol>
			<StyledSubheader>{t('futures.wallet-overview.positions.title')}</StyledSubheader>
			{positions && positions.length > 0 ? (
				positions.map((position, i) => (
					<a href={ROUTES.Markets.MarketPair(position.asset as CurrencyKey)}>
						<PositionCard key={i} position={position} />
					</a>
				))
			) : (
				<CTA>
					<CTAButton
						onClick={() => router.push(ROUTES.Markets.MarketPair(DEFAULT_ASSET))}
						variant="primary"
						isRounded
						size="lg"
					>
						{t('futures.wallet-overview.open-position')}
					</CTAButton>
					<Background>
						<PositionCard position={defaultPosition as FuturesPosition} isCTA={true} />
					</Background>
				</CTA>
			)}
		</FlexDivCol>
	);
};
export default Positions;

const CTA = styled.div`
	position: relative;
	width: 100%;
`;

const Background = styled.div`
	position: relative;
	width: 100%;
	filter: blur(2px);
`;

const CTAButton = styled(Button)`
	position: absolute;
	z-index: 1;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

const StyledSubheader = styled(Subheader)`
	margin-bottom: 16px;
`;
