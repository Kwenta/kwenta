import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

import { HEADER_HEIGHT } from 'constants/ui';
import ROUTES from 'constants/routes';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Button from 'components/Button';

import UserMenu from '../AppLayout/Header/UserMenu';
import AppHeader from '../AppLayout/Header';

import media from 'styles/media';

import Logo from '../Logo';
import { GridDivCenteredCol } from 'styles/common';

const Header: FC = () => {
	const { t } = useTranslation();

	return (
		<>
			<MobileHiddenView>
				<Container>
					<Logo />
					<Links>
						<StyledLink href="#why">{t('homepage.nav.why')}</StyledLink>
						<StyledLink href="#how">{t('homepage.nav.how')}</StyledLink>
						<StyledLink href="#faq">{t('homepage.nav.faq')}</StyledLink>
					</Links>
					<MenuContainer>
						<UserMenu isTextButton={true} />
						<Link href={ROUTES.Exchange.Home}>
							<Button variant="primary" isRounded={false} size="md">
								{t('homepage.nav.exchange')}
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

const Links = styled.div`
	white-space: nowrap;
	justify-self: center;
	${media.lessThan('md')`
		display: none;
	`}
`;

const StyledLink = styled.a`
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
