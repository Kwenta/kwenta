import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';

import { PositionSide } from '../types';

export const ProfitDetails = (props: {
	scalar: number;
	stopLoss: BigNumber;
	marketAsset: string;
	exitPrice: BigNumber;
	leverageSide: PositionSide;
	marketAssetPositionSize: BigNumber;
}) => {
	const entryOrderDetails = props.leverageSide === PositionSide.LONG ? 'Long' : 'Short';

	return (
		<>
			<StyledProfitDetails>
				{/* ENTRY ORDER */}
				<RowName>
					<RowText className="row-name">{'Entry Order:'}</RowText>
				</RowName>
				<Details style={{ justifySelf: 'right' }}>
					<RowText className={props.leverageSide}>{`${entryOrderDetails}`}</RowText>
					<RowText style={{ marginLeft: '2px' }}>{`,`}</RowText>
					<RowText style={{ marginLeft: '10px' }}>{`Market`}</RowText>
				</Details>
				{/* TAKE PROFIT */}
				<RowName>
					<RowText className="row-name">{'Take Profit:'}</RowText>
				</RowName>
				<Details style={{ justifySelf: 'right' }}>
					<RowText>{`Sell`}</RowText>
					<RowText style={{ marginRight: '10px', marginLeft: '10px' }} className="gray-font-color">
						{`at`}
					</RowText>
					<RowText>{(props.exitPrice.toNumber() / props.scalar).toFixed(2)}</RowText>
				</Details>
				{/* STOP LOSS */}
				<RowName>
					<RowText className="row-name">{'Stop Loss:'}</RowText>
				</RowName>
				<Details style={{ justifySelf: 'right' }}>
					<RowText>{`Sell`}</RowText>
					<RowText style={{ marginRight: '10px', marginLeft: '10px' }} className="gray-font-color">
						{`at`}
					</RowText>
					<RowText>{(props.stopLoss.toNumber() / props.scalar).toFixed(2)}</RowText>
				</Details>
				{/* SIZE */}
				<RowName>
					<RowText className="row-name">{'Size:'}</RowText>
				</RowName>
				<Details style={{ justifySelf: 'right' }}>
					<RowText style={{ marginRight: '10px' }}>
						{(props.marketAssetPositionSize.toNumber() / props.scalar).toFixed(2)}
					</RowText>
					<RowText className="gray-font-color">{`${props.marketAsset}-PERP`}</RowText>
				</Details>
			</StyledProfitDetails>
		</>
	);
};

const RowName = styled.div`
	margin-left: 15px;
`;

const Details = styled.div`
	margin-right: 15px;
`;

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
