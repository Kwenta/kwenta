import { wei } from '@synthetixio/wei';
import React, { ChangeEvent, useMemo, memo } from 'react';
import styled from 'styled-components';

import SwitchAssetArrows from 'assets/svg/futures/switch-arrows.svg';
import CustomInput from 'components/Input/CustomInput';
import InputTitle from 'components/Input/InputTitle';
import { FlexDivRow } from 'components/layout/flex';
import { editTradeSizeInput } from 'state/futures/actions';
import { setSelectedInputDenomination } from 'state/futures/reducer';
import {
	selectMarketPrice,
	selectCrossMarginBalanceInfo,
	selectPosition,
	selectTradeSizeInputs,
	selectCrossMarginOrderPrice,
	selectOrderType,
	selectLeverageSide,
	selectFuturesType,
	selectMarketAsset,
	selectSelectedInputDenomination,
	selectMaxUsdInputAmount,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber, isZero, zeroBN } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

import OrderSizeSlider from './OrderSizeSlider';

type OrderSizingProps = {
	isMobile?: boolean;
	disabled?: boolean;
};

const OrderSizing: React.FC<OrderSizingProps> = memo(({ disabled, isMobile }) => {
	const dispatch = useAppDispatch();

	const { susdSizeString, nativeSizeString } = useAppSelector(selectTradeSizeInputs);

	const { freeMargin: freeCrossMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const position = useAppSelector(selectPosition);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const orderType = useAppSelector(selectOrderType);
	const marketAssetRate = useAppSelector(selectMarketPrice);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const selectedLeverageSide = useAppSelector(selectLeverageSide);
	const assetInputType = useAppSelector(selectSelectedInputDenomination);
	const maxUsdInputAmount = useAppSelector(selectMaxUsdInputAmount);

	const marketAsset = useAppSelector(selectMarketAsset);

	const tradePrice = useMemo(() => (orderPrice ? wei(orderPrice) : marketAssetRate), [
		orderPrice,
		marketAssetRate,
	]);
	const maxNativeValue = useMemo(
		() => (!isZero(tradePrice) ? maxUsdInputAmount.div(tradePrice) : zeroBN),
		[tradePrice, maxUsdInputAmount]
	);

	const onSizeChange = (value: string, assetType: 'native' | 'usd') => {
		dispatch(editTradeSizeInput(value, assetType));
	};

	const handleSetMax = () => {
		if (assetInputType === 'usd') {
			onSizeChange(String(floorNumber(maxUsdInputAmount)), 'usd');
		} else {
			onSizeChange(String(floorNumber(maxNativeValue)), 'native');
		}
	};

	const handleSetPositionSize = () => {
		onSizeChange(position?.position?.size.toString() ?? '0', 'native');
	};

	const onChangeValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		dispatch(editTradeSizeInput(v, assetInputType));
	};

	const isDisabled = useMemo(() => {
		const remaining =
			selectedAccountType === 'isolated_margin'
				? position?.remainingMargin || zeroBN
				: freeCrossMargin;
		return remaining.lte(0) || disabled;
	}, [position?.remainingMargin, disabled, selectedAccountType, freeCrossMargin]);

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
		<>
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

				<CustomInput
					invalid={invalid}
					dataTestId={'set-order-size-amount-susd' + (isMobile ? '-mobile' : '-desktop')}
					disabled={isDisabled}
					right={
						<InputButton
							onClick={() =>
								dispatch(setSelectedInputDenomination(assetInputType === 'usd' ? 'native' : 'usd'))
							}
						>
							{assetInputType === 'usd' ? 'sUSD' : getDisplayAsset(marketAsset)}{' '}
							<span>{<SwitchAssetArrows />}</span>
						</InputButton>
					}
					value={assetInputType === 'usd' ? susdSizeString : nativeSizeString}
					placeholder="0.00"
					onChange={onChangeValue}
				/>
			</OrderSizingContainer>
			{selectedAccountType === 'cross_margin' && <OrderSizeSlider />}
		</>
	);
});

const OrderSizingContainer = styled.div`
	margin-top: 18px;
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

const InputButton = styled.button`
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
