import Wei, { wei } from '@synthetixio/wei';
import React, { useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';

import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivRow } from 'components/layout/flex';
import { getStep } from 'components/Slider/Slider';
import StyledSlider from 'components/Slider/StyledSlider';
import Spacer from 'components/Spacer';
import { editCrossMarginPositionSize } from 'state/futures/actions';
import {
	selectPosition,
	selectOrderType,
	selectLeverageSide,
	selectEditPositionInputs,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber, formatNumber, zeroBN } from 'utils/formatters/number';

type OrderSizingProps = {
	type: 'increase' | 'decrease';
	maxNativeValue: Wei;
	isMobile?: boolean;
};

const EditPositionSizeInput: React.FC<OrderSizingProps> = memo(
	({ isMobile, type, maxNativeValue }) => {
		const dispatch = useAppDispatch();

		const { nativeSizeDelta } = useAppSelector(selectEditPositionInputs);

		const position = useAppSelector(selectPosition);
		const orderType = useAppSelector(selectOrderType);
		const selectedLeverageSide = useAppSelector(selectLeverageSide);

		const onSizeChange = useCallback(
			(value: string) => {
				dispatch(editCrossMarginPositionSize(type === 'increase' ? value : '-' + value));
			},
			[dispatch, type]
		);

		const handleSetMax = useCallback(() => {
			onSizeChange(String(floorNumber(maxNativeValue)));
		}, [onSizeChange, maxNativeValue]);

		const handleSetPositionSize = () => {
			onSizeChange(position?.position?.size.toString() ?? '0');
		};

		const onChangeValue = useCallback(
			(_, v: string) => {
				onSizeChange(v);
			},
			[onSizeChange]
		);

		const onChangeSlider = useCallback((_, v: number | number[]) => onSizeChange(String(v)), [
			onSizeChange,
		]);

		const showPosSizeHelper =
			position?.position?.size &&
			(orderType === 'limit' || orderType === 'stop_market') &&
			position?.position.side !== selectedLeverageSide;

		const nativeSizeDeltaWei = useMemo(() => {
			return !nativeSizeDelta || isNaN(Number(nativeSizeDelta)) ? zeroBN : wei(nativeSizeDelta);
		}, [nativeSizeDelta]);

		const invalid = nativeSizeDelta !== '' && maxNativeValue.lte(nativeSizeDeltaWei);

		return (
			<OrderSizingContainer>
				<OrderSizingRow>
					<InputTitle>{type ? 'Add' : 'Remove'} position size</InputTitle>
					<InputHelpers>
						<MaxButton onClick={handleSetMax}>Max</MaxButton>
						{showPosSizeHelper && (
							<MaxButton onClick={handleSetPositionSize}>Position Size</MaxButton>
						)}
					</InputHelpers>
				</OrderSizingRow>

				<NumericInput
					invalid={invalid}
					dataTestId={'edit-position-size-input' + (isMobile ? '-mobile' : '-desktop')}
					value={nativeSizeDelta.replace('-', '')}
					placeholder="0.00"
					onChange={onChangeValue}
				/>
				<Spacer height={16} />
				<StyledSlider
					minValue={0}
					maxValue={Number(maxNativeValue.toString(2))}
					step={getStep(maxNativeValue.toNumber())}
					defaultValue={0}
					value={nativeSizeDeltaWei.abs().toNumber()}
					onChange={onChangeSlider}
					valueLabelDisplay="auto"
					valueLabelFormat={(v) => formatNumber(v)}
					$currentMark={Number(nativeSizeDelta ?? 0)}
				/>
			</OrderSizingContainer>
		);
	}
);

const OrderSizingContainer = styled.div`
	margin-bottom: 16px;
`;

const OrderSizingRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	margin-bottom: 8px;
	cursor: default;
`;

const MaxButton = styled.button`
	text-decoration: underline;
	font-variant: small-caps;
	text-transform: lowercase;
	font-size: 13px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`;

const InputHelpers = styled.div`
	display: flex;
`;

export default EditPositionSizeInput;
