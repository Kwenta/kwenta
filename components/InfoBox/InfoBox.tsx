import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import { Body } from 'components/Text';
import { NO_VALUE } from 'constants/placeholder';

export type DetailedInfo = {
	value: string | React.ReactNode;
	keyNode?: React.ReactNode;
	valueNode?: React.ReactNode;
	color?: 'green' | 'red' | 'gold' | undefined;
	spaceBeneath?: boolean;
	compactBox?: boolean;
};

type InfoBoxProps = {
	details: Record<string, DetailedInfo | null | undefined>;
	style?: React.CSSProperties;
	className?: string;
	disabled?: boolean;
	dataTestId?: string;
};

const InfoBox: FC<InfoBoxProps> = memo(({ details, disabled, dataTestId, ...props }) => (
	<InfoBoxContainer {...props}>
		{Object.entries(details).map(([key, value], index) => (
			<InfoBoxValue
				key={key}
				title={key}
				value={value}
				disabled={disabled}
				dataTestId={`${dataTestId}-${index}`}
			/>
		))}
	</InfoBoxContainer>
));

type InfoBoxValueProps = {
	title: string;
	value?: DetailedInfo | null;
	disabled?: boolean;
	dataTestId: string;
};

const InfoBoxValue: FC<InfoBoxValueProps> = memo(({ title, value, disabled, dataTestId }) => {
	if (!value) return null;

	return (
		<>
			{value.compactBox ? (
				value.keyNode
			) : (
				<div>
					<InfoBoxKey>
						{title}: {value.keyNode}
					</InfoBoxKey>
					<ValueText data-testid={dataTestId} $disabled={disabled} $color={value.color}>
						{disabled ? NO_VALUE : value.value}
						{value.valueNode}
					</ValueText>
				</div>
			)}
			{value?.spaceBeneath && <br />}
		</>
	);
});

const InfoBoxContainer = styled.div`
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 14px;
	box-sizing: border-box;
	width: 100%;

	div {
		display: flex;
		justify-content: space-between;
		align-items: center;

		&:not(:last-of-type) {
			margin-bottom: 8px;
		}
	}
`;

const InfoBoxKey = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	text-transform: capitalize;
	cursor: default;
`;

const ValueText = styled(Body).attrs({ mono: true })<{
	$disabled?: boolean;
	$color?: DetailedInfo['color'];
}>`
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
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

export default InfoBox;
