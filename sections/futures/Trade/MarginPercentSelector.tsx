import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';
import { editCrossMarginMarginDelta } from 'state/futures/actions';
import { selectIdleMargin } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber } from 'utils/formatters/number';

const PERCENT_OPTIONS = ['10%', '25%', '50%', '100%'];

export default function MarginPercentSelector() {
	const dispatch = useAppDispatch();
	const idleMargin = useAppSelector(selectIdleMargin);

	const onSelectPercent = (index: number) => {
		const percent = PERCENT_OPTIONS[index].replace('%', '');
		const margin = idleMargin.div(100).mul(percent);

		dispatch(editCrossMarginMarginDelta(floorNumber(margin).toString()));
	};

	return (
		<Container>
			<SegmentedControl onChange={onSelectPercent} styleType="button" values={PERCENT_OPTIONS} />
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;
