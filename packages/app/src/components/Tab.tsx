import { FC, ReactNode, memo } from 'react'
import styled, { css } from 'styled-components'

export const TabList: FC<{ children?: ReactNode }> = ({ children, ...props }) => (
	<div role="tablist" {...props}>
		{children}
	</div>
)

type TabPanelProps = {
	name: string
	activeTab: string
	fullHeight?: boolean
	children?: ReactNode
}

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
)

const TabPanelContainer = styled.div<{ $fullHeight?: boolean }>`
	outline: none;

	${(props) =>
		props.$fullHeight &&
		css`
			height: 100%;
			overflow: auto;
		`}
`
