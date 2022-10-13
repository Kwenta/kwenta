import React from 'react';
import styled from 'styled-components';

import CrossIcon from 'assets/svg/app/cross.svg';
import FullScreenModal from 'components/FullScreenModal';
import { resetButtonCSS } from 'styles/common';

type DrawerItem = {
	label: string;
	value: React.ReactNode;
} | null;

type BaseDrawerProps = {
	items: DrawerItem[];
	open: boolean;
	closeDrawer(): void;
	buttons?: React.ReactNode;
};

const BaseDrawer: React.FC<BaseDrawerProps> = ({ open, closeDrawer, items, buttons }) => (
	<StyledModal isOpen={open}>
		<Background onClick={closeDrawer}>
			<Foreground>
				<CloseButtonRow>
					<CloseButton onClick={closeDrawer}>
						<CrossIcon />
					</CloseButton>
				</CloseButtonRow>
				{items.map((row) => {
					if (!row) return null;
					return (
						<Row key={row.label}>
							<div className="key">{row.label}</div>
							<div className="value">{row.value}</div>
						</Row>
					);
				})}
				{buttons && <ButtonsContainer>{buttons}</ButtonsContainer>}
			</Foreground>
		</Background>
	</StyledModal>
);

const StyledModal = styled(FullScreenModal)`
	top: initial;
	bottom: 74px;
	height: 100%;

	display: flex;
	flex-direction: column;
	justify-content: flex-end;

	background-color: transparent;

	& > div {
		margin: 0;
		height: 100%;
		width: 100%;
		max-width: 100vw;
		overflow-x: hidden;

		& > div {
			height: 100%;
			width: 100%;
		}
	}
`;

const Background = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	background-color: rgba(0, 0, 0, 0.5);
	height: 100%;
	width: 100%;
`;

const Foreground = styled.div`
	background: linear-gradient(180deg, #1e1d1d 0%, #161515 100%);
	padding: 15px;
	border-radius: 8px 8px 0 0;
`;

const Row = styled.div`
	display: flex;
	box-sizing: border-box;
	justify-content: space-between;
	padding-bottom: 11.5px;

	.key {
		text-transform: capitalize;
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}

	.value {
		color: ${(props) => props.theme.colors.common.primaryWhite};
		max-width: 60%;
	}

	&:not(:first-of-type) {
		padding-top: 11.5px;
	}

	&:not(:last-of-type) {
		border-bottom: 1px solid #2b2a2a;
	}
`;

const ButtonsContainer = styled.div`
	width: 100%;
	display: flex;
	margin-top: 5px;
`;

const CloseButtonRow = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
`;

const CloseButton = styled.button`
	${resetButtonCSS};
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

export default BaseDrawer;
