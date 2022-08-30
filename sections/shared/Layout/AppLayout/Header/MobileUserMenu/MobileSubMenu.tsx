import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import ChevronDown from 'assets/svg/app/chevron-down.svg';
import ChevronUp from 'assets/svg/app/chevron-up.svg';
import { currentThemeState } from 'store/ui';

import { SUB_MENUS, MenuButton } from './common';

type MobileSubMenuOption = {
	label: string;
	icon?: React.ReactNode;
	onClick?: () => void;
	selected?: boolean;
	externalLink?: string;
};

type MobileSubMenuProps = {
	i18nLabel: string;
	link?: string;
	onDismiss(): void;
	defaultOpen?: boolean;
	active: boolean;
	onToggle(): void;
	options?: MobileSubMenuOption[];
};

const MobileSubMenu: React.FC<MobileSubMenuProps> = ({
	i18nLabel,
	link,
	onDismiss,
	active,
	onToggle,
	options,
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
					{link
						? SUB_MENUS[link].map(({ label, link: subLink }) => (
								<SubMenuItemContainer key={label}>
									<SubMenuIcon>·</SubMenuIcon>
									<StyledLink href={subLink}>
										<SubMenuItem active={asPath.includes(subLink)}>{label}</SubMenuItem>
									</StyledLink>
								</SubMenuItemContainer>
						  ))
						: options?.map(({ label, icon, onClick, selected, externalLink }) => (
								<SubMenuItemContainer key={label}>
									<SubMenuIcon selected={selected}>{icon ?? '·'}</SubMenuIcon>
									{externalLink ? (
										<SubMenuExternalLink href={externalLink} target="_blank" rel="noreferrer">
											<SubMenuItem selected={selected}>{label}</SubMenuItem>
										</SubMenuExternalLink>
									) : (
										<SubMenuFlex>
											<SubMenuItem onClick={onClick} selected={selected}>
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

const SubMenuItem = styled.div<{ active?: boolean; selected?: boolean }>`
	font-size: 19px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	box-sizing: border-box;
	padding: 15px;
	background-color: ${(props) => props.theme.colors.selectedTheme.gray};
	border-radius: 8px;
	width: 100%;

	${(props) =>
		props.active &&
		css`
			color: ${(props) => props.theme.colors.common.primaryWhite};
		`}

	${(props) =>
		props.selected &&
		css`
			color: ${(props) => props.theme.colors.common.secondaryGold};
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
