import Wei, { wei } from '@synthetixio/wei';
import React, { memo, useCallback, useMemo } from 'react';

import TextButton from 'components/Button/TextButton';
import InputHeaderRow from 'components/Input/InputHeaderRow';
import NumericInput from 'components/Input/NumericInput';
import { getStep } from 'components/Slider/Slider';
import StyledSlider from 'components/Slider/StyledSlider';
import Spacer from 'components/Spacer';
import { selectShowPositionModal } from 'state/app/selectors';
import { editCrossMarginPositionMargin } from 'state/futures/actions';
import { selectEditPositionInputs } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber, formatNumber, zeroBN } from 'utils/formatters/number';

type OrderSizingProps = {
	isMobile?: boolean;
	maxUsdInput: Wei;
	type: 'deposit' | 'withdraw';
};

const EditPositionMarginInput: React.FC<OrderSizingProps> = memo(
	({ isMobile, type, maxUsdInput }) => {
		const dispatch = useAppDispatch();

		const { marginDelta } = useAppSelector(selectEditPositionInputs);
		const positionModal = useAppSelector(selectShowPositionModal);

		const onChangeMargin = useCallback(
			(value: string) => {
				if (positionModal?.marketKey) {
					dispatch(
						editCrossMarginPositionMargin(
							positionModal.marketKey,
							type === 'deposit' || !value ? value : '-' + value
						)
					);
				}
			},
			[dispatch, type, positionModal?.marketKey]
		);

		const handleSetMax = useCallback(() => {
			onChangeMargin(String(floorNumber(maxUsdInput)));
		}, [onChangeMargin, maxUsdInput]);

		const onChangeValue = useCallback((_, v: string) => onChangeMargin(v), [onChangeMargin]);
		const onChangeSlider = useCallback((_, v: number | number[]) => onChangeMargin(String(v)), [
			onChangeMargin,
		]);

		const marginDeltaWei = useMemo(() => {
			return !marginDelta || isNaN(Number(marginDelta)) ? zeroBN : wei(marginDelta);
		}, [marginDelta]);

		const invalid = useMemo(() => wei(marginDeltaWei || 0).gt(maxUsdInput), [
			marginDeltaWei,
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
					step={getStep(maxUsdInput.toNumber())}
					defaultValue={0}
					value={Math.abs(Number(marginDelta))}
					onChange={onChangeSlider}
					valueLabelDisplay="auto"
					valueLabelFormat={(v) => formatNumber(v)}
					$currentMark={Number(marginDelta ?? 0)}
				/>
			</div>
		);
	}
);

export default EditPositionMarginInput;
