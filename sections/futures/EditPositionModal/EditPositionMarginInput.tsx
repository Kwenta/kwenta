import Wei, { wei } from '@synthetixio/wei';
import React, { memo, useCallback, useMemo } from 'react';

import TextButton from 'components/Button/TextButton';
import InputHeaderRow from 'components/Input/InputHeaderRow';
import NumericInput from 'components/Input/NumericInput';
import StyledSlider from 'components/Slider/StyledSlider';
import Spacer from 'components/Spacer';
import { editCrossMarginPositionMargin } from 'state/futures/actions';
import { selectEditPositionInputs } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber, formatNumber } from 'utils/formatters/number';

type OrderSizingProps = {
	isMobile?: boolean;
	maxUsdInput: Wei;
	type: 'deposit' | 'withdraw';
};

const EditPositionMarginInput: React.FC<OrderSizingProps> = memo(
	({ isMobile, type, maxUsdInput }) => {
		const dispatch = useAppDispatch();

		const { marginDelta } = useAppSelector(selectEditPositionInputs);

		const onChangeMargin = useCallback(
			(value: string) => {
				dispatch(editCrossMarginPositionMargin(type === 'deposit' ? value : '-' + value));
			},
			[dispatch, type]
		);

		const handleSetMax = useCallback(() => {
			onChangeMargin(String(floorNumber(maxUsdInput)));
		}, [onChangeMargin, maxUsdInput]);

		const onChangeValue = useCallback((_, v: string) => onChangeMargin(v), [onChangeMargin]);
		const onChangeSlider = useCallback((_, v: number | number[]) => onChangeMargin(String(v)), [
			onChangeMargin,
		]);

		const invalid = useMemo(() => wei(marginDelta || 0).gt(maxUsdInput), [
			marginDelta,
			maxUsdInput,
		]);

		return (
			<div>
				<InputHeaderRow
					label={type === 'deposit' ? 'Amount to deposit' : 'Amount to withdraw'}
					rightElement={<TextButton onClick={handleSetMax}>Max</TextButton>}
				/>

				<NumericInput
					invalid={invalid}
					dataTestId={'edit-position-size-input' + (isMobile ? '-mobile' : '-desktop')}
					value={marginDelta.replace('-', '')}
					placeholder="0.00"
					onChange={onChangeValue}
				/>
				<Spacer height={16} />
				<StyledSlider
					minValue={0}
					maxValue={Number(maxUsdInput.toString(2))}
					step={1}
					defaultValue={0}
					value={Math.abs(Number(marginDelta))}
					onChange={onChangeSlider}
					valueLabelDisplay="auto"
					valueLabelFormat={(v) => formatNumber(v)}
					$currentMark={Number(marginDelta) ?? 0}
				/>
			</div>
		);
	}
);

export default EditPositionMarginInput;
