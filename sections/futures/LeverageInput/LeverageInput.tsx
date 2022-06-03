import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivCol, FlexDivRow } from 'styles/common';
import LeverageSlider from '../LeverageSlider';
import CustomNumericInput from 'components/Input/CustomNumericInput';
import Button from 'components/Button';
import { formatNumber } from 'utils/formatters/number';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
	leverageState,
	leverageValueCommitedState,
	marketInfoState,
	maxLeverageState,
	nextPriceDisclaimerState,
	orderTypeState,
} from 'store/futures';

type LeverageInputProps = {
	onLeverageChange: (value: string) => void;
};

const LeverageInput: FC<LeverageInputProps> = ({ onLeverageChange }) => {
	const { t } = useTranslation();
	const [mode, setMode] = useState<'slider' | 'input'>('input');
	const leverage = useRecoilValue(leverageState);
	const maxLeverage = useRecoilValue(maxLeverageState);
	const orderType = useRecoilValue(orderTypeState);
	const isDisclaimerDisplayed = useRecoilValue(nextPriceDisclaimerState);
	const [, setIsLeverageValueCommitted] = useRecoilState(leverageValueCommitedState);
	const marketInfo = useRecoilValue(marketInfoState);

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
			{orderType === 1 && isDisclaimerDisplayed && (
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
						value={leverage ? Number(leverage) : 0}
						onChange={(_, newValue) => {
							setIsLeverageValueCommitted(false);
							onLeverageChange(newValue.toString());
						}}
						onChangeCommitted={() => setIsLeverageValueCommitted(true)}
					/>
				</SliderRow>
			) : (
				<LeverageInputContainer>
					<StyledInput
						value={leverage}
						placeholder="1"
						suffix="x"
						maxValue={maxLeverage.toNumber()}
						onChange={(_, newValue) => {
							setIsLeverageValueCommitted(true);
							onLeverageChange(newValue.toString());
						}}
					/>
					{['2', '5', '10'].map((l) => (
						<LeverageButton
							key={l}
							mono
							onClick={() => {
								onLeverageChange(l);
							}}
							disabled={maxLeverage.lt(Number(l)) || marketInfo?.isSuspended}
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

export const StyledInput = styled(CustomNumericInput)`
	font-family: ${(props) => props.theme.fonts.mono};
	text-overflow: ellipsis;
`;

export default LeverageInput;
