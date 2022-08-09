import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';
import StyledSlider from 'components/Slider/StyledSlider';
import { leverageSideState, orderTypeState } from 'store/futures';
import { FlexDivRow } from 'styles/common';

import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from '../Trade/ManagePosition';
import MarketsDropdown from '../Trade/MarketsDropdown';
import MarginInfoBox from './MarginInfoBox';

export default function TradeCrossMargin() {
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);

	return (
		<>
			<MarketsDropdown />
			<MarginInfoBox />
			<StyledSegmentedControl
				values={['Market', 'Next-Price']}
				selectedIndex={orderType}
				onChange={setOrderType}
			/>
			<OrderSizing />
			<SliderRow>
				<StyledSlider
					minValue={1}
					maxValue={10}
					step={0.1}
					defaultValue={1}
					value={1}
					onChange={() => {}}
					onChangeCommitted={() => {}}
					marks={[
						{ value: 1, label: `1x` },
						{ value: 10, label: `10x` },
					]}
					valueLabelDisplay="on"
					valueLabelFormat={(v) => `${v}x`}
					$currentMark={1}
				/>
			</SliderRow>
			<PositionButtons selected={leverageSide} onSelect={setLeverageSide} />
			<ManagePosition />
		</>
	);
}

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

const SliderRow = styled(FlexDivRow)`
	margin-top: 8px;
	margin-bottom: 32px;
	position: relative;
`;
