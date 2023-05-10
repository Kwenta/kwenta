import { useCallback, useState } from 'react';
import styled from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import CaretUpIcon from 'assets/svg/app/caret-up.svg';
import { setSelectedInputFundingRateHour } from 'state/futures/reducer';
import { selectSelectedInpuHours } from 'state/futures/selectors';
import { InputFundingRateHours } from 'state/futures/types';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import media from 'styles/media';

type HoursToggleProps = {
	hours: InputFundingRateHours[];
};

const HoursToggle: React.FC<HoursToggleProps> = ({ hours }) => {
	const dispatch = useAppDispatch();
	const fundingHours = useAppSelector(selectSelectedInpuHours);
	const [open, setOpen] = useState(true);
	const [index, setIndex] = useState(hours.indexOf(fundingHours));
	const periodDisplay = (i: number) => (i === 3 ? '1Y' : hours[i] + 'H');
	const updatePeriod = useCallback(
		(v) => {
			dispatch(setSelectedInputFundingRateHour(v));
			setIndex(hours.indexOf(v));
			setOpen(!open);
		},
		[dispatch, hours, open]
	);
	return (
		<ToggleContainer>
			<ToggleTable style={{ position: 'fixed' }}>
				<ToggleTableHeader
					style={{ borderBottomWidth: open ? '1px' : '0' }}
					onClick={() => setOpen(!open)}
				>
					{periodDisplay(index)}
					{open ? <CaretUpIcon width={12} /> : <CaretDownIcon width={12} />}
				</ToggleTableHeader>
				{open && (
					<ToggleTableRows>
						{hours.map((value, i) => (
							<ToggleTableRow key={value} onClick={() => updatePeriod(value)}>
								{periodDisplay(i)}
							</ToggleTableRow>
						))}
					</ToggleTableRows>
				)}
			</ToggleTable>
		</ToggleContainer>
	);
};

const ToggleTableRow = styled.div`
	margin: auto;
	padding: 1.5px 6px;
	height: 18px;
	:hover {
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
		background: ${(props) =>
			props.theme.colors.selectedTheme.newTheme.pill['gray'].hover.background};
	}
`;

const ToggleTableRows = styled.div`
	> div:not(:last-child) {
		border-bottom: 1px solid
			${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].border};
	}
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
`;
const ToggleTableHeader = styled.div`
	display: flex;
	justify-content: space-evenly;
	align-items: center;
	height: 18px;
	border-bottom-style: solid;
	border-bottom-color: ${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].border};
`;

const ToggleTable = styled.div`
	display: flex;
	flex-direction: column;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].background};
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.pill['gray'].border};
	border-radius: 9px;
	width: 47px;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
`;

const ToggleContainer = styled.div`
	margin-left: 8px;
	cursor: pointer;
	z-index: 100;
	${media.lessThan('sm')`
		margin-right: 30px;
	`}
	margin-bottom: 2px;
`;

export default HoursToggle;
