import { memo, FC } from 'react';
import styled, { css } from 'styled-components';

import * as Text from 'components/Text';
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

	.compact-box {
		color: ${(props) => props.theme.colors.selectedTheme.rewardTitle};
		font-size: 13px;
		padding-left: 8px;
		cursor: pointer;
		margin-top: 16px;

		.reward-copy {
			color: ${(props) => props.theme.colors.selectedTheme.text.title};
		}

		.badge {
			font-family: ${(props) => props.theme.fonts.black};
			padding: 0px 6px;
			border-radius: 100px;
			font-variant: all-small-caps;
		}

		.badge-red {
			color: ${(props) => props.theme.colors.selectedTheme.badge['red'].text};
			background: ${(props) => props.theme.colors.selectedTheme.badge['red'].background};
			min-width: 100px;
		}

		.badge-yellow {
			color: ${(props) => props.theme.colors.selectedTheme.badge['yellow'].text};
			background: ${(props) => props.theme.colors.selectedTheme.badge['yellow'].background};
			min-width: 70px;
		}
	}

	.border-red {
		border-left: 3px solid ${(props) => props.theme.colors.selectedTheme.badge['red'].background};
	}

	.border-yellow {
		border-left: 3px solid ${(props) => props.theme.colors.selectedTheme.badge['yellow'].background};
	}

	div {
		display: flex;
		justify-content: space-between;
		align-items: center;

		&:not(:last-of-type) {
			margin-bottom: 8px;
		}
	}
`;

const InfoBoxKey = styled(Text.Body)`
	color: ${(props) => props.theme.colors.selectedTheme.text.title};
	font-size: 13px;
	text-transform: capitalize;
	cursor: default;
`;

const ValueText = styled(Text.Body)<{ $disabled?: boolean; $color?: DetailedInfo['color'] }>`
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
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
