import { memo, FC, useState, useCallback } from 'react';
import styled, { css } from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg';
import { Body } from 'components/Text';
import { NO_VALUE } from 'constants/placeholder';

export type DetailedInfo = {
	value: React.ReactNode;
	keyNode?: React.ReactNode;
	valueNode?: React.ReactNode;
	color?: 'green' | 'red' | 'gold' | undefined;
	spaceBeneath?: boolean;
	compactBox?: boolean;
	expandable?: boolean;
	subItems?: Record<string, DetailedInfo>;
};

type InfoBoxProps = {
	details: Record<string, DetailedInfo | null | undefined>;
	style?: React.CSSProperties;
	className?: string;
	disabled?: boolean;
	dataTestId?: string;
};

const InfoBox: FC<InfoBoxProps> = memo(({ details, disabled, dataTestId, ...props }) => {
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

	const onToggleExpand = useCallback(
		(key: string) => {
			expandedRows.has(key) ? expandedRows.delete(key) : expandedRows.add(key);
			setExpandedRows(new Set([...expandedRows]));
		},
		[expandedRows]
	);

	return (
		<InfoBoxContainer {...props}>
			{Object.entries(details).map(([key, value], index) => (
				<>
					<InfoBoxRow
						key={key}
						title={key}
						value={value}
						disabled={disabled}
						dataTestId={`${dataTestId}-${index}`}
						expandable={!!value?.subItems}
						expanded={expandedRows.has(key)}
						onToggleExpand={onToggleExpand}
					/>
					{value?.subItems && expandedRows.has(key)
						? Object.entries(value.subItems).map(([key, value], index) => (
								<InfoBoxRow
									key={key}
									title={key}
									value={value}
									disabled={disabled}
									dataTestId={`${dataTestId}-${index}`}
									isSubtItem
								/>
						  ))
						: null}
				</>
			))}
		</InfoBoxContainer>
	);
});

type InfoBoxRowProps = {
	title: string;
	value?: DetailedInfo | null;
	disabled?: boolean;
	dataTestId: string;
	expandable?: boolean;
	expanded?: boolean;
	isSubtItem?: boolean;
	onToggleExpand?: (key: string) => void;
};

const InfoBoxRow: FC<InfoBoxRowProps> = memo(
	({ title, value, disabled, dataTestId, expandable, expanded, isSubtItem, onToggleExpand }) => {
		if (!value) return null;
		return (
			<>
				{value.compactBox ? (
					value.keyNode
				) : (
					<Row
						isSubtItem={isSubtItem}
						onClick={expandable ? () => onToggleExpand?.(title) : undefined}
					>
						<InfoBoxKey>
							{title}: {value.keyNode}{' '}
							{expandable ? expanded ? <HideIcon /> : <ExpandIcon /> : null}
						</InfoBoxKey>
						<ValueText
							$isSubtItem={isSubtItem}
							data-testid={dataTestId}
							$disabled={disabled}
							$color={value.color}
						>
							{disabled ? NO_VALUE : value.value}
							{value.valueNode}
						</ValueText>
					</Row>
				)}
				{value?.spaceBeneath && <br />}
			</>
		);
	}
);

const Row = styled.div<{ onClick?: (title: string) => void; isSubtItem?: boolean }>`
	cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
	padding-left: ${(props) => (props.isSubtItem ? '10px' : '0')};
	border-left: ${(props) => (props.isSubtItem ? props.theme.colors.selectedTheme.border : '0')};
	border-width: 2px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	&:not(:last-of-type) {
		padding-bottom: 6px;
	}
`;

const InfoBoxContainer = styled.div`
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
	$color?: DetailedInfo['color'];
	$isSubtItem?: boolean;
}>`
	color: ${(props) => props.theme.colors.selectedTheme.text[props.$isSubtItem ? 'label' : 'value']};
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

export default InfoBox;
