import { memo, useMemo } from 'react';
import styled, { css } from 'styled-components';

type HeadingProps = {
	variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	className?: string;
	fontSize?: number;
};

const Heading: React.FC<HeadingProps> = memo(({ variant = 'h1', fontSize, ...props }) => {
	const StyledHeading = useMemo(() => headingMap[variant], [variant]);

	return <StyledHeading $fontSize={fontSize} {...props} />;
});

const commonStyles = css<{ $fontSize?: number }>`
	line-height: 1.2;
	margin: 0;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	${(props) =>
		props.$fontSize &&
		css`
			font-size: ${props.$fontSize}px;
		`}
`;

const Heading1 = styled.h1`
	font-size: 30px;
	${commonStyles}
`;

const Heading2 = styled.h2`
	font-size: 26px;
	${commonStyles}
`;

const Heading3 = styled.h3`
	font-size: 23px;
	${commonStyles}
`;

const Heading4 = styled.h4`
	font-size: 21px;
	${commonStyles}
`;

const Heading5 = styled.h5`
	font-size: 19px;
	${commonStyles}
`;

const Heading6 = styled.h6`
	font-size: 16px;
	${commonStyles}
`;

const headingMap = {
	h1: Heading1,
	h2: Heading2,
	h3: Heading3,
	h4: Heading4,
	h5: Heading5,
	h6: Heading6,
};

export default Heading;
