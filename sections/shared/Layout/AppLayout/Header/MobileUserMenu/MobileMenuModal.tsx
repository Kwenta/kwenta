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
import Logo from 'sections/shared/Layout/Logo';
import { currentThemeState } from 'store/ui';

import { HOMEPAGE_MENU_LINKS, MOBILE_NAV_LINKS } from '../constants';
import { MenuButton } from './common';
import MobileSubMenu from './MobileSubMenu';

type MobileMenuModalProps = {
	onDismiss(): void;
};

export const MobileMenuModal: FC<MobileMenuModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();

	const menuLinks =
		window.location.pathname === ROUTES.Home.Root ? HOMEPAGE_MENU_LINKS : MOBILE_NAV_LINKS;

	const currentTheme = useRecoilValue(currentThemeState);

	const [expanded, setExpanded] = useState<string | undefined>();

	const handleToggle = (link: string) => () => {
		setExpanded((l) => (l === link ? undefined : link));
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
