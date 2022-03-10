import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Img, { Svg } from 'react-optimized-image';

import { HEADER_HEIGHT } from 'constants/ui';
import ROUTES from 'constants/routes';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Button from 'components/Button';

import UserMenu from '../AppLayout/Header/UserMenu';
import AppHeader from '../AppLayout/Header';

import media from 'styles/media';

import Logo from '../Logo';
import { GridDivCenteredCol, TextButton } from 'styles/common';

import SmoothScroll from 'sections/homepage/containers/SmoothScroll';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';
import FuturesBordersSvg from 'assets/svg/app/futures-borders.svg';
import LinkWhiteIcon from 'assets/svg/app/link-white.svg';

const KIPS_LINK = 'https://github.com/Kwenta/KIPs';

const Header: FC = () => {
	const { t } = useTranslation();
	const { whyKwentaRef, howItWorksRef, faqRef, scrollToRef } = SmoothScroll.useContainer();
	const isL2 = useRecoilValue(isL2State);

	const links = useMemo(
		() => [
			{
				id: 'why',
				label: t('homepage.nav.why'),
				ref: whyKwentaRef,
			},
			{
				id: 'how',
				label: t('homepage.nav.how'),
				ref: howItWorksRef,
			},
			{
				id: 'faq',
				label: t('homepage.nav.faq'),
				ref: faqRef,
			},
			{
				id: 'kips',
				label: t('homepage.nav.kips'),
				onClick: () => window.open(KIPS_LINK, '_blank'),
			},
		],
		[t, whyKwentaRef, howItWorksRef, faqRef]
	);

	return (
		<>
			<FuturesBannerContainer>
				<FuturesBannerLinkWrapper>
					<>
						<FuturesLink href="https://raise.kwenta.io" target="_blank">
							Kwenta Community Raise now live on Aelin
						</FuturesLink>
						<Img src={LinkWhiteIcon} />
					</>
				</FuturesBannerLinkWrapper>
				<DivBorder />
				<Svg src={FuturesBordersSvg} />
				<DivBorder />
			</FuturesBannerContainer>
			<MobileHiddenView>
				<Container>
					<Logo isL2={isL2} />
					<Links>
						{links.map(({ id, label, ref, onClick }) => (
							<StyledTextButton
								key={id}
								onClick={() => {
									ref ? scrollToRef(ref) : onClick?.();
								}}
							>
								{label}
							</StyledTextButton>
						))}
					</Links>
					<MenuContainer>
						<UserMenu isTextButton={true} />
						<Link href={ROUTES.Home.Overview}>
							<Button variant="primary" isRounded={false} size="md">
								{t('homepage.nav.start-trading')}
							</Button>
						</Link>
					</MenuContainer>
				</Container>
			</MobileHiddenView>
			<MobileOnlyView>
				<AppHeader />
			</MobileOnlyView>
		</>
	);
};

const Container = styled.header`
	height: ${HEADER_HEIGHT};
	line-height: ${HEADER_HEIGHT};
	padding: 0px 20px;
	display: grid;
	align-items: center;
	width: 100%;
	grid-template-columns: 1fr 1fr 1fr;
	${media.lessThan('md')`
		grid-template-columns: auto auto;
	`}
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

const Links = styled.div`
	white-space: nowrap;
	justify-self: center;
	${media.lessThan('md')`
		display: none;
	`}
`;

const StyledTextButton = styled(TextButton)`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.silver};
	margin: 0px 8px;
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
`;

const MenuContainer = styled(GridDivCenteredCol)`
	grid-gap: 24px;
	justify-self: end;
`;

export default Header;
