import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import Button from 'components/Button';
import { selectMarketInfo } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

import { PositionSide } from '../types';

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
				fullWidth
				$position={PositionSide.LONG}
				$isActive={selected === 'long'}
				disabled={marketInfo?.isSuspended}
				onClick={() => onSelect(PositionSide.LONG)}
			>
				<span>Long</span>
			</StyledPositionButton>
			<StyledPositionButton
				data-testid="position-side-short-button"
				fullWidth
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

const StyledPositionButton = styled(Button)<PositionButtonProps>`
	font-size: 14px;
	height: 40px;

	&:active {
		transform: scale(0.96);
	}

	> span {
		position: relative;
	}

	${(props) =>
		props.$position === PositionSide.LONG &&
		css`
			color: ${props.theme.colors.selectedTheme.green};
			${props.$isActive &&
			css`
				border: 1px solid ${props.theme.colors.selectedTheme.green};
				border-radius: 8px;
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
			color: ${props.theme.colors.selectedTheme.red};
			${props.$isActive &&
			css`
				border: 1px solid rgba(239, 104, 104, 0.7);
				border-radius: 8px;
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
`;

export default PositionButtons;
