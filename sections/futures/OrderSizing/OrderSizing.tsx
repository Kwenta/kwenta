import { wei } from '@synthetixio/wei';
import React, { useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';

import SwitchAssetArrows from 'assets/svg/futures/switch-arrows.svg';
import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivRow } from 'components/layout/flex';
import { editTradeSizeInput } from 'state/futures/actions';
import { setSelectedInputDenomination } from 'state/futures/reducer';
import {
	selectMarketPrice,
	selectPosition,
	selectTradeSizeInputs,
	selectCrossMarginOrderPrice,
	selectOrderType,
	selectLeverageSide,
	selectFuturesType,
	selectMarketAsset,
	selectSelectedInputDenomination,
	selectMaxUsdInputAmount,
	selectCrossMarginMarginDelta,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber, isZero, zeroBN } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

type OrderSizingProps = {
	isMobile?: boolean;
	disabled?: boolean;
};

const DenominationToggle = memo(() => {
	const assetInputType = useAppSelector(selectSelectedInputDenomination);
	const dispatch = useAppDispatch();
	const marketAsset = useAppSelector(selectMarketAsset);

	const toggleDenomination = useCallback(() => {
		dispatch(setSelectedInputDenomination(assetInputType === 'usd' ? 'native' : 'usd'));
	}, [dispatch, assetInputType]);

	return (
		<InputButton onClick={toggleDenomination}>
			{assetInputType === 'usd' ? 'sUSD' : getDisplayAsset(marketAsset)}{' '}
			<span>{<SwitchAssetArrows />}</span>
		</InputButton>
	);
});

const OrderSizing: React.FC<OrderSizingProps> = memo(({ disabled, isMobile }) => {
	const dispatch = useAppDispatch();

	const { susdSizeString, nativeSizeString } = useAppSelector(selectTradeSizeInputs);

	const position = useAppSelector(selectPosition);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const orderType = useAppSelector(selectOrderType);
	const marketAssetRate = useAppSelector(selectMarketPrice);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const selectedLeverageSide = useAppSelector(selectLeverageSide);
	const assetInputType = useAppSelector(selectSelectedInputDenomination);
	const maxUsdInputAmount = useAppSelector(selectMaxUsdInputAmount);
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

	const handleSetPositionSize = () => {
		onSizeChange(position?.position?.size.toString() ?? '0', 'native');
	};

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

	const showPosSizeHelper =
		position?.position?.size &&
		(orderType === 'limit' || orderType === 'stop_market') &&
		position?.position.side !== selectedLeverageSide;

	const invalid =
		(assetInputType === 'usd' &&
			susdSizeString !== '' &&
			maxUsdInputAmount.lte(susdSizeString || 0)) ||
		(assetInputType === 'native' &&
			nativeSizeString !== '' &&
			maxNativeValue.lte(nativeSizeString || 0));

	return (
		<OrderSizingContainer>
			<OrderSizingRow>
				<InputTitle>
					Amount&nbsp; —<span>&nbsp; Set order size</span>
				</InputTitle>
				<InputHelpers>
					<MaxButton onClick={handleSetMax}>Max</MaxButton>
					{showPosSizeHelper && (
						<MaxButton onClick={handleSetPositionSize}>Position Size</MaxButton>
					)}
				</InputHelpers>
			</OrderSizingRow>

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

export const InputButton = styled.button`
	height: 22px;
	padding: 3px 2px 4px 10px;
	border: none;
	background: transparent;
	font-size: 16px;
	line-height: 16px;
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	cursor: pointer;
	&:hover {
		svg > path {
			fill: ${(props) => props.theme.colors.selectedTheme.input.hover};
		}
	}
`;

const InputHelpers = styled.div`
	display: flex;
`;

export default OrderSizing;
