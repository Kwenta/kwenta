import { wei } from '@synthetixio/wei';
import React, { useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';

import TextButton from 'components/Button/TextButton';
import InputHeaderRow from 'components/Input/InputHeaderRow';
import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { editTradeSizeInput } from 'state/futures/actions';
import {
	selectMarketPrice,
	selectPosition,
	selectTradeSizeInputs,
	selectCrossMarginOrderPrice,
	selectFuturesType,
	selectSelectedInputDenomination,
	selectMaxUsdSizeInput,
	selectCrossMarginMarginDelta,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber, isZero, zeroBN } from 'utils/formatters/number';

import { DenominationToggle } from './DenominationToggle';

type OrderSizingProps = {
	isMobile?: boolean;
	disabled?: boolean;
};

const OrderSizing: React.FC<OrderSizingProps> = memo(({ disabled, isMobile }) => {
	const dispatch = useAppDispatch();

	const { susdSizeString, nativeSizeString } = useAppSelector(selectTradeSizeInputs);

	const position = useAppSelector(selectPosition);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const marketAssetRate = useAppSelector(selectMarketPrice);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const assetInputType = useAppSelector(selectSelectedInputDenomination);
	const maxUsdInputAmount = useAppSelector(selectMaxUsdSizeInput);
	const marginDelta = useAppSelector(selectCrossMarginMarginDelta);

	const tradePrice = useMemo(() => (orderPrice ? wei(orderPrice) : marketAssetRate), [
		orderPrice,
		marketAssetRate,
	]);

	const maxNativeValue = useMemo(
		() => (!isZero(tradePrice) ? maxUsdInputAmount.div(tradePrice) : zeroBN),
		[tradePrice, maxUsdInputAmount]
	);

	const onSizeChange = useCallback(
		(value: string, assetType: 'native' | 'usd') => {
			dispatch(editTradeSizeInput(value, assetType));
		},
		[dispatch]
	);

	const handleSetMax = useCallback(() => {
		if (assetInputType === 'usd') {
			onSizeChange(String(floorNumber(maxUsdInputAmount)), 'usd');
		} else {
			onSizeChange(String(floorNumber(maxNativeValue)), 'native');
		}
	}, [onSizeChange, assetInputType, maxUsdInputAmount, maxNativeValue]);

	const onChangeValue = useCallback(
		(_, v: string) => {
			dispatch(editTradeSizeInput(v, assetInputType));
		},
		[dispatch, assetInputType]
	);

	const isDisabled = useMemo(() => {
		const remaining =
			selectedAccountType === 'isolated_margin' ? position?.remainingMargin || zeroBN : marginDelta;
		return remaining.lte(0) || disabled;
	}, [position?.remainingMargin, disabled, selectedAccountType, marginDelta]);

	const invalid =
		(assetInputType === 'usd' &&
			susdSizeString !== '' &&
			maxUsdInputAmount.lte(susdSizeString || 0)) ||
		(assetInputType === 'native' &&
			nativeSizeString !== '' &&
			maxNativeValue.lte(nativeSizeString || 0));

	return (
		<OrderSizingContainer>
			<InputHeaderRow
				label={
					<InputTitle>
						Amount&nbsp; —<span>&nbsp; Set order size</span>
					</InputTitle>
				}
				rightElement={
					<InputHelpers>
						<TextButton onClick={handleSetMax}>Max</TextButton>
					</InputHelpers>
				}
			/>

			<NumericInput
				invalid={invalid}
				dataTestId={'set-order-size-amount-susd' + (isMobile ? '-mobile' : '-desktop')}
				disabled={isDisabled}
				right={<DenominationToggle />}
				value={assetInputType === 'usd' ? susdSizeString : nativeSizeString}
				placeholder="0.00"
				onChange={onChangeValue}
			/>
		</OrderSizingContainer>
	);
});

const OrderSizingContainer = styled.div`
	margin-bottom: 16px;
`;

const InputHelpers = styled.div`
	display: flex;
`;

export default OrderSizing;
