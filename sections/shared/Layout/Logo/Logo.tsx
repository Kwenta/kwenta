import styled from 'styled-components';
import Link from 'next/link';
import ROUTES from 'constants/routes';
import LogoSvg from 'assets/svg/brand/logo.svg';

const Logo = () => {
	return (
		<Link href={ROUTES.Home.Root}>
			<LogoContainer>
				<Svg src={LogoSvg} />
			</LogoContainer>
		</Link>
	);
};

const LogoContainer = styled.span`
	display: flex;
	align-items: center;
	cursor: pointer;
`;

export default Logo;
