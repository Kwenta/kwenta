import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import ROUTES from 'constants/routes';

import LogoSvg from 'assets/svg/brand/logo.svg';
import LogoSvgL2 from 'assets/svg/brand/logol2.svg';
import LogoSvgBeta from 'assets/svg/brand/logo-beta.svg';

type LogoProps = {
	isL2: boolean;
	isFutures?: boolean;
	isHomePage?: boolean;
};

const SvgLogo = ({ isFutures = false, isHomePage = false, isL2 }: LogoProps) => {
	if (isFutures) {
		return <LogoSvgBeta />;
	}
	if (isHomePage) {
		return <LogoSvg />;
	}
	return isL2 ? <LogoSvgL2 /> : <LogoSvg />;
};

const Logo: FC<LogoProps> = (props) => {
	return (
		<Link href={ROUTES.Home.Root}>
			<LogoContainer>
				<SvgLogo {...props} />
			</LogoContainer>
		</Link>
	);
};

const LogoContainer = styled.span`
	display: flex;
	align-items: center;
	cursor: pointer;
	height: 18px;
	width: 122px;
`;

export default Logo;
