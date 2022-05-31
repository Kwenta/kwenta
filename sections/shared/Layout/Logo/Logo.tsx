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
};

const SvgLogo = ({ isFutures = false, isL2 }: LogoProps) => {
	if (isFutures) {
		return <LogoSvgBeta />;
	}
	return isL2 ? <LogoSvgL2 /> : <LogoSvg />;
};

const Logo: FC<LogoProps> = (props) => {
	return (
		<Link href={ROUTES.Home.Overview}>
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
	margin-right: 20px;
`;

export default Logo;
