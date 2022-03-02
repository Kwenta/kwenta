import styled, { css } from 'styled-components';

type BodyProps = {
	size?: 'small' | 'medium' | 'large';
	variant?: 'thin' | 'bold';
	className?: string;
};

const Body: React.FC<BodyProps> = ({ size = 'small', variant = 'thin', children, className }) => {
	return (
		<StyledBody $size={size} $variant={variant} className={className}>
			{children}
		</StyledBody>
	);
};

const StyledBody = styled.p<{ $size?: BodyProps['size']; $variant?: BodyProps['variant'] }>`
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
`;

export default Body;
