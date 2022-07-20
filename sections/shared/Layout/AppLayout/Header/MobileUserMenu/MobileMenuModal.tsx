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
import { isL2State } from 'store/wallet';

import { HOMEPAGE_MENU_LINKS, MENU_LINKS } from '../constants';
import { MenuButton, SUB_MENUS } from './common';
import MobileSubMenu from './MobileSubMenu';

type MobileMenuModalProps = {
	onDismiss(): void;
};

export const MobileMenuModal: FC<MobileMenuModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const menuLinks =
		window.location.pathname === ROUTES.Home.Root ? HOMEPAGE_MENU_LINKS : MENU_LINKS;
	const isL2 = useRecoilValue(isL2State);

	const [expanded, setExpanded] = useState<string | undefined>();

	const handleToggle = (link: string) => () => {
		setExpanded((l) => (l === link ? undefined : link));
	};

	return (
		<StyledFullScreenModal isOpen={true}>
			<Container>
				<LogoContainer>
					<Logo isFutures isL2={isL2} />
				</LogoContainer>
				{menuLinks.map(({ i18nLabel, link }) => (
					<div key={link}>
						{SUB_MENUS[link] ? (
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
								<MenuButton isActive={asPath.includes(link)} onClick={onDismiss}>
									{t(i18nLabel)}
									<MobileMenuArrow />
								</MenuButton>
							</Link>
						)}
					</div>
				))}
				<Links isMobile />
			</Container>
		</StyledFullScreenModal>
	);
};

const StyledFullScreenModal = styled(FullScreenModal)`
	top: 0;

	[data-reach-dialog-content] {
		margin: 0;
		width: 100%;
	}
`;

const Container = styled.div<{ hasBorder?: boolean }>`
	padding: 24px 32px;
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
