import { capitalize } from 'lodash';
import { ChangeEvent, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CustomInput from 'components/Input/CustomInput';
import InputTitle from 'components/Input/InputTitle';
import { FuturesOrderType } from 'queries/futures/types';
import { leverageSideState, marketAssetRateState } from 'store/futures';
import { orderPriceInvalidLabel } from 'utils/futures';

type Props = {
	value: string;
	isDisabled?: boolean;
	orderType: FuturesOrderType;
	onChangeOrderPrice: (value: string) => void;
};

export default function OrderPriceInput({
	isDisabled,
	value,
	orderType,
	onChangeOrderPrice,
}: Props) {
	const marketAssetRate = useRecoilValue(marketAssetRateState);
	const leverageSide = useRecoilValue(leverageSideState);

	const minMaxLabelString = useMemo(
		() => orderPriceInvalidLabel(value, leverageSide, marketAssetRate, orderType),
		[value, orderType, leverageSide, marketAssetRate]
	);

	const handleOnChange = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		onChangeOrderPrice(v);
	};

	return (
		<>
			<StyledInputTitle margin="10px 0">
				{capitalize(orderType)} Price{' '}
				{minMaxLabelString && (
					<>
						&nbsp; —<span>&nbsp; {minMaxLabelString}</span>
					</>
				)}
			</StyledInputTitle>
			<CustomInput
				dataTestId="set-order-size-amount-susd"
				disabled={isDisabled}
				right={'sUSD'}
				value={value}
				placeholder="0.0"
				onChange={handleOnChange}
			/>
		</>
	);
}

const StyledInputTitle = styled(InputTitle)`
	span {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}
`;
