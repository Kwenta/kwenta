import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Svg } from 'react-optimized-image';
import ROUTES from 'constants/routes';

import LogoSvg from 'assets/svg/brand/logo.svg';
import LogoSvgL2 from 'assets/svg/brand/logol2.svg';

type LogoProps = {
	isL2: boolean;
};

const Logo: FC<LogoProps> = ({ isL2 }) => (
	<LogoContainer>
		<Link href={ROUTES.Homepage.Home}>
			<a>{isL2 ? <Svg src={LogoSvgL2} /> : <Svg src={LogoSvg} />}</a>
		</Link>
	</LogoContainer>
);

const LogoContainer = styled.span`
	a {
		position: relative;
		top: 2px;
		display: inline-block;
	}
`;

export default Logo;
