import Wei, { wei } from '@synthetixio/wei';
import React, { useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';

import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivRow } from 'components/layout/flex';
import Spacer from 'components/Spacer';
import { selectShowPositionModal } from 'state/app/selectors';
import { editClosePositionSizeDelta } from 'state/futures/actions';
import {
	selectPosition,
	selectOrderType,
	selectLeverageSide,
	selectClosePositionOrderInputs,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber, zeroBN } from 'utils/formatters/number';

type OrderSizingProps = {
	maxNativeValue: Wei;
	isMobile?: boolean;
};

const ClosePositionSizeInput: React.FC<OrderSizingProps> = memo(({ isMobile, maxNativeValue }) => {
	const dispatch = useAppDispatch();

	const { nativeSizeDelta } = useAppSelector(selectClosePositionOrderInputs);
	const position = useAppSelector(selectPosition);
	const orderType = useAppSelector(selectOrderType);
	const selectedLeverageSide = useAppSelector(selectLeverageSide);
	const modal = useAppSelector(selectShowPositionModal);

	const onSizeChange = useCallback(
		(value: string) => {
			if (modal) {
				dispatch(editClosePositionSizeDelta(modal.marketKey, value));
			}
		},
		[dispatch, modal]
	);

	const handleSetMax = useCallback(() => {
		onSizeChange(String(floorNumber(maxNativeValue)));
	}, [onSizeChange, maxNativeValue]);

	const onChangeValue = useCallback(
		(_, v: string) => {
			onSizeChange(v);
		},
		[onSizeChange]
	);

	const nativeSizeDeltaWei = useMemo(() => {
		return !nativeSizeDelta || isNaN(Number(nativeSizeDelta)) ? zeroBN : wei(nativeSizeDelta);
	}, [nativeSizeDelta]);

	const invalid = nativeSizeDelta !== '' && maxNativeValue.lte(nativeSizeDeltaWei);

	return (
		<OrderSizingContainer>
			<OrderSizingRow>
				<InputTitle>Amount to close</InputTitle>
				<InputHelpers>
					<MaxButton onClick={handleSetMax}>Max</MaxButton>
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
		</OrderSizingContainer>
	);
});

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

export default ClosePositionSizeInput;
