import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg';
import { Body } from 'components/Text';
import { BodyProps } from 'components/Text/Body';
import { NO_VALUE } from 'constants/placeholder';

type InfoBoxRowProps = {
	title: string;
	value: React.ReactNode;
	keyNode?: React.ReactNode;
	valueNode?: React.ReactNode;
	spaceBeneath?: boolean;
	compactBox?: boolean;
	color?: BodyProps['color'];
	disabled?: boolean;
	dataTestId?: string;
	expandable?: boolean;
	expanded?: boolean;
	isSubItem?: boolean;
	boldValue?: boolean;
	onToggleExpand?: (key: string) => void;
};

export const InfoBoxRow: FC<InfoBoxRowProps> = memo(
	({
		title,
		value,
		keyNode,
		compactBox,
		disabled,
		dataTestId,
		expandable,
		expanded,
		isSubItem,
		onToggleExpand,
		children,
		color,
		valueNode,
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
					<ValueText
						$bold={boldValue}
						$isSubItem={isSubItem}
						data-testid={dataTestId}
						$disabled={disabled}
						color={color}
					>
						{disabled ? NO_VALUE : value}
						{valueNode}
					</ValueText>
				</Row>
			)}
			{spaceBeneath && <br />}
			{expandable && expanded && children}
		</>
	)
);

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
`;

export const InfoBoxContainer = styled.div`
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 14px;
	box-sizing: border-box;
	width: 100%;
`;

const InfoBoxKey = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	text-transform: capitalize;
`;

const ValueText = styled(Body).attrs({ mono: true })<{
	$disabled?: boolean;
	$color?: InfoBoxRowProps['color'];
	$isSubItem?: boolean;
	$bold?: boolean;
}>`
	color: ${(props) => props.theme.colors.selectedTheme.text[props.$isSubItem ? 'label' : 'value']};
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
`;

const ExpandIcon = styled(CaretDownIcon)`
	margin-left: 8px;
`;

const HideIcon = styled(ExpandIcon)`
	transform: rotate(180deg);
	margin-bottom: -4px;
`;
