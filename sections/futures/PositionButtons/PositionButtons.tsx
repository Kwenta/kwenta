import React from 'react';
import styled, { css } from 'styled-components';
import Button from 'components/Button';

export type MarketPosition = 'long' | 'short';

interface PositionButtonsProps {
	selected: MarketPosition;
	setSelected(position: MarketPosition): void;
}

const PositionButtons: React.FC<PositionButtonsProps> = ({ selected, setSelected }) => {
	return (
		<PositionButtonsContainer>
			<StyledPositionButton
				fullWidth
				$position="long"
				$isActive={selected === 'long'}
				onClick={() => setSelected('long')}
			>
				Long
			</StyledPositionButton>
			<StyledPositionButton
				fullWidth
				$position="short"
				$isActive={selected === 'short'}
				onClick={() => setSelected('short')}
			>
				Short
			</StyledPositionButton>
		</PositionButtonsContainer>
	);
};

type PositionButtonProps = {
	$position: MarketPosition;
	$isActive: boolean;
};

const PositionButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 15px;
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
		props.$position === 'long' &&
		css`
			border: 1px solid ${props.theme.colors.common.primaryGreen};

			${props.$isActive &&
			css`
				background: ${props.theme.colors.current.button.active.hover.successBackground};

				&:before {
					border: 2px solid ${props.theme.colors.current.button.active.hover.successBorder};
				}
			`};
		`};

	${(props) =>
		props.$position === 'short' &&
		css`
			border: 1px solid ${props.theme.colors.common.primaryRed};

			${props.$isActive &&
			css`
				background: ${props.theme.colors.current.button.active.hover.dangerBackground};

				&:before {
					border: 2px solid ${props.theme.colors.current.button.active.hover.dangerBorder};
				}
			`};
		`};

	${(props) =>
		props.$isActive &&
		css`
			text-shadow: ${props.theme.colors.current.button.active.textShadow};

			&:before {
				box-shadow: ${props.theme.colors.current.button.active.shadow};
			}
		`};
`;

export default PositionButtons;
