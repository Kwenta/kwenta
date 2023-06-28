import React, { memo, FC } from 'react'
import styled, { css } from 'styled-components'

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg'
import { Body } from 'components/Text'
import { BodyProps } from 'components/Text/Body'
import { NO_VALUE } from 'constants/placeholder'

type InfoBoxRowProps = {
	children?: React.ReactNode
	title: string
	keyNode?: React.ReactNode
	textValue?: string
	textValueIcon?: React.ReactNode
	nodeValue?: React.ReactNode
	spaceBeneath?: boolean
	compactBox?: boolean
	color?: BodyProps['color']
	disabled?: boolean
	dataTestId?: string
	expandable?: boolean
	expanded?: boolean
	isSubItem?: boolean
	boldValue?: boolean
	onToggleExpand?: (key: string) => void
}

export const InfoBoxRow: FC<InfoBoxRowProps> = memo(
	({
		title,
		keyNode,
		textValueIcon,
		textValue,
		nodeValue,
		compactBox,
		disabled,
		dataTestId,
		expandable,
		expanded,
		isSubItem,
		onToggleExpand,
		children,
		color,
		spaceBeneath,
		boldValue,
	}) => (
		<>
			{compactBox ? (
				keyNode
			) : (
				<Row
					$isSubItem={isSubItem}
					onClick={expandable ? () => onToggleExpand?.(title) : undefined}
				>
					<InfoBoxKey>
						{title}: {keyNode} {expandable ? expanded ? <HideIcon /> : <ExpandIcon /> : null}
					</InfoBoxKey>
					{nodeValue ? (
						nodeValue
					) : (
						<ValueText
							$bold={boldValue}
							$isSubItem={isSubItem}
							data-testid={dataTestId}
							$disabled={disabled}
							color={color}
						>
							{disabled ? NO_VALUE : textValue}
							{textValueIcon}
						</ValueText>
					)}
				</Row>
			)}
			{spaceBeneath && <br />}
			{expandable && expanded && children}
		</>
	)
)

const Row = styled.div<{ $isSubItem?: boolean }>`
	cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
	padding-left: ${(props) => (props.$isSubItem ? '10px' : '0')};
	border-left: ${(props) => (props.$isSubItem ? props.theme.colors.selectedTheme.border : '0')};
	border-width: 2px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	&:not(:last-of-type) {
		padding-bottom: 6px;
	}
`

export const InfoBoxContainer = styled.div`
	box-sizing: border-box;
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
	padding: 12px 14px;
`

const InfoBoxKey = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	text-transform: capitalize;
`

const ValueText = styled(Body).attrs({ mono: true })<{
	$disabled?: boolean
	$color?: InfoBoxRowProps['color']
	$isSubItem?: boolean
	$bold?: boolean
}>`
	cursor: default;

	${(props) =>
		props.$disabled &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.gray};
		`}

	${(props) =>
		props.$bold &&
		css`
			font-weight: bold;
		`}
`

const ExpandIcon = styled(CaretDownIcon)`
	margin-left: 8px;
`

const HideIcon = styled(ExpandIcon)`
	transform: rotate(180deg);
	margin-bottom: -4px;
`
