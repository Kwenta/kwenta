import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivCol, FlexDivRow } from 'styles/common';
import { PositionSide } from '../types';
import { FuturesPosition } from 'queries/futures/types';
import LeverageSlider from '../LeverageSlider';
import NumericInput from 'components/Input/NumericInput';
import Button from 'components/Button';

type LeverageInputProps = {
	currentLeverage: number;
	currentTradeSize: number;
	maxLeverage: number;
	side: PositionSide;
	assetRate: number;
	onLeverageChange: (value: number) => void;
	setIsLeverageValueCommitted: (value: boolean) => void;
	currentPosition: FuturesPosition | null;
};

const MIN_LEVERAGE = 1;

const LeverageInput: FC<LeverageInputProps> = ({
	currentLeverage,
	maxLeverage,
	currentTradeSize,
	side,
	onLeverageChange,
	setIsLeverageValueCommitted,
	currentPosition,
	assetRate,
}) => {
	const { t } = useTranslation();
	const [mode, setMode] = useState<'slider' | 'input'>('input');

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

	const modeButton = useMemo(() => {
		return (
			<TextButton
				onClick={() => {
					setMode(mode === 'slider' ? 'input' : 'slider');
				}}
			>
				{mode === 'slider' ? 'Manual' : 'Slider'}
			</TextButton>
		);
	}, [mode]);

	return (
		<LeverageInputWrapper>
			<LeverageRow>
				<LeverageTitle>
					{t('futures.market.trade.input.leverage.title')} <span>— Up to 10x</span>
				</LeverageTitle>
				{modeButton}
			</LeverageRow>
			{mode === 'slider' ? (
				<SliderRow>
					<LeverageSlider
						disabled={maxLeverage <= 0}
						minValue={MIN_LEVERAGE}
						maxValue={maxLeverage}
						value={currentLeverage}
						onChange={(_, newValue) => {
							setIsLeverageValueCommitted(false);
							onLeverageChange(newValue as number);
						}}
						onChangeCommitted={() => setIsLeverageValueCommitted(true)}
					/>
					{legend && <SliderLegend>{legend}</SliderLegend>}
				</SliderRow>
			) : (
				<LeverageInputContainer>
					<NumericInput
						value={Math.round(currentLeverage * 100) / 100}
						onChange={(e, value) => {
							onLeverageChange(Number(value));
							setIsLeverageValueCommitted(true);
						}}
					/>
					<LeverageButton
						mono
						onClick={() => {
							onLeverageChange(2);
						}}
					>
						2x
					</LeverageButton>
					<LeverageButton
						mono
						onClick={() => {
							onLeverageChange(5);
						}}
					>
						5x
					</LeverageButton>
					<LeverageButton
						mono
						onClick={() => {
							onLeverageChange(10);
						}}
					>
						10x
					</LeverageButton>
				</LeverageInputContainer>
			)}
		</LeverageInputWrapper>
	);
};

const LeverageInputWrapper = styled(FlexDivCol)`
	margin-bottom: 16px;
`;

const LeverageRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	margin-bottom: 8px;
	padding: 0 14px;
`;

const LeverageTitle = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-transform: capitalize;

	span {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

const SliderRow = styled(FlexDivRow)`
	margin-top: 8px;
	margin-bottom: 14px;
	position: relative;
`;

const SliderLegend = styled(FlexDivRow)`
	position: absolute;
	top: 100%;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 10px;
	color: ${(props) => props.theme.colors.blueberry};
`;

const LeverageInputContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 43px 43px 43px;
	grid-gap: 15px;
	align-items: center;
`;

const LeverageButton = styled(Button)`
	padding: 0;
	font-weight: 700;
	font-size: 13px;
`;

const TextButton = styled.button`
	text-decoration: underline;
	font-size: 11px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`;

export default LeverageInput;
