import React from 'react';
import styled from 'styled-components';

type MobileMenuItemProps = {
	label: string;
	active?: boolean;
	badge?: number;
	icon?: any;
	action(): void;
	disabled?: boolean;
};

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({ label, badge, active, icon, action }) => {
	return (
		<MobileMenuItemContainer>
			{icon}
			<div className="label" onClick={action}>
				<p className={`label-text${active ? ' active' : ''}`}>{label}</p>
				{badge && <div className="badge">{badge}</div>}
			</div>
		</MobileMenuItemContainer>
	);
};

const MobileMenuItemContainer = styled.div`
	display: flex;
	align-items: space-between;
	width: 100%;
	height: 50px;

	.label {
		box-sizing: border-box;
		padding: 15px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: rgba(255, 255, 255, 0.05);

		.label-text {
			font-size: 19px;
			color: ${(props) => props.theme.colors.common.secondaryGray};
		}

		.active {
			color: ${(props) => props.theme.colors.common.primaryWhite};
		}

		.badge {
			height: 23px;
			width: 23px;
			background-color: ${(props) => props.theme.colors.common.primaryGold};
			color: transparent;
		}
	}
`;

export default MobileMenuItem;
