import Link from 'next/link';
import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import LogoDarkSvg from 'assets/svg/brand/logo-dark.svg';
import LogoSvg from 'assets/svg/brand/logo.svg';
import ROUTES from 'constants/routes';
import { currentThemeState } from 'store/ui';

const SvgLogo = () => {
	const currentTheme = useRecoilValue(currentThemeState);

	if (window.location.pathname === ROUTES.Home.Root) {
		return <LogoSvg />;
	}

	if (currentTheme === 'light') {
		return <LogoDarkSvg />;
	}

	return <LogoSvg />;
};

const Logo: FC = () => {
	return (
		<Link href={ROUTES.Home.Root}>
			<LogoContainer>
				<SvgLogo />
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
