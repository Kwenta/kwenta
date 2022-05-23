import { FC } from 'react';
import styled from 'styled-components';

import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FuturesPosition } from 'queries/futures/types';
import { formatNumber, zeroBN } from 'utils/formatters/number';
import { CurrencyKey } from 'constants/currency';
import { PositionSide } from '../types';

type AmountContainerProps = {
	marketAsset: CurrencyKey;
	position: FuturesPosition | null;
};

const lineSeparatorStyle = { margin: '0px 0.7vw 0px 0.7vw' };
const currencyIconStyle = {
	height: '1.94vw',
	width: 'auto',
	margin: '-0.3vw 0.5vw 0vw 0vw',
};

const AmountContainer: FC<AmountContainerProps> = ({ marketAsset, position }) => {
	const marketAsset__RemovedSChar = marketAsset[0] === 's' ? marketAsset.slice(1) : marketAsset;
	const positionDetails = position?.position ?? null;
	const leverage = formatNumber(positionDetails?.leverage ?? zeroBN) + 'x';
	const side = positionDetails?.side === 'long' ? PositionSide.LONG : PositionSide.SHORT;
	const roiChange = positionDetails?.roiChange.mul(100);

	const amount = () => {
		if (roiChange) {
			return roiChange.gt(0)
				? `+${roiChange.toNumber().toFixed(2)}%`
				: roiChange.eq(0)
				? `+0.00%`
				: `${roiChange.toNumber().toFixed(2)}%`;
		}
	};

	return (
		<>
			<Container>
				<StyledPositionType>
					<CurrencyIcon
						style={currencyIconStyle}
						currencyKey={(marketAsset[0] !== 's' ? 's' : '') + marketAsset}
					/>
					<StyledPositionDetails>{`${marketAsset__RemovedSChar}-PERP`}</StyledPositionDetails>
					<StyledPositionDetails style={lineSeparatorStyle}>{`|`}</StyledPositionDetails>
					<StyledPositionSide className={side}>{side.toUpperCase()}</StyledPositionSide>
					<StyledPositionDetails style={lineSeparatorStyle}>{`|`}</StyledPositionDetails>
					<StyledPositionLeverage>{`${leverage}`}</StyledPositionLeverage>
				</StyledPositionType>
				<StyledAmount className={side}>{amount()}</StyledAmount>
			</Container>
		</>
	);
};

/** @todo Import and use correct fonts from Figma design */
const StyledPositionLeverage = styled.div`
	display: flex;
	flex-direction: column;
	color: #c9975b;

	font-size: 1.07vw;
`;

const StyledPositionSide = styled.div`
	display: flex;
	flex-direction: column;
	color: ${(props) => (props.className === 'long' ? '#7fd482' : '#ff0420')};

	font-size: 1.07vw;
`;

const StyledPositionDetails = styled.div`
	display: flex;
	flex-direction: column;

	font-size: 1.07vw;

	color: #ffff;
`;

const StyledPositionType = styled.div`
	display: flex;
	flex-direction: row;
`;

/** @todo Import and use correct fonts from Figma design */
const StyledAmount = styled.div`
	position: absolute;
	margin-top: -0.05vw;

	font-size: 4.8vw;
	font-weight: 700;
	color: ${(props) => (props.className && parseFloat(props.className) > 0 ? '#ff0420' : '#7fd482')};

	text-shadow: 0px 0px 3.99vw
		${(props) =>
			props.className && parseFloat(props.className) > 0
				? 'rgb(255, 4, 32, 0.35)'
				: 'rgba(127, 212, 130, 0.35)'};
`;

const Container = styled.div`
	position: absolute;
	top: 6vw;
	left: 2.02vw;
`;

export default AmountContainer;
