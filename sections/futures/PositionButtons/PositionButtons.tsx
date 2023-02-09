import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import Button from 'components/Button';
import { PositionSide } from 'sdk/types/futures';
import { selectMarketInfo } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

interface PositionButtonsProps {
	selected: PositionSide;
	onSelect(position: PositionSide): void;
	type?: 'button' | 'submit' | 'reset' | undefined;
}

const PositionButtons: FC<PositionButtonsProps> = memo(({ selected, onSelect }) => {
	const marketInfo = useAppSelector(selectMarketInfo);

	return (
		<PositionButtonsContainer>
			<StyledPositionButton
				data-testid="position-side-long-button"
				$position={PositionSide.LONG}
				$isActive={selected === 'long'}
				disabled={marketInfo?.isSuspended}
				onClick={() => onSelect(PositionSide.LONG)}
			>
				<span>Long</span>
			</StyledPositionButton>
			<StyledPositionButton
				data-testid="position-side-short-button"
				$position={PositionSide.SHORT}
				$isActive={selected === 'short'}
				disabled={marketInfo?.isSuspended}
				onClick={() => onSelect(PositionSide.SHORT)}
			>
				<span>Short</span>
			</StyledPositionButton>
		</PositionButtonsContainer>
	);
});

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

const StyledPositionButton = styled(Button).attrs({ fullWidth: true })<PositionButtonProps>`
	font-size: 16px;
	height: 57px;
	font-family: ${(props) => props.theme.fonts.bold};
	font-variant: all-small-caps;
	text-transform: uppercase;
	border-radius: 8px;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.button.position.background}

	&:active {
		transform: scale(0.96);
	}

	> span {
		position: relative;
	}

	${(props) =>
		props.$isActive &&
		css`
			&::before {
				display: none;
			}
		`}

		${(props) => css`
			color: ${props.theme.colors.selectedTheme.newTheme.button.position[props.$position].color};
		`}

	${(props) =>
		props.$position === PositionSide.LONG &&
		props.$isActive &&
		css`
			border: 1px solid
				${props.theme.colors.selectedTheme.newTheme.button.position.long.active.border};
			background: ${props.theme.colors.selectedTheme.newTheme.button.position.long.active
				.background};
			color: ${props.theme.colors.selectedTheme.newTheme.button.position.long.active.color};

			&:hover {
				background: ${props.theme.colors.selectedTheme.newTheme.button.position.long.active
					.background};
			}
			box-shadow: rgb(127 212 130 / 50%) 0px 0 3px;
		`};
		};

	${(props) =>
		props.$position === PositionSide.SHORT &&
		props.$isActive &&
		css`
			border: 1px solid
				${props.theme.colors.selectedTheme.newTheme.button.position.short.active.border};
			background: ${props.theme.colors.selectedTheme.newTheme.button.position.short.active
				.background};
			color: ${props.theme.colors.selectedTheme.newTheme.button.position.short.active.color};
			&:hover {
				background: ${props.theme.colors.selectedTheme.newTheme.button.position.short.active
					.background};
			}
			box-shadow: rgb(239 104 104 / 50%) 0px 0 3px;
		`};
`;

export default PositionButtons;
