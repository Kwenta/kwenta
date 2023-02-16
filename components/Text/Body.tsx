import { memo } from 'react';
import styled, { css } from 'styled-components';

export type BodyProps = React.HTMLAttributes<HTMLParagraphElement> & {
	size?: 'xsmall' | 'small' | 'medium' | 'large';
	weight?: 'regular' | 'bold' | 'black';
	className?: string;
	fontSize?: number;
	mono?: boolean;
	capitalized?: boolean;
};

const Body: React.FC<BodyProps> = memo(
	({ size = 'medium', weight = 'regular', fontSize, mono, capitalized, ...props }) => {
		return (
			<StyledBody
				$size={size}
				$weight={weight}
				$fontSize={fontSize}
				$mono={mono}
				$capitalized={capitalized}
				{...props}
			/>
		);
	}
);

const StyledBody = styled.p<{
	$size?: BodyProps['size'];
	$weight?: BodyProps['weight'];
	$fontSize?: number;
	$mono?: boolean;
	$capitalized?: boolean;
}>`
	line-height: 1.2;
	margin: 0;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	${(props) =>
		props.$size === 'xsmall' &&
		css`
			font-size: 10px;
		`};
	${(props) =>
		props.$size === 'small' &&
		css`
			font-size: 12px;
		`};
	${(props) =>
		props.$size === 'medium' &&
		css`
			font-size: 13px;
		`};
	${(props) =>
		props.$size === 'large' &&
		css`
			font-size: 15px;
		`};
	${(props) =>
		props.$weight === 'bold' &&
		css`
			font-family: ${props.theme.fonts.bold};
		`}
		${(props) =>
			props.$mono &&
			css`
				font-family: ${props.$weight !== 'regular'
					? props.theme.fonts.monoBold
					: props.theme.fonts.mono};
			`}
			${(props) =>
				props.$capitalized &&
				css`
					font-variant: all-small-caps;
				`}
	${(props) =>
		props.$fontSize &&
		css`
			font-size: ${props.$fontSize}px;
		`}
`;

export default Body;
