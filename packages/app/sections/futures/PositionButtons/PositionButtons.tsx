import { PositionSide } from '@kwenta/sdk/types';
import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import CloseIcon from 'assets/svg/app/close.svg';
import { FlexDivRow } from 'components/layout/flex';

interface PositionButtonsProps {
	selected: PositionSide;
	onSelect(position: PositionSide): void;
	type?: 'button' | 'submit' | 'reset' | undefined;
	mobile?: boolean;
	closeDrawer?: () => void;
}

const PositionButtons: FC<PositionButtonsProps> = memo(
	({ selected, onSelect, mobile, closeDrawer }) => {
		return (
			<PositionButtonsWrapper $mobile={mobile}>
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
				{mobile && (
					<CloseButton onClick={closeDrawer}>
						<CloseIcon height={15} width={15} />
					</CloseButton>
				)}
			</PositionButtonsWrapper>
		);
	}
);

type PositionButtonProps = {
	$position: PositionSide;
	$isActive: boolean;
	$right?: boolean;
};

const PositionButtonsWrapper = styled(FlexDivRow)<{ $mobile?: boolean }>`
	width: 100%;
	margin-bottom: 16px;
	height: 50px;

	${(props) =>
		props.$mobile &&
		css`
			position: fixed;
		`}
`;

const PositionButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	flex: 1;
	background: ${(props) => props.theme.colors.selectedTheme.background};
`;

const PositionButton = styled.div<PositionButtonProps>`
	font-size: 16px;
	height: 50px;
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
		color: ${props.theme.colors.selectedTheme.newTheme.tabs.position.color};
		background: ${props.theme.colors.selectedTheme.newTheme.tabs.position.background};

		&:hover {
			color: ${props.theme.colors.selectedTheme.newTheme.tabs.position[props.$position].color};
			border-top: 3px
				${props.theme.colors.selectedTheme.newTheme.tabs.position[props.$position].color} solid;
		}
		border-top: ${props.theme.colors.selectedTheme.border};
		border-bottom: ${props.theme.colors.selectedTheme.border};
	`}

	${(props) =>
		props.$isActive &&
		css`
			color: ${props.theme.colors.selectedTheme.newTheme.text.primary};
			border-bottom-color: transparent;
			border-top: 3px
				${props.theme.colors.selectedTheme.newTheme.tabs.position[props.$position].color} solid;
			background: ${props.theme.colors.selectedTheme.newTheme.tabs.position[props.$position]
				.background};
		`}
`;

const CloseButton = styled.button`
	width: 50px;
	height: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	display: flex;
	justify-content: center;
	align-items: center;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.tabs.position.background};
	box-sizing: border-box;
`;

export default PositionButtons;
