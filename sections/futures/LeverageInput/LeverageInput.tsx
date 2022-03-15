import { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivCol, FlexDivRow } from 'styles/common';
import { PositionSide } from '../types';
import { FuturesPosition } from 'queries/futures/types';
import LeverageSlider from '../LeverageSlider';
import NumericInput from 'components/Input/NumericInput';
import Button from 'components/Button';

type LeverageInputProps = {
	currentLeverage: string;
	currentTradeSize: number;
	maxLeverage: number;
	side: PositionSide;
	assetRate: number;
	onLeverageChange: (value: string) => void;
	setIsLeverageValueCommitted: (value: boolean) => void;
	currentPosition: FuturesPosition | null;
};

const MIN_LEVERAGE = 1;

const LeverageInput: FC<LeverageInputProps> = ({
	currentLeverage,
	maxLeverage,
	onLeverageChange,
	setIsLeverageValueCommitted,
}) => {
	const { t } = useTranslation();
	const [mode, setMode] = useState<'slider' | 'input'>('input');

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
						value={currentLeverage ? Number(currentLeverage) : 1}
						onChange={(_, newValue) => {
							setIsLeverageValueCommitted(false);
							onLeverageChange(newValue.toString());
						}}
						onChangeCommitted={() => setIsLeverageValueCommitted(true)}
					/>
				</SliderRow>
			) : (
				<LeverageInputContainer>
					<NumericInput
						value={
							currentLeverage === ''
								? ''
								: (Math.round(Number(currentLeverage) * 100) / 100).toString()
						}
						onChange={(_, value) => {
							onLeverageChange(value);
							setIsLeverageValueCommitted(true);
						}}
					/>
					{['2', '5', '10'].map((l) => (
						<LeverageButton
							key={l.toString()}
							mono
							onClick={() => {
								onLeverageChange(l);
							}}
						>
							{l}x
						</LeverageButton>
					))}
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
