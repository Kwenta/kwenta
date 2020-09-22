import { CSSProperties, ReactNode } from 'react';
import styled from 'styled-components';

import { resetButtonCSS } from 'styles/common';
import { fonts } from 'styles/theme/fonts';

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
	children: ReactNode;
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
	${fonts.body['bold-medium']};
	padding: 1px 6px;
	background-color: ${(props) => props.theme.colors.black};
	color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.blueberry)};
	border-bottom: ${(props) => (props.active ? `2px solid ${props.theme.colors.purple}` : 'none')};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
`;
