import { useReducer } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { SUB_MENUS, MenuButton } from './common';

import ChevronUp from 'assets/svg/app/chevron-up.svg';
import ChevronDown from 'assets/svg/app/chevron-down.svg';

type MobileSubMenuProps = {
	i18nLabel: string;
	link: string;
	onDismiss(): void;
	defaultOpen?: boolean;
};

const MobileSubMenu: React.FC<MobileSubMenuProps> = ({
	i18nLabel,
	link,
	onDismiss,
	defaultOpen,
}) => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const [isExpanded, toggleExpanded] = useReducer((s) => !s, defaultOpen ?? false);

	return (
		<>
			<MenuButton isActive={asPath.includes(link) || isExpanded} onClick={toggleExpanded}>
				{t(i18nLabel)}
				{isExpanded ? <ChevronUp /> : <ChevronDown />}
			</MenuButton>
			{isExpanded && (
				<SubMenuContainer onClick={onDismiss}>
					{SUB_MENUS[link].map(({ label, link: subLink }) => (
						<SubMenuItemContainer>
							<SubMenuDot>·</SubMenuDot>
							<StyledLink href={`${link}${subLink}`} key={label}>
								<SubMenuItem isActive={asPath.includes(subLink)}>{label}</SubMenuItem>
							</StyledLink>
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

const SubMenuItem = styled.div<{ isActive?: boolean }>`
	font-size: 19px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	box-sizing: border-box;
	padding: 15px;
	background-color: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	width: 100%;

	${(props) =>
		props.isActive &&
		css`
			color: ${(props) => props.theme.colors.common.primaryWhite};
		`}
`;

const SubMenuDot = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 19px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	margin-right: 30px;
`;

export default MobileSubMenu;
