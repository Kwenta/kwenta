import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';

import { PositionSide } from '../types';

export const ProfitDetails = (props: {
	leverageSide: PositionSide;
	exitPrice: BigNumber;
	stopLoss: BigNumber;
	marketAssetPositionSize: BigNumber;
	marketAsset: string;
}) => {
	const entryOrderDetails = props.leverageSide === PositionSide.LONG ? 'Long' : 'Short';

	return (
		<>
			{/**
			 * @todo 1. Add css for row-separating lines
			 *       2. Add css for spacing between `Sell` and `at` and value
			 *       3. add proper margins to fit this component ~46px from the bottom
			 *          of the modal container
			 */}
			<StyledProfitDetails>
				{/* ENTRY ORDER */}
				<div>
					<RowText className="row-name">{'Entry Order:'}</RowText>
				</div>
				<div>
					<RowText className={props.leverageSide}>{`${entryOrderDetails}`}</RowText>
					<RowText>{`, Market`}</RowText>
				</div>
				{/* TAKE PROFIT */}
				<div>
					<RowText className="row-name">{'Take Profit:'}</RowText>
				</div>
				<div>
					<RowText>{`Sell`}</RowText>
					<RowText className="gray-font-color">{`at`}</RowText>
					<RowText>{props.exitPrice.toString()}</RowText>
				</div>
				{/* STOP LOSS */}
				<div>
					<RowText className="row-name">{'Stop Loss:'}</RowText>
				</div>
				<div>
					<RowText>{`Sell`}</RowText>
					<RowText className="gray-font-color">{`at`}</RowText>
					<RowText>{props.stopLoss.toString()}</RowText>
				</div>
				{/* SIZE */}
				<div>
					<RowText className="row-name">{'Size:'}</RowText>
				</div>
				<div>
					<RowText>{`${props.marketAssetPositionSize}`}</RowText>
					<RowText className="gray-font-color">{`${props.marketAsset}-PERP`}</RowText>
				</div>
			</StyledProfitDetails>
		</>
	);
};

const RowText = styled.p`
	display: inline-block;

	color: #ece8e3;
	color: ${(props) => (props.className === 'long' ? '#7FD482' : '')};
	color: ${(props) => (props.className === 'short' ? '#EF6868' : '')};
	color: ${(props) => (props.className === 'gray-font-color' ? '#787878' : '')};

	font-size: 14px;
	line-height: 17px;
	text-align: ${(props) => (props.className === 'row-name' ? 'left' : 'right')};
`;

const StyledProfitDetails = styled.div`
	display: grid;
	grid-gap: 0rem;
	grid-template-columns: repeat(2, 1fr);

	border: 1px solid rgba(255, 255, 255, 0.1);
	box-sizing: border-box;
	border-radius: 6px;

	margin-top: 20px;
`;

export default ProfitDetails;
