import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import MobileMenuArrow from 'assets/svg/app/mobile-menu-arrow.svg';
import KwentaYellowIcon from 'assets/svg/brand/logo-yellow.svg';
import FullScreenModal from 'components/FullScreenModal';
import { FlexDivRowCentered } from 'components/layout/flex';
import ROUTES from 'constants/routes';
import Links from 'sections/dashboard/Links';
import Logo from 'sections/shared/Layout/Logo';
import { useAppSelector } from 'state/hooks';
import { selectCurrentTheme } from 'state/preferences/selectors';

import { HOMEPAGE_MENU_LINKS, MOBILE_NAV_LINKS } from '../constants';
import { MenuButton } from './menu';
import MobileSubMenu from './MobileSubMenu';

type MobileMenuModalProps = {
	onDismiss(): void;
};

export const MobileMenuModal: FC<MobileMenuModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const router = useRouter();

	const menuLinks =
		window.location.pathname === ROUTES.Home.Root ? HOMEPAGE_MENU_LINKS : MOBILE_NAV_LINKS;

	const currentTheme = useAppSelector(selectCurrentTheme);

	const [expanded, setExpanded] = useState<string | undefined>();

	const handleToggle = (link: string) => () => {
		setExpanded((l) => (l === link ? undefined : link));
	};

	const showStatsPage = () => {
		router.push(ROUTES.Stats.Home);
		onDismiss();
	};

	return (
		<StyledFullScreenModal isOpen>
			<Container>
				<LogoContainer>
					<Logo />
				</LogoContainer>
				<div>
					{menuLinks.map(({ i18nLabel, link, links }) => (
						<div key={link}>
							{links?.length ? (
								<MobileSubMenu
									links={links}
									active={expanded === link}
									i18nLabel={i18nLabel}
									defaultOpen={router.asPath.includes(link)}
									onDismiss={onDismiss}
									onToggle={handleToggle(link)}
								/>
							) : link === ROUTES.Stats.Home ? (
								<MenuButton
									currentTheme={currentTheme}
									isActive={router.asPath.includes(link)}
									onClick={showStatsPage}
								>
									{t(i18nLabel)}
									<MobileMenuArrow />
								</MenuButton>
							) : (
								<Link href={link}>
									<MenuButton
										currentTheme={currentTheme}
										isActive={router.asPath.includes(link)}
										onClick={onDismiss}
									>
										<FlexDivRowCentered>
											{t(i18nLabel)}
											{i18nLabel === 'header.nav.markets' ? (
												<KwentaYellowIcon height={18} width={18} style={{ marginLeft: 5 }} />
											) : null}
										</FlexDivRowCentered>
										<MobileMenuArrow />
									</MenuButton>
								</Link>
							)}
						</div>
					))}
					<Links isMobile />
				</div>
			</Container>
		</StyledFullScreenModal>
	);
};

const StyledFullScreenModal = styled(FullScreenModal)`
	top: 0;

	[data-reach-dialog-content] {
		margin: 0;
		width: 100%;
		height: 100%;

		& > div {
			height: 100%;
		}
	}
`;

const Container = styled.div<{ hasBorder?: boolean }>`
	height: 100%;
	padding: 24px 32px 100px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	${(props) =>
		props.hasBorder &&
		css`
			border-top: 1px solid ${(props) => props.theme.colors.common.secondaryGray};
		`}
`;

const LogoContainer = styled.div`
	margin-bottom: 50px;
`;

export default MobileMenuModal;
