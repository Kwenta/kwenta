import { memo } from 'react';
import styled, { css } from 'styled-components';

type BodyProps = {
	size?: 'small' | 'medium' | 'large';
	variant?: 'regular' | 'bold';
	className?: string;
	fontSize?: number;
};

const Body: React.FC<BodyProps> = memo(
	({ size = 'small', variant = 'regular', children, className, fontSize }) => {
		return (
			<StyledBody $size={size} $variant={variant} className={className} $fontSize={fontSize}>
				{children}
			</StyledBody>
		);
	}
);

const StyledBody = styled.p<{
	$size?: BodyProps['size'];
	$variant?: BodyProps['variant'];
	$fontSize?: number;
}>`
	line-height: 1.4;
	margin: 0;

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
		props.$fontSize &&
		css`
			font-size: ${props.$fontSize}px;
		`}
`;

export default Body;
