import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

import ROUTES from 'constants/routes';

import LogoSvg from 'assets/inline-svg/brand/logo.svg';

const Logo: FC = () => {
	return (
		<LogoContainer>
			<Link href={ROUTES.Home}>
				<a>
					<LogoSvg />
				</a>
			</Link>
		</LogoContainer>
	);
};

const LogoContainer = styled.div`
	padding-top: 5px;
	a {
		color: ${(props) => props.theme.colors.white};
	}
`;

export default Logo;
