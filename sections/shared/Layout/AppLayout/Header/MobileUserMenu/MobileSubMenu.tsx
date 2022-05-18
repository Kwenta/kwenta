import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { SUB_MENUS, MenuButton } from './common';

import ChevronUp from 'assets/svg/app/chevron-up.svg';
import ChevronDown from 'assets/svg/app/chevron-down.svg';

type MobileSubMenuOption = {
	label: string;
	icon?: React.ReactNode;
	onClick(): void;
	selected?: boolean;
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

	return (
		<>
			<MenuButton isActive={active} onClick={onToggle}>
				{t(i18nLabel)}
				{active ? <ChevronUp /> : <ChevronDown />}
			</MenuButton>
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
						: options?.map(({ label, icon, onClick, selected }) => (
								<SubMenuItemContainer key={label}>
									<SubMenuIcon>{icon ?? '·'}</SubMenuIcon>
									<SubMenuFlex>
										<SubMenuItem onClick={onClick} selected={selected}>
											{label}
										</SubMenuItem>
									</SubMenuFlex>
								</SubMenuItemContainer>
						  ))}
				</SubMenuContainer>
			)}
		</>
	);
};

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

const SubMenuItem = styled.div<{ active?: boolean; selected?: boolean }>`
	font-size: 19px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	box-sizing: border-box;
	padding: 15px;
	background-color: rgba(255, 255, 255, 0.05);
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

const SubMenuIcon = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 19px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	margin-right: 20px;
	width: 12px;

	& > div {
		font-size: 12px;
	}
`;

export default MobileSubMenu;
