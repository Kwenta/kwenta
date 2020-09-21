import React from 'react';
import styled from 'styled-components';
import TextLogo from 'assets/svg/brand/text-logo-white.svg';
import { FlexDiv, FlexDivRowCentered } from 'styles/common';
import { useTranslation } from 'react-i18next';
import MediumLogo from 'assets/svg/marketing/medium-icon.svg';
import TwitterLogo from 'assets/svg/marketing/twitter-icon.svg';

const Footer: React.FC = () => {
	const { t } = useTranslation();
	return (
		<footer>
			<Section>
				<Container>
					<Subtext>{t('homepage.footer.subtext.powered')}</Subtext>
					<TextLogo />
				</Container>
				<Container>
					<Subtext>{t('homepage.footer.subtext.copyright')}</Subtext>
					<SocialIcons>
						<Icons>
							<MediumLogo />
						</Icons>
						<Icons>
							<TwitterLogo />
						</Icons>
					</SocialIcons>
				</Container>
			</Section>
		</footer>
	);
};

export default Footer;

const Section = styled(FlexDivRowCentered)`
	height: 260px;
	padding: 0px 64px;
	margin: 64px 0;
	justify-content: space-between;
`;

const Subtext = styled.p`
	font-size: 13px;
	line-height: 16px;
	color: #747b80;
	margin: 0px 16px;
`;

const Container = styled(FlexDivRowCentered)``;

const SocialIcons = styled(FlexDiv)``;

const Icons = styled.div`
	margin: 0px 16px;
`;
