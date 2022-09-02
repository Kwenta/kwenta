import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import MobileMenuArrow from 'assets/svg/app/mobile-menu-arrow.svg';
import FullScreenModal from 'components/FullScreenModal';
import ROUTES from 'constants/routes';
import Links from 'sections/dashboard/Links';
import type { HeaderProps } from 'sections/shared/Layout/HomeLayout/Header';
import Logo from 'sections/shared/Layout/Logo';
import { currentThemeState } from 'store/ui';

import { HOMEPAGE_MENU_LINKS, MENU_LINKS } from '../constants';
import { MenuButton, SUB_MENUS } from './common';
import MobileSubMenu from './MobileSubMenu';

type MobileMenuModalProps = HeaderProps & {
	onDismiss(): void;
};

export const MobileMenuModal: FC<MobileMenuModalProps> = ({ setCurrentPage, onDismiss }) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const menuLinks =
		window.location.pathname === ROUTES.Home.Root ? HOMEPAGE_MENU_LINKS : MENU_LINKS;

	const currentTheme = useRecoilValue(currentThemeState);

	const [expanded, setExpanded] = useState<string | undefined>();

	const handleToggle = (link: string) => () => {
		setExpanded((l) => (l === link ? undefined : link));
	};

	const showStatsPage = () => {
		setCurrentPage('stats-page');
		onDismiss();
	};

	return (
		<StyledFullScreenModal isOpen>
			<Container>
				<LogoContainer>
					<Logo />
				</LogoContainer>
				<div>
					{menuLinks.map(({ i18nLabel, link }) => (
						<div key={link}>
							{link === ROUTES.Stats.Home ? (
								<MenuButton
									currentTheme={currentTheme}
									isActive={asPath.includes(link)}
									onClick={showStatsPage}
								>
									{t(i18nLabel)}
									<MobileMenuArrow />
								</MenuButton>
							) : SUB_MENUS[link] ? (
								<MobileSubMenu
									active={expanded === link}
									i18nLabel={i18nLabel}
									link={link}
									defaultOpen={asPath.includes(link)}
									onDismiss={onDismiss}
									onToggle={handleToggle(link)}
								/>
							) : (
								<Link href={link}>
									<MenuButton
										currentTheme={currentTheme}
										isActive={asPath.includes(link)}
										onClick={onDismiss}
									>
										{t(i18nLabel)}
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
