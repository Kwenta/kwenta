import { memo } from 'react';
import styled, { css } from 'styled-components';

type BodyProps = {
	size?: 'small' | 'medium' | 'large';
	variant?: 'regular' | 'bold';
	className?: string;
	fontSize?: number;
	mono?: boolean;
};

const Body: React.FC<BodyProps> = memo(
	({ size = 'small', variant = 'regular', children, className, fontSize, mono }) => {
		return (
			<StyledBody
				$size={size}
				$variant={variant}
				className={className}
				$fontSize={fontSize}
				$mono={mono}
			>
				{children}
			</StyledBody>
		);
	}
);

const StyledBody = styled.p<{
	$size?: BodyProps['size'];
	$variant?: BodyProps['variant'];
	$fontSize?: number;
	$mono?: boolean;
}>`
	line-height: 1.4;
	margin: 0;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};

	${(props) =>
		props.$size === 'small' &&
		css`
			font-size: 12px;
		`};

	${(props) =>
		props.$size === 'medium' &&
		css`
			font-size: 14px;
		`};

	${(props) =>
		props.$size === 'large' &&
		css`
			font-size: 16px;
		`};

	${(props) =>
		props.$variant === 'bold' &&
		css`
			font-family: ${props.theme.fonts.bold};
		`}

		${(props) =>
			props.$mono &&
			css`
				font-family: ${props.$variant === 'bold'
					? props.theme.fonts.monoBold
					: props.theme.fonts.mono};
			`}

	${(props) =>
		props.$fontSize &&
		css`
			font-size: ${props.$fontSize}px;
		`}
`;

export default Body;
