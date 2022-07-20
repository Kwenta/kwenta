import { CSSProperties, ReactNode } from 'react';
import styled from 'styled-components';

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
