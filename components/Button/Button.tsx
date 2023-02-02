import { FC, ReactNode, memo } from 'react';
import styled, { css } from 'styled-components';

import { ButtonLoader } from 'components/Loader/Loader';

// TODO: Clean up these styles
export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'flat'
	| 'alt'
	| 'success'
	| 'danger'
	| 'text'
	| 'select'
	| 'yellow';

type BaseButtonProps = {
	$size: 'small' | 'medium' | 'large';
	$variant: ButtonVariant;
	isActive?: boolean;
	isRounded?: boolean;
	fullWidth?: boolean;
	noOutline?: boolean;
	textColor?: 'yellow';
	textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
	$active?: boolean;
	$mono?: boolean;
};

export const border = css`
	box-shadow: ${(props) => props.theme.colors.selectedTheme.button.shadow};
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border: none;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 8px;
		padding: 1px;
		background: ${(props) => props.theme.colors.selectedTheme.button.border};
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-image: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: exclude;
	}
`;

const sizeMap = {
	small: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		height: 40,
		fontSize: 13,
	},
	medium: {
		paddingVertical: 14,
		paddingHorizontal: 26,
		height: 47,
		fontSize: 15,
	},
	large: {
		paddingVertical: 16,
		paddingHorizontal: 36,
		height: 55,
		fontSize: 16,
	},
} as const;

const BaseButton = styled.button<BaseButtonProps>`
	display: flex;
	align-items: center;

	height: auto;
	cursor: pointer;
	position: relative;
	border-radius: ${(props) => (props.isRounded ? '50px' : '8px')};
	box-sizing: border-box;
	text-transform: ${(props) => props.textTransform ?? 'capitalize'};
	outline: none;
	white-space: nowrap;
	color: ${(props) =>
		(props.textColor && props.theme.colors.selectedTheme.button.text[props.textColor]) ||
		props.theme.colors.selectedTheme.button.text.primary};
	transition: all 0.1s ease-in-out;
	${border}
	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.button.hover};
	}

	${(props) =>
		props.$variant === 'primary' &&
		css`
			background: ${props.theme.colors.selectedTheme.button.primary.background};
			text-shadow: ${props.theme.colors.selectedTheme.button.primary.textShadow};
			&:hover {
				background: ${props.theme.colors.selectedTheme.button.primary.hover};
			}
		`}

	${(props) =>
		(props.noOutline || props.$variant === 'flat') &&
		css`
			background: ${(props) => props.theme.colors.selectedTheme.button.fill};
			border: ${(props) => props.theme.colors.selectedTheme.border};
			box-shadow: none;
			&:hover {
				background: ${(props) => props.theme.colors.selectedTheme.button.fillHover};
			}
			&::before {
				display: none;
			}
		`}

	${(props) =>
		props.$variant === 'yellow' &&
		css`
			background: ${(props) => props.theme.colors.selectedTheme.button.yellow.fill};
			border: 1px solid ${(props) => props.theme.colors.selectedTheme.button.yellow.border};
			color: ${(props) => props.theme.colors.selectedTheme.button.yellow.text};

			box-shadow: none;
			&:hover {
				background: ${(props) => props.theme.colors.selectedTheme.button.yellow.fillHover};
			}
			&::before {
				display: none;
			}
		`}

	${(props) =>
		css`
			font-family: ${props.$mono ? props.theme.fonts.mono : props.theme.fonts.bold};
		`}

	${(props) =>
		props.$variant === 'secondary' &&
		css`
			color: ${props.theme.colors.selectedTheme.button.secondary.text};
		`}

	${(props) =>
		props.$variant === 'danger' &&
		css`
			color: ${props.theme.colors.selectedTheme.red};
		`}

	${(props) => css`
		height: ${sizeMap[props.$size].height}px;
		padding: ${sizeMap[props.$size].paddingVertical}px ${sizeMap[props.$size].paddingHorizontal}px;
		font-size: ${sizeMap[props.$size].fontSize}px;
	`}

	${(props) =>
		props.fullWidth &&
		css`
			width: 100%;
		`};

	&:disabled {
		color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		background: transparent;
		box-shadow: none;
		text-shadow: none;
		border: ${(props) => props.theme.colors.selectedTheme.border};
		cursor: not-allowed;
		&::before {
			display: none;
		}
	}
`;

type ButtonProps = {
	loading?: boolean;
	active?: boolean;
	mono?: boolean;
	className?: string;
	left?: ReactNode;
	right?: ReactNode;
	size?: 'small' | 'medium' | 'large';
	variant?: ButtonVariant;
	fullWidth?: boolean;
	noOutline?: boolean;
	textColor?: 'yellow';
	textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
	style?: React.CSSProperties;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
	isRounded?: boolean;
};

const Button: FC<ButtonProps> = memo(
	({
		loading,
		children,
		mono,
		left,
		right,
		active = true,
		size = 'medium',
		variant = 'flat',
		...props
	}) => {
		return (
			<BaseButton $active={active} $mono={mono} $size={size} $variant={variant} {...props}>
				{loading ? (
					<ButtonLoader />
				) : (
					<>
						{left}
						<>{children}</>
						{right}
					</>
				)}
			</BaseButton>
		);
	}
);

export default Button;
