import { wei } from '@synthetixio/wei';
import React, { useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';

import TextButton from 'components/Button/TextButton';
import InputHeaderRow from 'components/Input/InputHeaderRow';
import InputTitle, { InputTitleSpan } from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { ZERO_WEI } from 'sdk/constants/number';
import { floorNumber, formatCryptoCurrency, formatDollars, isZero } from 'sdk/utils/number';
import { editTradeSizeInput } from 'state/futures/actions';
import {
	selectMarketPrice,
	selectPosition,
	selectTradeSizeInputs,
	selectCrossMarginOrderPrice,
	selectSelectedInputDenomination,
	selectMaxUsdSizeInput,
	selectLeverageSide,
	selectAvailableOi,
	selectTradeSizeInputsDisabled,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import { DenominationToggle } from './DenominationToggle';

type OrderSizingProps = {
	isMobile?: boolean;
};

const OrderSizing: React.FC<OrderSizingProps> = memo(({ isMobile }) => {
	const dispatch = useAppDispatch();

	const { susdSizeString, nativeSizeString } = useAppSelector(selectTradeSizeInputs);

	const position = useAppSelector(selectPosition);
	const marketAssetRate = useAppSelector(selectMarketPrice);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const assetInputType = useAppSelector(selectSelectedInputDenomination);
	const maxUsdInputAmount = useAppSelector(selectMaxUsdSizeInput);
	const tradeSide = useAppSelector(selectLeverageSide);
	const availableOi = useAppSelector(selectAvailableOi);
	const isDisabled = useAppSelector(selectTradeSizeInputsDisabled);

	const tradePrice = useMemo(() => (orderPrice ? wei(orderPrice) : marketAssetRate), [
		orderPrice,
		marketAssetRate,
	]);

	const increasingPosition = !position?.position?.side || position?.position?.side === tradeSide;

	const availableOiUsd = useMemo(() => {
		return increasingPosition
			? availableOi[tradeSide].usd
			: availableOi[tradeSide].usd.add(position?.position?.notionalValue || 0);
	}, [tradeSide, availableOi, increasingPosition, position?.position?.notionalValue]);

	const availableOiNative = useMemo(() => {
		return increasingPosition
			? availableOi[tradeSide].native
			: availableOi[tradeSide].native.add(position?.position?.size || 0);
	}, [tradeSide, availableOi, increasingPosition, position?.position?.size]);

	const maxNativeValue = useMemo(() => {
		const max = !isZero(tradePrice) ? maxUsdInputAmount.div(tradePrice) : ZERO_WEI;
		return max.lt(availableOiNative) ? max : availableOiNative;
	}, [tradePrice, maxUsdInputAmount, availableOiNative]);

	const onSizeChange = useCallback(
		(value: string, assetType: 'native' | 'usd') => {
			dispatch(editTradeSizeInput(value, assetType));
		},
		[dispatch]
	);

	const handleSetMax = useCallback(() => {
		onSizeChange(String(floorNumber(maxNativeValue)), 'native');
	}, [onSizeChange, maxNativeValue]);

	const onChangeValue = useCallback(
		(_, v: string) => {
			dispatch(editTradeSizeInput(v, assetInputType));
		},
		[dispatch, assetInputType]
	);

	const invalid = useMemo(() => {
		return (
			(assetInputType === 'usd' &&
				susdSizeString !== '' &&
				maxUsdInputAmount.lte(susdSizeString || 0)) ||
			(assetInputType === 'native' &&
				nativeSizeString !== '' &&
				maxNativeValue.lte(nativeSizeString || 0)) ||
			availableOiUsd.lt(susdSizeString || 0)
		);
	}, [
		assetInputType,
		maxNativeValue,
		nativeSizeString,
		availableOiUsd,
		maxUsdInputAmount,
		susdSizeString,
	]);

	return (
		<OrderSizingContainer>
			<InputHeaderRow
				disabled={isDisabled}
				label={
					<InputTitle>
						Size
						{maxUsdInputAmount.gt(availableOiUsd) ? (
							<InputTitleSpan invalid={availableOiUsd.lt(susdSizeString || 0)}>
								&nbsp; — &nbsp; Available OI{' '}
								{assetInputType === 'usd'
									? formatDollars(availableOiUsd, { suggestDecimals: true })
									: formatCryptoCurrency(availableOiNative, { suggestDecimals: true })}
							</InputTitleSpan>
						) : (
							<InputTitleSpan invalid={maxUsdInputAmount.lt(susdSizeString || 0)}>
								&nbsp; — &nbsp; Max size{' '}
								{assetInputType === 'usd'
									? formatDollars(maxUsdInputAmount, { suggestDecimals: true })
									: formatCryptoCurrency(maxNativeValue, { suggestDecimals: true })}
							</InputTitleSpan>
						)}
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
