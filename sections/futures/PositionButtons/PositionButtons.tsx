import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import { PositionSide } from 'sdk/types/futures';

interface PositionButtonsProps {
	selected: PositionSide;
	onSelect(position: PositionSide): void;
	type?: 'button' | 'submit' | 'reset' | undefined;
}

const PositionButtons: FC<PositionButtonsProps> = memo(({ selected, onSelect }) => {
	return (
		<PositionButtonsContainer>
			<PositionButton
				data-testid="position-side-long-button"
				$position={PositionSide.LONG}
				$isActive={selected === 'long'}
				onClick={() => onSelect(PositionSide.LONG)}
			>
				<span>Long</span>
			</PositionButton>
			<PositionButton
				data-testid="position-side-short-button"
				$position={PositionSide.SHORT}
				$isActive={selected === 'short'}
				$right={true}
				onClick={() => onSelect(PositionSide.SHORT)}
			>
				<span>Short</span>
			</PositionButton>
		</PositionButtonsContainer>
	);
});

type PositionButtonProps = {
	$position: PositionSide;
	$isActive: boolean;
	$right?: boolean;
};

const PositionButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	margin-bottom: 16px;
`;

const PositionButton = styled.div<PositionButtonProps>`
	font-size: 16px;
	height: 40px;
	font-variant: all-small-caps;
	text-transform: uppercase;
	text-align: center;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	transition: all 0.15s ease-in-out;

	> span {
		position: relative;
	}

	${(props) => css`
		font-family: ${props.theme.fonts.bold};
		color: ${props.theme.colors.selectedTheme.newTheme.button.default.color};
		background: ${props.theme.colors.selectedTheme.newTheme.tabs.position.background};

		&:hover {
			background: ${props.theme.colors.selectedTheme.newTheme.tabs.position.hover.background};
		}
	`}

	${(props) =>
		props.$isActive &&
		css`
			color: ${props.theme.colors.selectedTheme.newTheme.tabs.position[props.$position].color};
			border-top: 3px
				${props.theme.colors.selectedTheme.newTheme.tabs.position[props.$position].color} solid;
			background: ${props.theme.colors.selectedTheme.newTheme.tabs.position.hover.background};
		`};
`;

export default PositionButtons;
