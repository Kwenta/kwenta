import { useCallback, useState } from 'react';
import styled from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import Pill from 'components/Pill';
import { setSelectedInputFundingRateHour } from 'state/futures/reducer';
import { selectSelectedInpuHours } from 'state/futures/selectors';
import { InputFundingRateHours } from 'state/futures/types';
import { useAppDispatch, useAppSelector } from 'state/hooks';

type HoursToggleProps = {
	hours: InputFundingRateHours[];
};

const HoursToggle: React.FC<HoursToggleProps> = ({ hours }) => {
	const dispatch = useAppDispatch();
	const fundingHours = useAppSelector(selectSelectedInpuHours);
	const [index, setIndex] = useState(hours.indexOf(fundingHours));
	const toggleHours = useCallback(() => {
		const nextIndex = (index + 1) % hours.length;
		setIndex(nextIndex);
		dispatch(setSelectedInputFundingRateHour(hours[nextIndex]));
	}, [dispatch, hours, index]);

	return (
		<PillContainer>
			<Pill size="xs" weight="bold" roundedCorner={false} onClick={toggleHours} toggle>
				{index === 3 ? '1Y' : hours[index] + 'H'}
				<CaretDownIcon height={7} width={12} />
			</Pill>
		</PillContainer>
	);
};

const PillContainer = styled.div`
	margin-left: 8px;
	z-index: 200;
`;

export default HoursToggle;
