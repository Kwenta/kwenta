import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg';
import { Body } from 'components/Text';
import { NO_VALUE } from 'constants/placeholder';

type InfoBoxRowProps = {
	title: string;
	value: React.ReactNode;
	keyNode?: React.ReactNode;
	valueNode?: React.ReactNode;
	spaceBeneath?: boolean;
	compactBox?: boolean;
	color?: 'green' | 'red' | 'gold' | undefined;
	disabled?: boolean;
	dataTestId?: string;
	expandable?: boolean;
	expanded?: boolean;
	isSubItem?: boolean;
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
						$isSubItem={isSubItem}
						data-testid={dataTestId}
						$disabled={disabled}
						$color={color}
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
}>`
	color: ${(props) => props.theme.colors.selectedTheme.text[props.$isSubItem ? 'label' : 'value']};
	cursor: default;

	${(props) =>
		props.$color === 'red' &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.red};
		`}

	${(props) =>
		props.$color === 'green' &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.green};
		`}

	${(props) =>
		props.$color === 'gold' &&
		css`
			color: ${(props) => props.theme.colors.common.primaryGold};
		`}

	${(props) =>
		props.$disabled &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.gray};
		`}
`;

const ExpandIcon = styled(CaretDownIcon)`
	margin-left: 8px;
`;

const HideIcon = styled(ExpandIcon)`
	transform: rotate(180deg);
	margin-bottom: -4px;
`;
