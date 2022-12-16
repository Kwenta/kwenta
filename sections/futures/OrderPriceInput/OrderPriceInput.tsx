import { wei } from '@synthetixio/wei';
import { debounce } from 'lodash';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import CustomInput from 'components/Input/CustomInput';
import InputTitle from 'components/Input/InputTitle';
import SegmentedControl from 'components/SegmentedControl';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { FuturesOrderType } from 'queries/futures/types';
import { selectMarketPrice, selectMarketInfo, selectLeverageSide } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { orderFeeCapState } from 'store/futures';
import { weiToString, zeroBN } from 'utils/formatters/number';
import { orderPriceInvalidLabel } from 'utils/futures';

type Props = {
	value: string;
	isDisabled?: boolean;
	orderType: FuturesOrderType;
	onChangeOrderPrice: (value: string) => void;
};

const FEE_CAP_OPTIONS = ['none', '0.5%', '1%', '2%', '5%'];

export default function OrderPriceInput({
	isDisabled,
	value,
	orderType,
	onChangeOrderPrice,
}: Props) {
	const { t } = useTranslation();
	const marketPrice = useAppSelector(selectMarketPrice);
	const leverageSide = useAppSelector(selectLeverageSide);
	const [selectedFeeCap, setSelectedFeeCap] = useRecoilState(orderFeeCapState);
	const marketInfo = useAppSelector(selectMarketInfo);

	const [localValue, setLocalValue] = useState(value);

	useEffect(() => {
		if (!value) setLocalValue(value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	useEffect(() => {
		// Reset input when the selected market changes
		setLocalValue('');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [marketInfo?.asset]);

	const minMaxLabelString = useMemo(
		() => orderPriceInvalidLabel(value, leverageSide, marketPrice, orderType),
		[value, orderType, leverageSide, marketPrice]
	);

	// eslint-disable-next-line
	const debounceUpdate = useCallback(
		debounce((v: string) => {
			onChangeOrderPrice(v);
		}, 500),
		[onChangeOrderPrice, debounce]
	);

	const handleOnChange = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			setLocalValue(v);
			debounceUpdate(v);
		},
		[debounceUpdate, setLocalValue]
	);

	const onChangeFeeCap = (index: number) => {
		const val = FEE_CAP_OPTIONS[index];
		if (val === 'none') {
			setSelectedFeeCap(zeroBN);
		} else {
			setSelectedFeeCap(wei(val.replace('%', '')));
		}
	};

	const selectedFeeCapLabel = selectedFeeCap.eq(0) ? 'none' : weiToString(selectedFeeCap) + '%';

	return (
		<>
			<StyledInputTitle margin="10px 0">
				{orderType} Price{' '}
				{minMaxLabelString && (
					<>
						&nbsp; —<span>&nbsp; {minMaxLabelString}</span>
					</>
				)}
			</StyledInputTitle>
			<CustomInput
				invalid={!!minMaxLabelString}
				dataTestId="order-price-input"
				disabled={isDisabled}
				right={'sUSD'}
				value={localValue}
				placeholder="0.0"
				onChange={handleOnChange}
			/>
			<FeeCapContainer>
				<StyledTooltip
					width={'310px'}
					height="auto"
					style={{ padding: '0 15px', textTransform: 'none' }}
					content={t('futures.market.trade.orders.fee-rejection-tooltip')}
				>
					<FeeRejectionLabel>
						{t('futures.market.trade.orders.fee-rejection-label')}:
					</FeeRejectionLabel>
				</StyledTooltip>
				<SegmentedControl
					onChange={onChangeFeeCap}
					selectedIndex={FEE_CAP_OPTIONS.indexOf(selectedFeeCapLabel)}
					styleType="button"
					values={FEE_CAP_OPTIONS}
				/>
			</FeeCapContainer>
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

const FeeCapContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 10px 0;
`;

const FeeRejectionLabel = styled.div`
	min-width: 100px;
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	cursor: default;
`;
