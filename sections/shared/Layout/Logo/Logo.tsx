import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import ROUTES from 'constants/routes';

import { currentThemeState } from 'store/ui';
import { useRecoilValue } from 'recoil';

import LogoSvg from 'assets/svg/brand/logo.svg';
import LogoSvgL2 from 'assets/svg/brand/logol2.svg';
import LogoSvgBetaLight from 'assets/svg/brand/logo-beta-light.svg';
import LogoSvgBetaDark from 'assets/svg/brand/logo-beta-dark.svg';

type LogoProps = {
	isL2: boolean;
	isFutures?: boolean;
	isHomePage?: boolean;
};

const SvgLogo = ({ isFutures = false, isHomePage = false, isL2 }: LogoProps) => {
	const currentTheme = useRecoilValue(currentThemeState);

	if (isFutures) {
		if (currentTheme === 'dark') {
			return <LogoSvgBetaDark />;
		}
		if (currentTheme === 'light') {
			return <LogoSvgBetaLight />;
		}
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
	margin-right: 20px;
`;

export default Logo;
