import { FC, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';

import Slider from 'components/Slider';
import Button from 'components/Button';
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { PositionSide } from '../types';
import { FuturesPosition } from 'queries/futures/types';

type LeverageInputProps = {
	currentLeverage: number;
	currentTradeSize: number;
	maxLeverage: number;
	side: PositionSide;
	assetRate: number;
	onLeverageChange: (value: number) => void;
	onSideChange: (value: PositionSide) => void;
	setIsLeverageValueCommitted: (value: boolean) => void;
	currentPosition: FuturesPosition | null;
};

const MIN_LEVERAGE = 0;
const DEFAULT_STEPS = 0.01;

const LeverageInput: FC<LeverageInputProps> = ({
	currentLeverage,
	maxLeverage,
	currentTradeSize,
	side,
	onLeverageChange,
	onSideChange,
	setIsLeverageValueCommitted,
	currentPosition,
	assetRate,
}) => {
	const { t } = useTranslation();

	const currentPositionLeverage = currentPosition?.position?.leverage?.toNumber() ?? 0;
	const currentPositionSide = currentPosition?.position?.side ?? null;
	const currentPositionSize = currentPosition?.position?.size?.toNumber() ?? 0;
	const currentPositionMargin = currentPosition?.remainingMargin?.toNumber() ?? 0;

	const legend = useMemo(() => {
		if (!currentPositionLeverage) return null;
		if (currentPositionSide === side) {
			return t('futures.market.trade.input.leverage.total-leverage', {
				totalLeverage: (currentPositionLeverage + currentLeverage).toFixed(2),
			});
		} else {
			const sizeDelta = currentTradeSize - currentPositionSize;
			return sizeDelta > 0
				? t('futures.market.trade.input.leverage.close-position', {
						leverageDelta: ((Math.abs(sizeDelta) * assetRate) / currentPositionMargin).toFixed(2),
				  })
				: t('futures.market.trade.input.leverage.partial-close-position', {
						closePositionDelta: ((100 * currentTradeSize) / currentPositionSize).toFixed(2),
				  });
		}
	}, [
		currentPositionLeverage,
		currentLeverage,
		t,
		side,
		currentPositionSide,
		assetRate,
		currentPositionMargin,
		currentPositionSize,
		currentTradeSize,
	]);

	const maxLeverageValue = useMemo(() => {
		if (currentPositionLeverage === 0) return maxLeverage;
		if (currentPositionSide === side) {
			return maxLeverage - currentPositionLeverage;
		} else {
			return currentPositionLeverage + maxLeverage;
		}
	}, [maxLeverage, currentPositionSide, side, currentPositionLeverage]);

	return (
		<LeverageInputWrapper>
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
				</FlexDivCol>
			</LeverageRow>
			<SliderRow>
				<Slider
					steps={DEFAULT_STEPS}
					minValue={MIN_LEVERAGE}
					maxValue={maxLeverageValue}
					value={currentLeverage}
					onChange={(_, newValue) => {
						setIsLeverageValueCommitted(false);
						onLeverageChange(newValue as number);
					}}
					onChangeCommitted={() => setIsLeverageValueCommitted(true)}
				/>
				{legend && <SliderLegend>{legend}</SliderLegend>}
			</SliderRow>
		</LeverageInputWrapper>
	);
};

const LeverageInputWrapper = styled(FlexDivCol)`
	margin-bottom: 24px;
`;

const InputContainer = styled(FlexDivRowCentered)`
	background: ${(props) => props.theme.colors.black};
	border-radius: 4px;
	padding: 4px;
	width: 225px;
`;

const LeverageRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
`;

const LeverageTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;
`;

const LeverageAmount = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
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
	position: relative;
`;

const SliderLegend = styled(FlexDivRow)`
	position: absolute;
	top: 100%;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 10px;
	color: ${(props) => props.theme.colors.blueberry};
`;

export default LeverageInput;
