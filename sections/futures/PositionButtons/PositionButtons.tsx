import React from 'react';
import styled, { css } from 'styled-components';
import Button from 'components/Button';
import { PositionSide } from '../types';

interface PositionButtonsProps {
	selected: PositionSide;
	onSelect(position: PositionSide): void;
}

const PositionButtons: React.FC<PositionButtonsProps> = ({ selected, onSelect }) => {
	return (
		<PositionButtonsContainer>
			<StyledPositionButton
				fullWidth
				$position={PositionSide.LONG}
				$isActive={selected === 'long'}
				onClick={() => onSelect(PositionSide.LONG)}
			>
				Long
			</StyledPositionButton>
			<StyledPositionButton
				fullWidth
				$position={PositionSide.SHORT}
				$isActive={selected === 'short'}
				onClick={() => onSelect(PositionSide.SHORT)}
			>
				Short
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

	&:before {
		/* content: ' ';
		position: absolute;
		z-index: -1;
		top: -3px;
		right: -3px;
		bottom: -3px;
		left: -3px;
		border-radius: 10px; */
	}

	${(props) =>
		props.$position === PositionSide.LONG &&
		css`
			${props.$isActive &&
			css`
				transform: scale(.98);
				border: 2px solid ${props.theme.colors.common.primaryGreen};
				background: ${props.theme.colors.selectedTheme.button.active.hover.successBackground};

				&:before {
					border: 2px solid ${props.theme.colors.selectedTheme.button.active.hover.successBorder};
				}

				&:hover {
					background: ${props.theme.colors.selectedTheme.button.active.hover.successBackground};
				}
			`};
		`};

	${(props) =>
		props.$position === PositionSide.SHORT &&
		css`
			${props.$isActive &&
			css`
				transform: scale(.98);
				border: 2px solid ${props.theme.colors.common.primaryRed};
				background: ${props.theme.colors.selectedTheme.button.active.hover.dangerBackground};

				&:before {
					border: 2px solid ${props.theme.colors.selectedTheme.button.active.hover.dangerBorder};
				}

				&:hover {
					background: ${props.theme.colors.selectedTheme.button.active.hover.dangerBackground};
				}
			`};
		`};

	${(props) =>
		props.$isActive &&
		css`
			text-shadow: ${props.theme.colors.selectedTheme.button.active.textShadow};

			&:before {
				box-shadow: ${props.theme.colors.selectedTheme.button.active.shadow};
			}
		`};
`;

export default PositionButtons;
