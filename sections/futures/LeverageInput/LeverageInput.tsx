import { FC, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';

import Slider from 'components/Slider';
import Button from 'components/Button';
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { PositionSide } from '../types';

type LeverageInputProps = {
	currentLeverage: number;
	maxLeverage: number;
	side: PositionSide;
	onLeverageChange: (value: number) => void;
	onSideChange: (value: PositionSide) => void;
};

const MIN_LEVERAGE = 1;

const LeverageInput: FC<LeverageInputProps> = ({
	currentLeverage,
	maxLeverage,
	side,
	onLeverageChange,
	onSideChange,
}) => {
	const { t } = useTranslation();

	return (
		<LeverageRow>
			<LeverageTitle>{t('futures.market.trade.input.leverage.title')}</LeverageTitle>
			<FlexDivCol>
				<InputContainer>
					<LeverageAmount>{Math.round(currentLeverage * 100) / 100}x</LeverageAmount>
					<LeverageSideContainer>
						<LeverageSide
							variant="outline"
							side={PositionSide.LONG}
							isActive={side === PositionSide.LONG}
							onClick={() => onSideChange(PositionSide.LONG)}
						>
							{t('futures.market.trade.input.leverage.long')}
						</LeverageSide>
						<LeverageSide
							variant="outline"
							side={PositionSide.SHORT}
							isActive={side === PositionSide.SHORT}
							onClick={() => onSideChange(PositionSide.SHORT)}
						>
							{t('futures.market.trade.input.leverage.short')}
						</LeverageSide>
					</LeverageSideContainer>
				</InputContainer>
				<SliderRow>
					<Slider
						minValue={MIN_LEVERAGE}
						maxValue={maxLeverage}
						startingLabel={`${MIN_LEVERAGE}x`}
						endingLabel={`${maxLeverage}x`}
						value={currentLeverage}
						onChange={(newValue) => onLeverageChange(newValue)}
					/>
				</SliderRow>
			</FlexDivCol>
		</LeverageRow>
	);
};

const InputContainer = styled(FlexDivRowCentered)`
	background: ${(props) => props.theme.colors.black};
	border-radius: 4px;
	padding: 4px;
	width: 225px;
`;

const LeverageRow = styled(FlexDivRow)`
	width: 100%;
	margin-bottom: 24px;
`;

const LeverageTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;
	margin-top: 24px;
`;

const LeverageAmount = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	color: ${(props) => props.theme.colors.silver};
	margin-left: 8px;
	max-width: 46px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const LeverageSideContainer = styled(FlexDivRow)`
	padding: 4px 0px;
	margin-right: 4px;
`;

const LeverageSide = styled(Button)<{ side: PositionSide; isActive: boolean }>`
	${(props) =>
		props.isActive
			? css`
					border: 1px solid
						${props.side === PositionSide.LONG ? props.theme.colors.green : props.theme.colors.red};
					color: ${props.side === PositionSide.LONG
						? props.theme.colors.green
						: props.theme.colors.red};
			  `
			: css`
					border: 1px solid ${props.theme.colors.blueberry};
					border-right-width: ${props.side === PositionSide.LONG ? '0px' : '1px'};
					border-left-width: ${props.side === PositionSide.SHORT ? '0px' : '1px'};
					color: ${props.theme.colors.blueberry};
			  `}
	border-radius: ${(props) =>
		props.side === PositionSide.LONG ? `2px 0px 0px 2px` : `0px 2px 2px 0px`};
	text-transform: uppercase;
	text-align: center;
	width: 75px;
`;

const SliderRow = styled(FlexDivRow)`
	margin-top: 8px;
`;

export default LeverageInput;
