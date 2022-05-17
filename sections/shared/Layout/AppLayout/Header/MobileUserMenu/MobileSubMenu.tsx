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
						<Link href={`${link}${subLink}`} key={label}>
							<SubMenuItem isActive={asPath.includes(subLink)}>{label}</SubMenuItem>
						</Link>
					))}
				</SubMenuContainer>
			)}
		</>
	);
};

const SubMenuContainer = styled.div`
	box-sizing: border-box;
	padding-left: 30px;
	border-left: 3px solid #2b2a2a;
`;

const SubMenuItem = styled.div<{ isActive?: boolean }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 25px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	margin-bottom: 30px;

	${(props) =>
		props.isActive &&
		css`
			color: ${(props) => props.theme.colors.common.primaryWhite};
		`}
`;

export default MobileSubMenu;
