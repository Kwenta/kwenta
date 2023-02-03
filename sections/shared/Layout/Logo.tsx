import Link from 'next/link';
import { FC, memo } from 'react';
import styled from 'styled-components';

import LogoDarkSvg from 'assets/svg/brand/logo-dark.svg';
import LogoSvg from 'assets/svg/brand/logo.svg';
import ROUTES from 'constants/routes';
import { useAppSelector } from 'state/hooks';
import { selectCurrentTheme } from 'state/preferences/selectors';

const SvgLogo = memo(() => {
	const currentTheme = useAppSelector(selectCurrentTheme);

	if (window.location.pathname === ROUTES.Home.Root) {
		return <LogoSvg />;
	}

	if (currentTheme === 'light') {
		return <LogoDarkSvg />;
	}

	return <LogoSvg />;
});

const Logo: FC = memo(() => {
	return (
		<Link href={ROUTES.Home.Root}>
			<LogoContainer>
				<SvgLogo />
			</LogoContainer>
		</Link>
	);
});

const LogoContainer = styled.span`
	display: flex;
	align-items: center;
	cursor: pointer;
	height: 18px;
	width: 122px;
	margin-right: 20px;
`;

export default Logo;
