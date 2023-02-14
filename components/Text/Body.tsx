import { memo } from 'react';
import styled, { css } from 'styled-components';

type BodyProps = {
	size?: 'small' | 'medium' | 'large';
	variant?: 'regular' | 'bold';
	className?: string;
	fontSize?: number;
	mono?: boolean;
	color?: 'title' | 'value' | 'body';
	inline?: boolean;
};

const Body: React.FC<BodyProps> = memo(
	({ size = 'small', variant = 'regular', fontSize, mono, inline, ...props }) => {
		return (
			<StyledBody
				$size={size}
				$variant={variant}
				$fontSize={fontSize}
				$mono={mono}
				$inline={inline}
				{...props}
			/>
		);
	}
);

const StyledBody = styled.p<{
	$size?: BodyProps['size'];
	$variant?: BodyProps['variant'];
	$fontSize?: number;
	$mono?: boolean;
	$inline?: boolean;
}>`
	line-height: 1.4;
	margin: 0;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};

	${(props) =>
		props.$size === 'small' &&
		css`
			font-size: 13px;
		`};

	${(props) =>
		props.$size === 'medium' &&
		css`
			font-size: 15px;
		`};

	${(props) =>
		props.$size === 'large' &&
		css`
			font-size: 18px;
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
	
	${(props) =>
		props.$inline &&
		css`
			display: inline;
		`}
`;

export default Body;
