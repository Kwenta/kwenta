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
		content: ' ';
		position: absolute;
		z-index: -1;
		top: -4px;
		right: -4px;
		bottom: -4px;
		left: -4px;
		border-radius: 18px;
	}

	${(props) =>
		props.$position === PositionSide.LONG &&
		css`
			border: 1px solid ${props.theme.colors.common.primaryGreen};

			${props.$isActive &&
			css`
				background: ${props.theme.colors.selectedTheme.button.active.hover.successBackground};

				&:before {
					border: 2px solid ${props.theme.colors.selectedTheme.button.active.hover.successBorder};
				}
			`};
		`};

	${(props) =>
		props.$position === PositionSide.SHORT &&
		css`
			border: 1px solid ${props.theme.colors.common.primaryRed};

			${props.$isActive &&
			css`
				background: ${props.theme.colors.selectedTheme.button.active.hover.dangerBackground};

				&:before {
					border: 2px solid ${props.theme.colors.selectedTheme.button.active.hover.dangerBorder};
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
