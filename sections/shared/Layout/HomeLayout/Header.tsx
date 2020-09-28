import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

import { HEADER_HEIGHT } from 'constants/ui';
import ROUTES from 'constants/routes';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Button from 'components/Button';

import AppHeader from '../AppLayout/Header';
import { TextButton } from 'styles/common';

import Logo from '../Logo';

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
					<div>
						<WalletButton>{t('homepage.nav.wallet')}</WalletButton>
						<Link href={ROUTES.Exchange}>
							<Button variant="primary" isRounded={false} size="md">
								{t('homepage.nav.exchange')}
							</Button>
						</Link>
					</div>
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
	grid-template-columns: auto 1fr auto;
`;

const Links = styled.div`
	padding-left: 100px;
	justify-self: center;
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

const WalletButton = styled(TextButton)`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	margin-right: 16px;
	font-size: 12px;
`;

export default Header;
