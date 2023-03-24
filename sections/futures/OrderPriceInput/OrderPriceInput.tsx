import { ChangeEvent, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import InputHeaderRow from 'components/Input/InputHeaderRow';
import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
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
			<InputHeaderRow
				label={
					<StyledInputTitle>
						{OrderNameByType[orderType]} Price{' '}
						{minMaxLabelString && (
							<>
								&nbsp; —<span>&nbsp; {minMaxLabelString}</span>
							</>
						)}
					</StyledInputTitle>
				}
			></InputHeaderRow>
			<NumericInput
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
`;
