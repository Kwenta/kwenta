import { FC, memo } from 'react';
import styled, { css } from 'styled-components';

export const TabList: FC = ({ children, ...props }) => (
	<div role="tablist" {...props}>
		{children}
	</div>
);

type TabPanelProps = {
	name: string;
	activeTab: string;
	fullHeight?: boolean;
};

export const TabPanel: React.FC<TabPanelProps> = memo(
	({ name, activeTab, fullHeight, children, ...props }) =>
		activeTab === name ? (
			<TabPanelContainer
				id={`${name}-tabpanel`}
				role="tabpanel"
				aria-labelledby={`${name}-tab`}
				tabIndex={-1}
				$fullHeight={fullHeight}
				{...props}
			>
				{children}
			</TabPanelContainer>
		) : null
);

const TabPanelContainer = styled.div<{ $fullHeight?: boolean }>`
	outline: none;
	flex: 1;
	${(props) =>
		props.$fullHeight &&
		css`
			min-height: calc(100% - 94px);
		`}
`;
