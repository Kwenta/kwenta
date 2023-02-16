import { memo } from 'react';
import styled, { css } from 'styled-components';

export type BodyProps = React.HTMLAttributes<HTMLParagraphElement> & {
	size?: 'xsmall' | 'small' | 'medium' | 'large';
	weight?: 'regular' | 'bold' | 'black';
	className?: string;
	fontSize?: number;
	mono?: boolean;
	capitalized?: boolean;
	inline?: boolean;
};

const Body: React.FC<BodyProps> = memo(
	({ size = 'medium', weight = 'regular', fontSize, mono, capitalized, inline, ...props }) => {
		return (
			<StyledBody
				$size={size}
				$weight={weight}
				$fontSize={fontSize}
				$mono={mono}
				$capitalized={capitalized}
				$inline={inline}
				{...props}
			/>
		);
	}
);

const sizeMap = {
	xsmall: 10,
	small: 12,
	medium: 13,
	large: 15,
} as const;

const StyledBody = styled.p<{
	$size: NonNullable<BodyProps['size']>;
	$weight: NonNullable<BodyProps['weight']>;
	$fontSize?: number;
	$mono?: boolean;
	$capitalized?: boolean;
	$inline?: boolean;
}>`
	line-height: 1.2;
	margin: 0;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};

	${(props) => css`
		font-size: ${props.$fontSize ?? sizeMap[props.$size]}px;
		${
			props.$weight === 'bold' &&
			css`
				font-family: ${props.theme.fonts.bold};
			`
		}

		${
			props.$mono &&
			css`
				font-family: ${props.$weight !== 'regular'
					? props.theme.fonts.monoBold
					: props.theme.fonts.mono};
			`
		}
		${
			props.$capitalized &&
			css`
				font-variant: all-small-caps;
			`
		}
		${
			props.$inline &&
			css`
				display: inline;
			`
		}
	`}
`;

export default Body;
