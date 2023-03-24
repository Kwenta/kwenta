import { wei } from '@synthetixio/wei';
import React, { useMemo, memo, useCallback } from 'react';

import TextButton from 'components/Button/TextButton';
import InputHeaderRow from 'components/Input/InputHeaderRow';
import NumericInput from 'components/Input/NumericInput';
import { editCrossMarginPositionMargin } from 'state/futures/actions';
import {
	selectPosition,
	selectIdleMargin,
	selectEditPositionInputs,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber } from 'utils/formatters/number';

type OrderSizingProps = {
	isMobile?: boolean;
	type: 'deposit' | 'withdraw';
};

const EditPositionMarginInput: React.FC<OrderSizingProps> = memo(({ isMobile, type }) => {
	const dispatch = useAppDispatch();

	const position = useAppSelector(selectPosition);
	const { marginDelta } = useAppSelector(selectEditPositionInputs);
	const idleMargin = useAppSelector(selectIdleMargin);

	const maxWithdraw = useMemo(() => {
		const max = (position?.remainingMargin ?? wei(0)).sub(50);
		return wei(Math.max(0, max.toNumber()));
	}, [position?.remainingMargin]);

	const maxUsdInputAmount = type === 'deposit' ? idleMargin : maxWithdraw;

	const onChangeMargin = useCallback(
		(value: string) => {
			dispatch(editCrossMarginPositionMargin(type === 'deposit' ? value : '-' + value));
		},
		[dispatch, type]
	);

	const handleSetMax = useCallback(() => {
		onChangeMargin(String(floorNumber(maxUsdInputAmount)));
	}, [onChangeMargin, maxUsdInputAmount]);

	const onChangeValue = useCallback((_, v: string) => onChangeMargin(v), [onChangeMargin]);

	const invalidMaxWithdraw = maxWithdraw.lt(marginDelta || 0);

	const invalid =
		marginDelta !== '' && (maxUsdInputAmount.lte(marginDelta || 0) || invalidMaxWithdraw);

	return (
		<div>
			<InputHeaderRow
				label={type === 'deposit' ? 'Add margin amount' : 'Withdraw amount'}
				rightElement={<TextButton onClick={handleSetMax}>Max</TextButton>}
			/>

			<NumericInput
				invalid={invalid}
				dataTestId={'edit-position-size-input' + (isMobile ? '-mobile' : '-desktop')}
				value={marginDelta.replace('-', '')}
				placeholder="0.00"
				onChange={onChangeValue}
			/>
		</div>
	);
});

export default EditPositionMarginInput;
