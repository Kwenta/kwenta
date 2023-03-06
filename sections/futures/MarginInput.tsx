import React, { ChangeEvent, useMemo, memo } from 'react';
import styled from 'styled-components';

import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivRow } from 'components/layout/flex';
import { editCrossMarginMarginDelta } from 'state/futures/actions';
import {
	selectPosition,
	selectFuturesType,
	selectSelectedInputDenomination,
	selectMarginDeltaInputValue,
	selectIdleMargin,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import MarginPercentSelector from './Trade/MarginPercentSelector';

type MarginInputProps = {
	isMobile?: boolean;
	disabled?: boolean;
};

const MarginInput: React.FC<MarginInputProps> = memo(({ disabled, isMobile }) => {
	const dispatch = useAppDispatch();

	const idleMargin = useAppSelector(selectIdleMargin);
	const position = useAppSelector(selectPosition);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const assetInputType = useAppSelector(selectSelectedInputDenomination);
	const marginDeltaInputValue = useAppSelector(selectMarginDeltaInputValue);
	const maxMargin = useAppSelector(selectIdleMargin);

	const onChangeValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		dispatch(editCrossMarginMarginDelta(v));
	};

	const isDisabled = useMemo(() => {
		const remaining =
			selectedAccountType === 'isolated_margin' ? position?.remainingMargin || zeroBN : idleMargin;
		return remaining.lte(0) || disabled;
	}, [position?.remainingMargin, disabled, selectedAccountType, idleMargin]);

	const invalid =
		assetInputType === 'usd' &&
		marginDeltaInputValue !== '' &&
		maxMargin.lt(marginDeltaInputValue || 0);

	return (
		<>
			<Container>
				<OrderSizingRow>
					<InputTitle>
						Margin&nbsp; —<span>&nbsp; Set collateral</span>
					</InputTitle>
					<InputHelpers>
						<MarginPercentSelector />
					</InputHelpers>
				</OrderSizingRow>

				<NumericInput
					invalid={invalid}
					dataTestId={'set-order-margin-susd' + (isMobile ? '-mobile' : '-desktop')}
					disabled={isDisabled}
					value={marginDeltaInputValue}
					placeholder="0.00"
					onChange={onChangeValue}
				/>
			</Container>
		</>
	);
});

const Container = styled.div`
	margin-top: 18px;
	margin-bottom: 16px;
`;

const OrderSizingRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	margin-bottom: 8px;
	cursor: default;
`;

const InputHelpers = styled.div`
	display: flex;
`;

export default MarginInput;
