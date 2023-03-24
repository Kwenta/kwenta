import { wei } from '@synthetixio/wei';
import React, { useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';

import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivRow } from 'components/layout/flex';
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
			<LabelsContainer>
				<InputTitle>{type === 'deposit' ? 'Add margin amount' : 'Withdraw amount'}</InputTitle>
				<InputHelpers>
					<MaxButton onClick={handleSetMax}>Max</MaxButton>
				</InputHelpers>
			</LabelsContainer>

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

const LabelsContainer = styled(FlexDivRow)`
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

export default EditPositionMarginInput;
