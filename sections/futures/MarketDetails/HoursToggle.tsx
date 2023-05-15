import { useCallback, useState } from 'react';
import styled from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import { FUNDING_RATE_PERIODS } from 'sdk/constants/period';
import { setSelectedInputFundingRateHour } from 'state/futures/reducer';
import { selectSelectedInpuHours } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import media from 'styles/media';

const HoursToggle: React.FC = () => {
	const dispatch = useAppDispatch();
	const fundingHours = useAppSelector(selectSelectedInpuHours);
	const [open, setOpen] = useState(false);
	const getLabelByValue = (value: number): string => FUNDING_RATE_PERIODS[value] ?? '1H';
	const updatePeriod = useCallback(
		(v) => {
			dispatch(setSelectedInputFundingRateHour(v));
			setOpen(!open);
		},
		[dispatch, open]
	);
	return (
		<ToggleContainer open={open}>
			<ToggleTable>
				<ToggleTableHeader
					style={{ borderBottomWidth: open ? '1px' : '0' }}
					onClick={() => setOpen(!open)}
				>
					{getLabelByValue(fundingHours)}
					<CaretDownIcon width={12} />
				</ToggleTableHeader>
				{open && (
					<ToggleTableRows>
						{Object.entries(FUNDING_RATE_PERIODS).map(([key, value]) => (
							<ToggleTableRow key={key} onClick={() => updatePeriod(Number(key))}>
								{value}
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
		:last-child {
			border-radius: 0px 0px 9px 9px;
		}
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

const ToggleContainer = styled.div<{ open: boolean }>`
	margin-left: 8px;
	cursor: pointer;
	z-index: 3;
	${media.lessThan('sm')`
		margin-right: 30px;
	`}

	margin-top: ${(props) => (props.open ? '82px' : '10px')};
`;

export default HoursToggle;
