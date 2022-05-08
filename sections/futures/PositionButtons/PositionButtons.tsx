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

	&:disabled {
		border: transparent;
		background: transparent;
		&:hover {
			background: transparent;
		}
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
				border: 1px solid ${props.theme.colors.common.primaryGreen};
				border-radius: 11px;
				background: ${props.theme.colors.selectedTheme.button.active.hover.successBackground};

				&:hover {
					background: ${props.theme.colors.selectedTheme.button.active.hover.successBackground};
				}
			`};
		`};

	${(props) =>
		props.$position === PositionSide.SHORT &&
		css`
			color: ${props.theme.colors.common.primaryRed};
			${props.$isActive &&
			css`
				border: 1px solid ${props.theme.colors.common.primaryRed};
				border-radius: 11px;
				background: ${props.theme.colors.selectedTheme.button.active.hover.dangerBackground};

				&:hover {
					background: ${props.theme.colors.selectedTheme.button.active.hover.dangerBackground};
				}
			`};
		`};

	${(props) =>
		props.$isActive &&
		css`
			text-shadow: ${props.theme.colors.selectedTheme.button.active.textShadow};
		`};
`;

export default PositionButtons;
