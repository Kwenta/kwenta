import { ChangeEvent, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import CustomInput from 'components/Input/CustomInput';
import InputTitle from 'components/Input/InputTitle';
import { OrderNameByType } from 'sdk/utils/futures';
import { editTradeOrderPrice } from 'state/futures/actions';
import {
	selectLeverageSide,
	selectMarketPrice,
	selectCrossMarginOrderPrice,
	selectOrderType,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { orderPriceInvalidLabel } from 'utils/futures';

export default function OrderPriceInput() {
	const dispatch = useAppDispatch();
	const marketPrice = useAppSelector(selectMarketPrice);
	const leverageSide = useAppSelector(selectLeverageSide);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const orderType = useAppSelector(selectOrderType);

	const minMaxLabelString = useMemo(
		() => orderPriceInvalidLabel(orderPrice, leverageSide, marketPrice, orderType),
		[orderPrice, orderType, leverageSide, marketPrice]
	);

	const handleOnChange = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(editTradeOrderPrice(v));
		},
		[dispatch]
	);

	return (
		<>
			<StyledInputTitle margin="10px 0">
				{OrderNameByType[orderType]} Price{' '}
				{minMaxLabelString && (
					<>
						&nbsp; —<span>&nbsp; {minMaxLabelString}</span>
					</>
				)}
			</StyledInputTitle>
			<CustomInput
				invalid={!!minMaxLabelString}
				dataTestId="order-price-input"
				right="sUSD"
				value={orderPrice}
				placeholder="0.0"
				onChange={handleOnChange}
			/>
		</>
	);
}

const StyledInputTitle = styled(InputTitle)`
	text-transform: capitalize;
	span {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}
	cursor: default;
`;
