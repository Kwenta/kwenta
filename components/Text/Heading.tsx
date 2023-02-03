import { memo, useMemo } from 'react';
import styled, { css } from 'styled-components';

type HeadingProps = {
	variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
	className?: string;
	fontSize?: number;
};

const Heading: React.FC<HeadingProps> = memo(({ variant = 'h1', fontSize, ...props }) => {
	const StyledHeading = useMemo(() => headingMap[variant], [variant]);

	return <StyledHeading $fontSize={fontSize} {...props} />;
});

const commonStyles = css<{ $fontSize?: number }>`
	line-height: 1.4;
	letter-spacing: 0.2px;
	margin: 0;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	${(props) =>
		props.$fontSize &&
		css`
			font-size: ${props.$fontSize}px;
		`}
`;

const StyledH1 = styled.h1`
	font-size: 64px;
	${commonStyles}
`;

const StyledH2 = styled.h2`
	font-size: 48px;
	${commonStyles}
`;

const StyledH3 = styled.h3`
	font-size: 32px;
	${commonStyles}
`;

const StyledH4 = styled.h4`
	font-size: 20px;
	${commonStyles}
`;

const StyledH5 = styled.h5`
	font-size: 16px;
	${commonStyles}
`;

const headingMap = {
	h1: StyledH1,
	h2: StyledH2,
	h3: StyledH3,
	h4: StyledH4,
	h5: StyledH5,
};

export default Heading;
