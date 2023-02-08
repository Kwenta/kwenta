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
				Long
			</StyledPositionButton>
			<StyledPositionButton
				data-testid="position-side-short-button"
				$position={PositionSide.SHORT}
				$isActive={selected === 'short'}
				disabled={marketInfo?.isSuspended}
				onClick={() => onSelect(PositionSide.SHORT)}
			>
				Short
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

	&:active {
		transform: scale(0.96);
	}

	> span {
		position: relative;
	}

	${(props) =>
		props.$isActive &&
		css`
			border-radius: 8px;

			&::before {
				display: none;
			}
		`}

		${(props) => css`
			color: ${props.theme.colors.selectedTheme[
				props.$position === PositionSide.LONG ? 'green' : 'red'
			]};
		`}

	${(props) =>
		props.$position === PositionSide.LONG &&
		props.$isActive &&
		css`
			border: 1px solid ${props.theme.colors.selectedTheme.green};
			background: linear-gradient(
				180deg,
				rgba(127, 212, 130, 0.15) 0%,
				rgba(71, 122, 73, 0.05) 100%
			);
			box-shadow: rgb(127 212 130 / 50%) 0px 0 3px;

			&:hover {
				background: linear-gradient(
					180deg,
					rgba(127, 212, 130, 0.15) 0%,
					rgba(71, 122, 73, 0.05) 100%
				);
			}
		`};
		};

	${(props) =>
		props.$position === PositionSide.SHORT &&
		props.$isActive &&
		css`
			border: 1px solid rgba(239, 104, 104, 0.7);
			background: linear-gradient(
				180deg,
				rgba(239, 104, 104, 0.15) 0%,
				rgba(116, 56, 56, 0.05) 100%
			);
			box-shadow: rgb(239 104 104 / 50%) 0px 0 3px;
			&:hover {
				background: linear-gradient(
					180deg,
					rgba(239, 104, 104, 0.15) 0%,
					rgba(116, 56, 56, 0.05) 100%
				);
			}
		`};
`;

export default PositionButtons;
