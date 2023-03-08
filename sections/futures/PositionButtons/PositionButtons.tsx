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
			<PositionButton
				data-testid="position-side-long-button"
				$position={PositionSide.LONG}
				$isActive={selected === 'long'}
				disabled={marketInfo?.isSuspended}
				onClick={() => onSelect(PositionSide.LONG)}
			>
				<span>Long</span>
			</PositionButton>
			<PositionButton
				data-testid="position-side-short-button"
				$position={PositionSide.SHORT}
				$isActive={selected === 'short'}
				$right={true}
				disabled={marketInfo?.isSuspended}
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
	margin-top: 8px;
`;

const PositionButton = styled(Button).attrs({ fullWidth: true })<PositionButtonProps>`
	font-size: 16px;
	height: 40px;
	font-variant: all-small-caps;
	text-transform: uppercase;
	border-radius: ${(props) => (props.$right ? '0 8px 8px 0' : '8px 0 0 8px')};

	&:active {
		transform: scale(0.96);
	}

	> span {
		position: relative;
	}

	${(props) => css`
		font-family: ${props.theme.fonts.bold};
		color: ${props.theme.colors.selectedTheme.newTheme.button.default.color};

		&:hover {
			background: ${props.theme.colors.selectedTheme.newTheme.button.default.hover.background};
		}
	`}

	${(props) =>
		props.$isActive &&
		css`
			&::before {
				display: none;
			}
			background: ${props.theme.colors.selectedTheme.newTheme.button.position[props.$position]
				.active.background};
			color: ${props.theme.colors.selectedTheme.newTheme.button.position[props.$position].active
				.color};
			&:hover {
				background: ${props.theme.colors.selectedTheme.newTheme.button.position[props.$position]
					.active.background};
			}
		`};
`;

export default PositionButtons;
