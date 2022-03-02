import styled, { css } from 'styled-components';

type DataProps = {
	size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';
	className?: string;
};

const Data: React.FC<DataProps> = ({ size = 'small', children, className }) => {
	return (
		<StyledData $size={size} className={className}>
			{children}
		</StyledData>
	);
};

const StyledData = styled.p<{ $size?: DataProps['size'] }>`
	font-family: ${(props) => props.theme.fonts.mono};
	line-height: 1.4;
	letter-spacing: 0.2px;
	color: ${(props) => props.theme.colors.common.primaryWhite};

	${(props) =>
		props.$size === 'tiny' &&
		css`
			font-size: 10px;
		`}

	${(props) =>
		props.$size === 'small' &&
		css`
			font-size: 12px;
		`}

	${(props) =>
		props.$size === 'medium' &&
		css`
			font-size: 14px;
		`}

	${(props) =>
		props.$size === 'large' &&
		css`
			font-size: 16px;
		`}

	${(props) =>
		props.$size === 'xlarge' &&
		css`
			font-size: 20px;
		`}
`;

export default Data;
