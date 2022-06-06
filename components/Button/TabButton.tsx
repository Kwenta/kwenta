import React from 'react';
import styled, { css } from 'styled-components';
import Button from './Button';

export type TabButtonProps = {
	title: string;
	detail?: string;
	badge?: number;
	icon?: any;
	active?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
	disabled?: boolean;
	noOutline?: boolean;
	gold?: boolean;
	vertical?: boolean;
	nofill?: boolean;
};

const TabButton: React.FC<TabButtonProps> = ({
	title,
	detail,
	badge,
	active,
	icon,
	gold,
	vertical,
	nofill,
	...props
}) => {
	return (
		<StyledButton active={active} gold={gold} vertical={vertical} nofill={nofill} {...props}>
			<div className="orientation">
				{!!icon && <div>{icon}</div>}
				<div>
					<p className="title">{title}</p>
					{detail && <p className="detail">{detail}</p>}
				</div>
				{!!badge && <div className="badge">{badge}</div>}
			</div>
		</StyledButton>
	);
};

const StyledButton = styled(Button)<{
	active?: boolean;
	gold?: boolean;
	vertical?: boolean;
	nofill?: boolean;
}>`
	height: initial;
	display: flex;
	align-items: center;
	padding-top: 10px;
	padding-bottom: 10px;
	justify-content: center;

	p {
		margin: 0;
		font-size: 13px;
		text-align: left;
	}

	.title {
		text-align: center;
		color: ${(props) =>
			props.active
				? props.theme.colors.common.primaryWhite
				: props.theme.colors.common.secondaryGray};
	}

	.detail {
		color: ${(props) => props.theme.colors.common.secondaryGray};
		margin-top: 2px;
	}

	.badge {
		height: 16px;
		width: fit-content;
		min-width: 16px;
		padding-left: 4px;
		padding-right: 4px;
		margin-left: 7px;
		font-size: 12px;
		color: ${(props) => props.theme.colors.selectedTheme.button.tab.badge.text};
		background-color: ${(props) => props.theme.colors.selectedTheme.button.tab.badge.background};
		box-shadow: ${(props) => props.theme.colors.selectedTheme.button.tab.badge.shadow};
		border-radius: 4px;
	}

	svg {
		margin-right: ${(props) => (props.vertical ? '0' : '7px')};
		path {
			${(props) =>
				!props.nofill &&
				css`
					fill: ${props.active
						? props.theme.colors.common.primaryWhite
						: props.theme.colors.common.secondaryGray};
				`}

			${(props) =>
				props.nofill &&
				css`
					stroke: ${props.active
						? props.theme.colors.common.primaryWhite
						: props.theme.colors.common.secondaryGray};
				`}
		}
	}

	&:disabled {
		background-color: transparent;
		p {
			color: ${(props) => props.theme.colors.selectedTheme.button.tab.disabled.text};
		}
		svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.button.tab.disabled.text};
			}
		}

		.badge {
			display: none;
		}
	}

	${(props) =>
		props.active &&
		props.gold &&
		css`
			&:before {
				background: ${(props) => props.theme.colors.common.secondaryGold};
			}
		`}

	.orientation {
		display: flex;
		flex-direction: ${(props) => (props.vertical ? 'column' : 'row')};
		align-items: center;
	}
`;
export default TabButton;
