import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

import ROUTES from 'constants/routes';

import LogoSvg from 'assets/inline-svg/brand/logo.svg';

const Logo: FC = () => (
	<LogoContainer>
		<Link href={ROUTES.Homepage.Home}>
			<a>
				<LogoSvg />
			</a>
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
