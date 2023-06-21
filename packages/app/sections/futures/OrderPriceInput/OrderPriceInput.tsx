import { FuturesOrderType, PositionSide } from '@kwenta/sdk/types';
import { OrderNameByType } from '@kwenta/sdk/utils';
import Wei from '@synthetixio/wei';
import { ChangeEvent, useMemo } from 'react';
import styled from 'styled-components';

import InputHeaderRow from 'components/Input/InputHeaderRow';
import InputTitle from 'components/Input/InputTitle';
import NumericInput from 'components/Input/NumericInput';
import { orderPriceInvalidLabel } from 'utils/futures';

type Props = {
	orderPrice: string;
	marketPrice: Wei;
	orderType: FuturesOrderType;
	positionSide: PositionSide;
	onChange: (e: ChangeEvent<HTMLInputElement>, v: string) => any;
};

export default function OrderPriceInput({
	orderPrice,
	orderType,
	positionSide,
	marketPrice,
	onChange,
}: Props) {
	const minMaxLabelString = useMemo(
		() => orderPriceInvalidLabel(orderPrice, positionSide, marketPrice, orderType),
		[orderPrice, orderType, positionSide, marketPrice]
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
				value={orderPrice}
				placeholder="0.0"
				onChange={onChange}
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
