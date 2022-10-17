import { wei } from '@synthetixio/wei';
import { capitalize } from 'lodash';
import { ChangeEvent, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CustomInput from 'components/Input/CustomInput';
import InputTitle from 'components/Input/InputTitle';
import SegmentedControl from 'components/SegmentedControl';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { FuturesOrderType } from 'queries/futures/types';
import { leverageSideState, marketAssetRateState, orderFeeCapState } from 'store/futures';
import { ceilNumber, floorNumber, weiToString, zeroBN } from 'utils/formatters/number';
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
	const marketAssetRate = useRecoilValue(marketAssetRateState);
	const leverageSide = useRecoilValue(leverageSideState);
	const [selectedFeeCap, setSelectedFeeCap] = useRecoilState(orderFeeCapState);

	useEffect(() => {
		if (!value) {
			const priceNum =
				orderType === 'limit' ? floorNumber(marketAssetRate) : ceilNumber(marketAssetRate);
			onChangeOrderPrice(String(priceNum));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const minMaxLabelString = useMemo(
		() => orderPriceInvalidLabel(value, leverageSide, marketAssetRate, orderType),
		[value, orderType, leverageSide, marketAssetRate]
	);

	const handleOnChange = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		onChangeOrderPrice(v);
	};

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
				{capitalize(orderType)} Price{' '}
				{minMaxLabelString && (
					<>
						&nbsp; —<span>&nbsp; {minMaxLabelString}</span>
					</>
				)}
			</StyledInputTitle>
			<CustomInput
				invalid={!!minMaxLabelString}
				dataTestId="set-order-size-amount-susd"
				disabled={isDisabled}
				right={'sUSD'}
				value={value}
				placeholder="0.0"
				onChange={handleOnChange}
			/>
			<FeeCapContainer>
				<StyledTooltip
					width={'310px'}
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
