import { wei } from '@synthetixio/wei';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import StyledSlider from 'components/Slider/StyledSlider';
import { useFuturesContext } from 'contexts/FuturesContext';
import {
	crossMarginAvailableMarginState,
	crossMarginLeverageState,
	leverageSideState,
	positionState,
} from 'store/futures';
import { FlexDivRow } from 'styles/common';
import { zeroBN } from 'utils/formatters/number';

import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from '../Trade/ManagePosition';
import MarketsDropdown from '../Trade/MarketsDropdown';
import FeesBox from './CrossMarginFeesBox';
import MarginInfoBox from './MarginInfoBox';

export default function TradeCrossMargin() {
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const freeMargin = useRecoilValue(crossMarginAvailableMarginState);
	const position = useRecoilValue(positionState);
	const leverage = useRecoilValue(crossMarginLeverageState);

	const { onTradeAmountSUSDChange } = useFuturesContext();

	const currentMargin = (position?.remainingMargin || zeroBN).toNumber();
	const totalMargin = freeMargin.add(currentMargin).toNumber();

	const [percent, setPercent] = useState(0);

	// eslint-disable-next-line
	const onChangeMarginPercent = useCallback(
		debounce((value) => {
			const maxSize = wei(leverage).mul(totalMargin);
			const sizeRange =
				leverageSide === 'long'
					? maxSize.sub(position?.position?.notionalValue || '0')
					: maxSize.add(position?.position?.notionalValue || '0');
			const fraction = value / 100;
			const usdAmount = sizeRange.mul(fraction).toString();
			onTradeAmountSUSDChange(Number(usdAmount).toFixed(0));
		}, 500),
		[debounce, onTradeAmountSUSDChange, leverage, totalMargin]
	);

	useEffect(() => {
		return () => onChangeMarginPercent?.cancel();
	}, [onChangeMarginPercent]);

	const onChangeSlider = (_: React.ChangeEvent<{}>, value: number | number[]) => {
		setPercent(value as number);
		onChangeMarginPercent(value);
	};

	return (
		<>
			<MarketsDropdown />
			<MarginInfoBox />
			<OrderSizing />
			<SliderRow>
				<StyledSlider
					minValue={0}
					maxValue={100}
					step={1}
					defaultValue={percent}
					value={percent}
					onChange={onChangeSlider}
					onChangeCommitted={() => {}}
					marks={[
						{ value: 0, label: `0%` },
						{ value: 100, label: `100%` },
					]}
					valueLabelDisplay="on"
					valueLabelFormat={(v) => `${v}%`}
					$currentMark={percent}
				/>
			</SliderRow>
			<PositionButtons selected={leverageSide} onSelect={setLeverageSide} />
			<ManagePosition />
			<FeesBox />
		</>
	);
}

const SliderRow = styled(FlexDivRow)`
	margin-top: 8px;
	margin-bottom: 32px;
	position: relative;
`;
