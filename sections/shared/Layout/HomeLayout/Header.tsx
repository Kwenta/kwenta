import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { ExternalLink, FlexDivCentered, TextButton } from 'styles/common';
import { HEADER_HEIGHT } from 'constants/ui';
import Button from 'components/Button';

import Logo from '../Logo';

const Header: FC = () => {
	const { t } = useTranslation();
	return (
		<Container>
			<Section left>
				<Logo />
			</Section>
			<Section>
				<ExternalLink>
					<Link>{t('homepage.nav.why')}</Link>
				</ExternalLink>
				<ExternalLink>
					<Link>{t('homepage.nav.how')}</Link>
				</ExternalLink>
				<ExternalLink>
					<Link>{t('homepage.nav.faq')}</Link>
				</ExternalLink>
			</Section>
			<Section right>
				<WalletButton>{t('homepage.nav.wallet')}</WalletButton>
				<Button variant="primary" isRounded={false} size="md">
					{t('homepage.nav.exchange')}
				</Button>
			</Section>
		</Container>
	);
};

const Container = styled.header`
	height: ${HEADER_HEIGHT};
	line-height: ${HEADER_HEIGHT};
	padding: 0px 20px;
	margin-top: 10px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
`;

const Section = styled<any>(FlexDivCentered)`
	width: 33%;
	justify-content: ${(props) => (props.left ? 'flex-start' : props.right ? 'flex-end' : 'center')};
`;

const Link = styled(TextButton)`
	font-size: 12px;
	font-weight: bold;
	text-align: center;
	color: #8a939f;
	margin: 0px 8px;
`;

const WalletButton = styled(TextButton)`
	color: #ffffff;
	font-size: 12px;
	font-weight: 700;
	margin-right: 16px;
`;

export default Header;
