import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Wei from '@synthetixio/wei';

import { FlexDivCol, FlexDivRow } from 'styles/common';
import { PositionSide } from '../types';
import { FuturesPosition } from 'queries/futures/types';
import LeverageSlider from '../LeverageSlider';
import NumericInput from 'components/Input/NumericInput';
import Button from 'components/Button';
import { formatNumber } from 'utils/formatters/number';

type LeverageInputProps = {
	currentLeverage: string;
	currentTradeSize: number;
	maxLeverage: Wei;
	side: PositionSide;
	assetRate: Wei;
	onLeverageChange: (value: string) => void;
	setIsLeverageValueCommitted: (value: boolean) => void;
	currentPosition: FuturesPosition | null;
	isMarketClosed: boolean;
	isDisclaimerDisplayed: boolean;
};

const LeverageInput: FC<LeverageInputProps> = ({
	currentLeverage,
	maxLeverage,
	onLeverageChange,
	setIsLeverageValueCommitted,
	isMarketClosed,
	isDisclaimerDisplayed,
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
					{t('futures.market.trade.input.leverage.title')}&nbsp; —
					<span>&nbsp; Up to {formatNumber(maxLeverage, { maxDecimals: 1 })}x</span>
				</LeverageTitle>
				{modeButton}
			</LeverageRow>
			{isDisclaimerDisplayed && (
				<LeverageDisclaimer>
					{t('futures.market.trade.input.leverage.disclaimer')}
				</LeverageDisclaimer>
			)}
			{mode === 'slider' ? (
				<SliderRow>
					<LeverageSlider
						disabled={maxLeverage.lte(0)}
						minValue={0}
						maxValue={maxLeverage.toNumber()}
						value={currentLeverage ? Number(currentLeverage) : 0}
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
							key={l}
							mono
							onClick={() => {
								onLeverageChange(l);
							}}
							disabled={maxLeverage.lt(Number(l)) || isMarketClosed}
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

const LeverageDisclaimer = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	margin: 0 8px 12px;
`;

export default LeverageInput;
