import { CSSProperties, ReactNode } from 'react';
import styled from 'styled-components';

import { resetButtonCSS } from 'styles/common';

type TabProps = {
	name: string;
	active: boolean;
	onClick?: () => void;
	children: ReactNode;
};

export const TabButton = (props: TabProps) => (
	<StyledTabButton
		id={`${props.name}-tab`}
		role="tab"
		aria-selected={props.active}
		aria-controls={`${props.name}-tabpanel`}
		tabIndex={-1}
		{...props}
	/>
);

export const TabList = ({
	children,
	...props
}: {
	children: ReactNode;
	style?: CSSProperties | undefined;
}) => (
	<div role="tablist" {...props}>
		{children}
	</div>
);

export const TabPanel = ({
	name,
	activeTab,
	children,
	...props
}: {
	name: string;
	activeTab: string;
	children?: ReactNode;
}) =>
	activeTab === name ? (
		<TabPanelContainer
			id={`${name}-tabpanel`}
			role="tabpanel"
			aria-labelledby={`${name}-tab`}
			tabIndex={-1}
			{...props}
		>
			{children}
		</TabPanelContainer>
	) : null;

const TabPanelContainer = styled.div`
	outline: none;
`;

const StyledTabButton = styled.button<TabProps>`
	${resetButtonCSS};
	font-family: ${(props) => props.theme.fonts.bold};
	padding: 0;
	color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.blueberry)};
	border-bottom: 2px solid
		${(props) => (props.active ? props.theme.colors.goldColors.color1 : 'transparent')};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	margin-right: 12px;
	padding-bottom: 3px;
`;
