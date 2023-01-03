import { wei } from '@synthetixio/wei';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import CustomNumericInput from 'components/Input/CustomNumericInput';
import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import { editIsolatedMarginSize } from 'state/futures/actions';
import { setIsolatedMarginLeverageInput } from 'state/futures/reducer';
import {
	selectIsolatedLeverageInput,
	selectMarketPrice,
	selectMarketInfo,
	selectMaxLeverage,
	selectPosition,
	selectOrderType,
	selectNextPriceDisclaimer,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FlexDivCol, FlexDivRow } from 'styles/common';
import { floorNumber, truncateNumbers, zeroBN } from 'utils/formatters/number';

import LeverageSlider from '../LeverageSlider';

const LeverageInput: FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [mode, setMode] = useState<'slider' | 'input'>('input');
	const orderType = useAppSelector(selectOrderType);
	const isDisclaimerDisplayed = useAppSelector(selectNextPriceDisclaimer);
	const position = useAppSelector(selectPosition);
	const marketInfo = useAppSelector(selectMarketInfo);
	const maxLeverage = useAppSelector(selectMaxLeverage);
	const marketPrice = useAppSelector(selectMarketPrice);
	const leverageInput = useAppSelector(selectIsolatedLeverageInput);

	const onLeverageChange = useCallback(
		(newLeverage: number) => {
			const remainingMargin = position?.remainingMargin ?? zeroBN;
			const newTradeSize =
				marketPrice.eq(0) || remainingMargin.eq(0)
					? ''
					: wei(newLeverage).mul(remainingMargin).div(marketPrice).toString();
			const input = truncateNumbers(newLeverage, DEFAULT_FIAT_DECIMALS);
			dispatch(setIsolatedMarginLeverageInput(input));
			const floored = floorNumber(Number(newTradeSize), 4);
			dispatch(editIsolatedMarginSize(String(floored), 'native'));
		},
		[position?.remainingMargin, marketPrice, dispatch]
	);

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

	const isDisabled = useMemo(() => {
		return position?.remainingMargin.lte(0) || maxLeverage.lte(0);
	}, [position, maxLeverage]);

	const leverageButtons = marketInfo?.maxLeverage.eq(25) ? ['5', '10', '25'] : ['2', '5', '10'];
	const truncateMaxLeverage = maxLeverage.gte(0)
		? truncateNumbers(maxLeverage, DEFAULT_FIAT_DECIMALS)
		: 10;

	const truncateLeverage = useMemo(
		() => truncateNumbers(wei(leverageInput ?? 0), DEFAULT_FIAT_DECIMALS),
		[leverageInput]
	);

	return (
		<LeverageInputWrapper>
			<LeverageRow>
				<LeverageTitle>
					{t('futures.market.trade.input.leverage.title')}&nbsp; —
					<span>&nbsp; Up to {truncateMaxLeverage}x</span>
				</LeverageTitle>
				{modeButton}
			</LeverageRow>
			{(orderType === 'delayed' || orderType === 'delayed offchain') && isDisclaimerDisplayed && (
				<LeverageDisclaimer>
					{t('futures.market.trade.input.leverage.disclaimer')}
				</LeverageDisclaimer>
			)}
			{mode === 'slider' ? (
				<SliderRow>
					<LeverageSlider
						disabled={isDisabled}
						minValue={0}
						maxValue={Number(truncateMaxLeverage)}
						value={Number(truncateLeverage)}
						onChange={(_, newValue) => {
							onLeverageChange(newValue as number);
						}}
					/>
				</SliderRow>
			) : (
				<LeverageInputContainer>
					<StyledInput
						data-testid="leverage-input"
						value={leverageInput}
						placeholder="1"
						suffix="x"
						maxValue={maxLeverage.toNumber()}
						onChange={(_, newValue) => {
							onLeverageChange(Number(newValue));
						}}
						disabled={isDisabled}
					/>
					{leverageButtons.map((l) => (
						<LeverageButton
							key={l}
							mono
							variant="flat"
							onClick={() => {
								onLeverageChange(Number(l));
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
`;

const LeverageTitle = styled.div`
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-transform: capitalize;

	span {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
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
	font-size: 13px;
	height: 46px;
	font-family: ${(props) => props.theme.fonts.monoBold};
`;

const TextButton = styled.button`
	text-decoration: underline;
	font-size: 13px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`;

const LeverageDisclaimer = styled.div`
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin: 0 8px 12px;
`;

export const StyledInput = styled(CustomNumericInput)`
	font-family: ${(props) => props.theme.fonts.mono};
	text-overflow: ellipsis;
`;

export default LeverageInput;
