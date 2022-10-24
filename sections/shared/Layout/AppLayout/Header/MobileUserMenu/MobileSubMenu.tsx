import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import ChevronDown from 'assets/svg/app/chevron-down.svg';
import ChevronUp from 'assets/svg/app/chevron-up.svg';
import ROUTES from 'constants/routes';
import { currentThemeState } from 'store/ui';
import { ThemeName } from 'styles/theme';

import { SubMenuLink } from '../constants';
import { MenuButton } from './common';
import Badge from 'components/Badge';

type MobileSubMenuOption = {
	label: string;
	icon?: React.ReactNode;
	selected?: boolean;
	externalLink?: string;
	onClick?: () => void;
};

type MobileSubMenuProps = {
	i18nLabel: string;
	defaultOpen?: boolean;
	active: boolean;
	options?: MobileSubMenuOption[];
	links?: SubMenuLink[];
	onDismiss(): void;
	onToggle(): void;
};

const MobileSubMenu: React.FC<MobileSubMenuProps> = ({
	i18nLabel,
	active,
	options,
	links,
	onDismiss,
	onToggle,
}) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();

	const currentTheme = useRecoilValue(currentThemeState);

	return (
		<>
			<SubMenuButton currentTheme={currentTheme} isActive={active} onClick={onToggle}>
				{t(i18nLabel)}
				{active ? <ChevronUp /> : <ChevronDown />}
			</SubMenuButton>
			{active && (
				<SubMenuContainer onClick={onDismiss}>
					{links
						? links.map(({ i18nLabel, link: subLink, badge }) => (
								<SubMenuItemContainer key={i18nLabel}>
									<SubMenuIcon>·</SubMenuIcon>
									<StyledLink href={subLink}>
										<SubMenuItem currentTheme={currentTheme} active={asPath.includes(subLink)}>
											{t(i18nLabel)} {badge && <Badge color="yellow">{t(badge.i18nLabel)}</Badge>}
										</SubMenuItem>
									</StyledLink>
								</SubMenuItemContainer>
						  ))
						: options?.map(({ label, icon, onClick, selected, externalLink }) => (
								<SubMenuItemContainer key={label}>
									<SubMenuIcon selected={selected}>{icon ?? '·'}</SubMenuIcon>
									{externalLink ? (
										<SubMenuExternalLink href={externalLink} target="_blank" rel="noreferrer">
											<SubMenuItem currentTheme={currentTheme} selected={selected}>
												{label}
											</SubMenuItem>
										</SubMenuExternalLink>
									) : (
										<SubMenuFlex>
											<SubMenuItem
												currentTheme={currentTheme}
												onClick={selected ? undefined : onClick}
												selected={selected}
											>
												{label}
											</SubMenuItem>
										</SubMenuFlex>
									)}
								</SubMenuItemContainer>
						  ))}
				</SubMenuContainer>
			)}
		</>
	);
};

const SubMenuButton = styled(MenuButton)`
	${(props) =>
		props.isActive &&
		css`
			margin-bottom: 20px;
		`}
`;

const SubMenuContainer = styled.div`
	box-sizing: border-box;
`;

const SubMenuItemContainer = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 20px;
`;

const StyledLink = styled(Link)`
	flex-grow: 1;
`;

const SubMenuFlex = styled.div`
	flex-grow: 1;
`;

const SubMenuExternalLink = styled.a`
	flex-grow: 1;
	text-decoration: none;
`;

const SubMenuItem = styled.div<{ currentTheme: ThemeName; active?: boolean; selected?: boolean }>`
	font-size: 19px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	box-sizing: border-box;
	padding: 15px;
	background-color: ${(props) =>
		window.location.pathname === ROUTES.Home.Root || props.currentTheme === 'dark'
			? 'rgba(255, 255, 255, 0.05)'
			: 'rgb(232, 232, 232)'};
	border-radius: 8px;
	width: 100%;

	${(props) =>
		props.active &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.button.active};
		`}

	${(props) =>
		props.selected &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.gold};
		`}
`;

const SubMenuIcon = styled.div<{ selected?: boolean }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 19px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	margin-right: 20px;
	width: 12px;

	& > div {
		font-size: 12px;
	}

	.currency-icon {
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 19px;
		color: ${(props) => props.theme.colors.common.secondaryGray};

		${(props) =>
			props.selected &&
			css`
				color: ${(props) => props.theme.colors.common.secondaryGold};
			`}
	}
`;

export default MobileSubMenu;
