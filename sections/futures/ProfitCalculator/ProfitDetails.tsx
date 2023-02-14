import { wei } from '@synthetixio/wei';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { Body } from 'components/Text';
import { PositionSide } from 'sdk/types/futures';

function textColor(props: any) {
	if (!props.className || props.className === 'row-name')
		return props.theme.colors.selectedTheme.button.text.primary;
	if (props.className === 'long') return props.theme.colors.selectedTheme.green;
	if (props.className === 'short') return props.theme.colors.selectedTheme.red;
	if (props.className === 'gray-font-color') return props.theme.colors.selectedTheme.gray;
}

type ProfitDetailsProps = {
	stopLoss: string;
	exitPrice: string;
	marketName: string;
	leverageSide: PositionSide;
	marketAssetPositionSize: string;
};

const ProfitDetails: React.FC<ProfitDetailsProps> = ({
	stopLoss,
	exitPrice,
	marketName,
	leverageSide,
	marketAssetPositionSize,
}) => {
	const { t } = useTranslation();

	const entryOrderDetails = leverageSide === PositionSide.LONG ? 'Long' : 'Short';

	return (
		<>
			<StyledProfitDetails>
				{/* ENTRY ORDER */}
				<RowName>
					<RowText className="row-name">
						{t('futures.modals.profit-calculator.profit-details.row-name.entry-price')}
					</RowText>
				</RowName>
				<Details style={{ justifySelf: 'right' }}>
					<RowText className={leverageSide}>{`${entryOrderDetails}`}</RowText>
					<RowText style={{ marginLeft: '2px' }}>{`,`}</RowText>
					<RowText style={{ marginLeft: '10px' }}>
						{t('futures.modals.profit-calculator.profit-details.details.market')}
					</RowText>
				</Details>
				{/* TAKE PROFIT */}
				<RowName>
					<RowText className="row-name">
						{t('futures.modals.profit-calculator.profit-details.row-name.take-profit')}
					</RowText>
				</RowName>
				<Details style={{ justifySelf: 'right' }}>
					<RowText>{t('futures.modals.profit-calculator.profit-details.details.sell')}</RowText>
					<RowText style={{ marginRight: '10px', marginLeft: '10px' }} className="gray-font-color">
						{t('futures.modals.profit-calculator.profit-details.details.at')}
					</RowText>
					<RowText>{exitPrice !== '' ? '$' + wei(exitPrice).toNumber().toFixed(2) : ''}</RowText>
				</Details>
				{/* STOP LOSS */}
				<RowName>
					<RowText className="row-name">
						{t('futures.modals.profit-calculator.profit-details.row-name.stop-loss')}
					</RowText>
				</RowName>
				<Details style={{ justifySelf: 'right' }}>
					<RowText>{t('futures.modals.profit-calculator.profit-details.details.sell')}</RowText>
					<RowText style={{ marginRight: '10px', marginLeft: '10px' }} className="gray-font-color">
						{t('futures.modals.profit-calculator.profit-details.details.at')}
					</RowText>
					<RowText>{stopLoss !== '' ? '$' + wei(stopLoss).toNumber().toFixed(2) : ''}</RowText>
				</Details>
				{/* SIZE */}
				<RowName>
					<RowText className="row-name">
						{t('futures.modals.profit-calculator.profit-details.row-name.size')}
					</RowText>
				</RowName>
				<Details style={{ justifySelf: 'right' }}>
					<RowText style={{ marginRight: '10px' }}>
						{marketAssetPositionSize !== ''
							? wei(marketAssetPositionSize).toNumber().toFixed(2)
							: ''}
					</RowText>
					<RowText className="gray-font-color">{marketName}</RowText>
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

const RowText = styled(Body)`
	display: inline-block;

	${(props) => css`
		color: ${textColor(props)};
		text-align: ${props.className === 'row-name' ? 'left' : 'right'};
	`}

	font-size: 12px;
	line-height: 10px;
`;

const StyledProfitDetails = styled.div`
	display: grid;
	grid-gap: 0rem;
	grid-template-columns: repeat(2, 1fr);

	border: ${(props) => props.theme.colors.selectedTheme.border};
	box-sizing: border-box;
	border-radius: 6px;

	margin-top: 20px;
`;

export default ProfitDetails;
