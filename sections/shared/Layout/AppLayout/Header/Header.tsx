import { FC } from 'react';
import styled from 'styled-components';
import Img, { Svg } from 'react-optimized-image';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import { HEADER_HEIGHT, zIndex } from 'constants/ui';

import { GridDivCenteredCol } from 'styles/common';
import media from 'styles/media';

import Logo from '../../Logo';

import Nav from './Nav';
import UserMenu from './UserMenu';
import MobileUserMenu from './MobileUserMenu';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';
import FuturesBordersSvg from 'assets/svg/app/futures-borders.svg';
import LinkWhiteIcon from 'assets/svg/app/link-white.svg';

const Header: FC = () => {
	const isL2 = useRecoilValue(isL2State);

	const logo = <Logo isL2={isL2} />;

	return (
		<>
			<FuturesBannerContainer>
				<FuturesBannerLinkWrapper>
					<>
						<FuturesLink href="https://v2.beta.kwenta.io/" target="_blank">
							Perpetual Futures Beta available now
						</FuturesLink>
						<Img src={LinkWhiteIcon} />
					</>
				</FuturesBannerLinkWrapper>
				<DivBorder />
				<Svg src={FuturesBordersSvg} />
				<DivBorder />
			</FuturesBannerContainer>
			<Container>
				<MobileHiddenView>
					<LogoNav>
						{logo}
						<Nav />
					</LogoNav>
					<UserMenu />
				</MobileHiddenView>
				<MobileOnlyView>
					<LogoNav>{logo}</LogoNav>
					<MobileUserMenu />
				</MobileOnlyView>
			</Container>
		</>
	);
};

const Container = styled.header`
	position: absolute;
	top: ${HEADER_HEIGHT};
	left: 0;
	right: 0;
	z-index: ${zIndex.HEADER};
	${media.lessThan('md')`
		position: fixed;
		background-color: ${(props) => props.theme.colors.black};
		box-shadow: 0 8px 8px 0 ${(props) => props.theme.colors.black};
	`};
	> div {
		box-sizing: border-box;
		height: ${HEADER_HEIGHT};
		line-height: ${HEADER_HEIGHT};
		padding: 0 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
`;

const FuturesBannerContainer = styled.div`
	height: 65px;
	width: 100%;
	display: flex;
	align-items: center;
	background: linear-gradient(
		180deg,
		${(props) => props.theme.colors.goldColors.color1} 0%,
		${(props) => props.theme.colors.goldColors.color2} 100%
	);
	${media.lessThan('md')`
		position: relative;
		top: ${HEADER_HEIGHT};
		margin-bottom: ${HEADER_HEIGHT};
	`}
`;

const FuturesBannerLinkWrapper = styled.div`
	width: 100%;
	text-align: center;
	position: absolute;
	text-shadow: 0px 1px 2px ${(props) => props.theme.colors.transparentBlack};
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const DivBorder = styled.div`
	height: 2px;
	background: ${(props) => props.theme.colors.goldColors.color1};
	flex-grow: 1;
`;
const FuturesLink = styled.a`
	margin-right: 5px;
`;

const LogoNav = styled(GridDivCenteredCol)`
	grid-gap: 24px;
`;

export default Header;
