import { wei } from '@synthetixio/wei';
import { capitalize } from 'lodash';
import { ChangeEvent, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CustomInput from 'components/Input/CustomInput';
import InputTitle from 'components/Input/InputTitle';
import { FuturesOrderType } from 'queries/futures/types';
import { leverageSideState, marketAssetRateState } from 'store/futures';
import { formatNumber, zeroBN } from 'utils/formatters/number';

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

	const minMax = useMemo(() => {
		const isLong = leverageSide === 'long';
		return {
			min: isLong ? zeroBN : marketAssetRate,
			max: isLong ? marketAssetRate : zeroBN,
		};
	}, [leverageSide, marketAssetRate]);

	const minMaxLabelString = useMemo(() => {
		if (!value) return '';
		const isLong = leverageSide === 'long';
		if (isLong && wei(value).gt(minMax.max)) return 'max ' + formatNumber(minMax.max);
		if (!isLong && wei(value).lt(minMax.min)) return 'min ' + formatNumber(minMax.min);
		return '';
	}, [minMax, value, leverageSide]);

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
