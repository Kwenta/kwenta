import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Svg, Img } from 'react-optimized-image';
import ROUTES from 'constants/routes';

import LogoSvg from 'assets/svg/brand/logo.svg';
import LogoSvgL2 from 'assets/svg/brand/logol2.svg';
import LogoSvgFutures from 'assets/svg/brand/logo-l2-futures.svg';

type LogoProps = {
	isL2: boolean;
	isFutures?: boolean;
};

const SvgLogo = ({ isFutures = false, isL2 }: LogoProps) => {
	if (isFutures) {
		return <Svg src={LogoSvgFutures} />;
	}
	return isL2 ? <Svg src={LogoSvgL2} /> : <Svg src={LogoSvg} />;
};

const Logo: FC<LogoProps> = (props) => {
	return (
		<Link href="/">
			<LogoContainer>
				<SvgLogo {...props} />
			</LogoContainer>
		</Link>
	);
};
// const Logo: FC<LogoProps> = ({ isL2 }) => (
// 	<LogoContainer>
// 		<Link href={ROUTES.Home}>
// 			<a>{isL2 ? <Img src={LogoSvgL2} /> : <Svg src={LogoSvg} />}</a>
// 		</Link>
// 	</LogoContainer>
// );

const LogoContainer = styled.span`
	display: flex;
	align-items: center;
	cursor: pointer;
`;

export default Logo;
