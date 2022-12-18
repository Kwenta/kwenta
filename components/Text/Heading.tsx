import { memo, useMemo } from 'react';
import styled, { css } from 'styled-components';

type HeadingProps = {
	variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
	className?: string;
};

const Heading: React.FC<HeadingProps> = memo(({ variant = 'h1', children, className }) => {
	const StyledHeading = useMemo(() => headingMap[variant], [variant]);

	return <StyledHeading className={className}>{children}</StyledHeading>;
});

const commonStyles = css`
	line-height: 1.4;
	letter-spacing: 0.2px;
	margin: 0;
	color: ${(props) => props.theme.colors.common.primaryWhite};
`;

const StyledH1 = styled.h1`
	${commonStyles}
	font-size: 64px;
`;

const StyledH2 = styled.h2`
	${commonStyles}
	font-size: 48px;
`;

const StyledH3 = styled.h3`
	${commonStyles}
	font-size: 32px;
`;

const StyledH4 = styled.h4`
	${commonStyles}
	font-size: 20px;
`;

const StyledH5 = styled.h5`
	${commonStyles}
	font-size: 16px;
`;

const headingMap = {
	h1: StyledH1,
	h2: StyledH2,
	h3: StyledH3,
	h4: StyledH4,
	h5: StyledH5,
};

export default Heading;
