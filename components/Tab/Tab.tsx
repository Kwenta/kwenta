import { FC, memo } from 'react';
import styled from 'styled-components';

export const TabList: FC = ({ children, ...props }) => (
	<div role="tablist" {...props}>
		{children}
	</div>
);

type TabPanelProps = {
	name: string;
	activeTab: string;
};

export const TabPanel: React.FC<TabPanelProps> = memo(({ name, activeTab, children, ...props }) =>
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
	) : null
);

const TabPanelContainer = styled.div`
	outline: none;
`;
