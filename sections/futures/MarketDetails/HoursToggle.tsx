import { memo, useCallback } from 'react';
import styled from 'styled-components';

import SwitchAssetArrows from 'assets/svg/futures/switch-arrows.svg';
import Pill from 'components/Pill';
import { setSelectedInputFundingRateHour } from 'state/futures/reducer';
import { selectSelectedInpuHours } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

export const HoursToggle = memo(() => {
	const fundingHours = useAppSelector(selectSelectedInpuHours);
	const dispatch = useAppDispatch();

	const toggleHours = useCallback(() => {
		dispatch(setSelectedInputFundingRateHour(fundingHours === '1' ? '8' : '1'));
	}, [dispatch, fundingHours]);

	return (
		<PillContainer>
			<Pill size="xs" weight="bold" roundedCorner={false} onClick={toggleHours}>
				{fundingHours === '1' ? '1H' : '8H'}
				<SwitchAssetArrows height={6} />
			</Pill>
		</PillContainer>
	);
});

const PillContainer = styled.div`
	margin-left: 8px;
`;
