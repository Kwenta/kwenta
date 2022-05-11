import React from 'react';
import styled, { css } from 'styled-components';
import Button from 'components/Button';
import { PositionSide } from '../types';

interface PositionButtonsProps {
	selected: PositionSide;
	isMarketClosed: boolean;
	onSelect(position: PositionSide): void;
	type?: 'button' | 'submit' | 'reset' | undefined;
}

const PositionButtons: React.FC<PositionButtonsProps> = ({
	selected,
	isMarketClosed,
	onSelect,
}) => {
	return (
		<PositionButtonsContainer>
			<StyledPositionButton
				fullWidth
				$position={PositionSide.LONG}
				$isActive={selected === 'long'}
				disabled={isMarketClosed}
				onClick={() => onSelect(PositionSide.LONG)}
			>
				<span>Long</span>
			</StyledPositionButton>
			<StyledPositionButton
				fullWidth
				$position={PositionSide.SHORT}
				$isActive={selected === 'short'}
				disabled={isMarketClosed}
				onClick={() => onSelect(PositionSide.SHORT)}
			>
				<span>Short</span>
			</StyledPositionButton>
		</PositionButtonsContainer>
	);
};

type PositionButtonProps = {
	$position: PositionSide;
	$isActive: boolean;
};

const PositionButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 15px;
	margin-bottom: 16px;
	margin-top: 8px;
`;

const StyledPositionButton = styled(Button)<PositionButtonProps>`
	font-size: 16px;
	height: 55px;
	transition: all 0.1s ease-in-out;

	&:active {
		transform: scale(0.96);
	}

	> span {
		position: relative;
		top: -2px;
	}

	${(props) =>
		props.$position === PositionSide.LONG &&
		css`
			color: ${props.theme.colors.common.primaryGreen};
			${props.$isActive &&
			css`
				border: 1px solid rgba(127, 212, 130, 0.7);
				border-radius: 11px;
				background: linear-gradient(
					180deg,
					rgba(127, 212, 130, 0.15) 0%,
					rgba(71, 122, 73, 0.05) 100%
				);
				box-shadow: rgb(127 212 130 / 50%) 0px 0 3px;
				&::before {
					display: none;
				}
				&:hover {
					background: linear-gradient(
						180deg,
						rgba(127, 212, 130, 0.15) 0%,
						rgba(71, 122, 73, 0.05) 100%
					);
				}
			`};
		`};

	${(props) =>
		props.$position === PositionSide.SHORT &&
		css`
			color: ${props.theme.colors.common.primaryRed};
			${props.$isActive &&
			css`
				border: 1px solid rgba(239, 104, 104, 0.7);
				border-radius: 11px;
				background: linear-gradient(
					180deg,
					rgba(239, 104, 104, 0.15) 0%,
					rgba(116, 56, 56, 0.05) 100%
				);
				box-shadow: rgb(239 104 104 / 50%) 0px 0 3px;
				&::before {
					display: none;
				}
				&:hover {
					background: linear-gradient(
					180deg,
					rgba(239, 104, 104, 0.15) 0%,
					rgba(116, 56, 56, 0.05) 100%
				);
			`};
		`};

	${(props) =>
		props.$isActive &&
		css`
			text-shadow: ${props.theme.colors.selectedTheme.button.active.textShadow};
		`};
`;

export default PositionButtons;
