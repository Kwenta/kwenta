import { ReactNode } from 'react';
import styled from 'styled-components';
import { fonts } from 'styles/theme/fonts';

type TabProps = {
	name: string;
	active: boolean;
	onClick: () => void;
	children: ReactNode;
};

const StyledTabButton = styled.button<TabProps>`
    ${fonts.body['bold-small']}
    background-color: ${(props) => props.theme.colors.black};
    color: ${(props) => (props.active ? props.theme.colors.white : props.theme.colors.blueberry)};
    outline: none;
    border: none;
    cursor: pointer;
    border-bottom: ${(props) => (props.active ? `2px solid ${props.theme.colors.purple}` : 'none')};
`;

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

export const TabList = ({ children }: { children: ReactNode }) => (
	<div role="tablist">{children}</div>
);

export const TabPanel = ({
	name,
	activeTab,
	children,
}: {
	name: string;
	activeTab: string;
	children: ReactNode;
}) =>
	activeTab === name ? (
		<div id={`${name}-tabpanel`} role="tabpanel" aria-labelledby={`${name}-tab`} tabIndex={-1}>
			{children}
		</div>
	) : null;
