import React from 'react';
import styled from 'styled-components';
import { wei } from '@synthetixio/wei';

import { PositionSide } from '../types';

function textColor(className?: string) {
	if (!className) return '#ece8e3';
	if (className === 'long') return '#7FD482';
	if (className === 'short') return '#EF6868';
	if (className === 'gray-font-color') return '#787878';
}

type ProfitDetailsProps = {
	stopLoss: string;
	exitPrice: string;
	marketAsset: string;
	leverageSide: PositionSide;
	marketAssetPositionSize: string;
};

const ProfitDetails: React.FC<ProfitDetailsProps> = ({
	stopLoss,
	exitPrice,
	marketAsset,
	leverageSide,
	marketAssetPositionSize,
}) => {
	const entryOrderDetails = leverageSide === PositionSide.LONG ? 'Long' : 'Short';

	return (
		<>
			<StyledProfitDetails>
				{/* ENTRY ORDER */}
				<RowName>
					<RowText className="row-name">{'Entry Order:'}</RowText>
				</RowName>
				<Details style={{ justifySelf: 'right' }}>
					<RowText className={leverageSide}>{`${entryOrderDetails}`}</RowText>
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
					<RowText>{exitPrice !== '' ? wei(exitPrice).toNumber().toFixed(2) : ''}</RowText>
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
					<RowText>{stopLoss !== '' ? wei(stopLoss).toNumber().toFixed(2): ''}</RowText>
				</Details>
				{/* SIZE */}
				<RowName>
					<RowText className="row-name">{'Size:'}</RowText>
				</RowName>
				<Details style={{ justifySelf: 'right' }}>
					<RowText style={{ marginRight: '10px' }}>
						{marketAssetPositionSize !== ''
							? wei(marketAssetPositionSize).toNumber().toFixed(2)
							: ''}
					</RowText>
					<RowText className="gray-font-color">{`${marketAsset}-PERP`}</RowText>
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

	color: ${(props) => textColor(props.className)};

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
