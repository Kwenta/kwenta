import { Dispatch, FC, SetStateAction } from 'react';
import styled from 'styled-components';

import Button from 'components/Button';

const Container = styled.div`
	display: flex;
	gap: 4px;
	position: absolute;
	right: 20px;
	top: 20px;
	z-index: 1;
`;

const StyledBtn = styled(Button)`
	width: 40px;
	height: 24px;
	border: 0.669444px solid rgba(255, 255, 255, 0.1);
	border-color: ${(props) =>
		props.isActive ? props.theme.colors.common.primaryGold : 'rgba(255, 255, 255, 0.1)'};
	border-radius: 7px;
	box-shadow: 0px 1.33889px 1.33889px rgba(0, 0, 0, 0.25),
		inset 0px 0px 13.3889px rgba(255, 255, 255, 0.03);
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 11px;
	text-align: center;
	text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5);
	padding: 0;

	&:hover,
	&:active {
		border-color: ${(props) => props.theme.colors.common.primaryGold};
	}

	&:before {
		content: unset;
	}
`;

type TimeRangeSwitcherProps = {
	is24H: boolean;
	setIs24H: Dispatch<SetStateAction<boolean>>;
	isWeek: boolean;
	setIsWeek: Dispatch<SetStateAction<boolean>>;
	isMonth: boolean;
	setIsMonth: Dispatch<SetStateAction<boolean>>;
	isMax: boolean;
	setIsMax: Dispatch<SetStateAction<boolean>>;
};

export const TimeRangeSwitcher: FC<TimeRangeSwitcherProps> = ({
	is24H,
	setIs24H,
	isWeek,
	setIsWeek,
	isMonth,
	setIsMonth,
	isMax,
	setIsMax,
}) => {
	return (
		<Container>
			<StyledBtn
				onClick={() => {
					setIs24H(true);
					setIsWeek(false);
					setIsMax(false);
					setIsMonth(false);
				}}
				isActive={is24H}
			>
				{'24H'}
			</StyledBtn>
			<StyledBtn
				onClick={() => {
					setIs24H(false);
					setIsWeek(true);
					setIsMax(false);
					setIsMonth(false);
				}}
				isActive={isWeek}
			>
				{'1W'}
			</StyledBtn>
			<StyledBtn
				onClick={() => {
					setIs24H(false);
					setIsWeek(false);
					setIsMax(false);
					setIsMonth(true);
				}}
				isActive={isMonth}
			>
				{'1M'}
			</StyledBtn>
			<StyledBtn
				onClick={() => {
					setIs24H(false);
					setIsWeek(false);
					setIsMax(true);
					setIsMonth(false);
				}}
				isActive={isMax}
			>
				{'MAX'}
			</StyledBtn>
		</Container>
	);
};
