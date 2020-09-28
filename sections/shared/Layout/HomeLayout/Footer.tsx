import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDiv, FlexDivRowCentered, Paragraph, ExternalLink } from 'styles/common';

import TextLogo from 'assets/svg/brand/text-logo-white.svg';
import MediumLogo from 'assets/inline-svg/marketing/medium-icon.svg';
import TwitterLogo from 'assets/inline-svg/marketing/twitter-icon.svg';

import media from 'styles/media';

import { EXTERNAL_LINKS } from 'constants/links';

const CURRENT_YEAR = new Date().getFullYear();

const Footer: React.FC = () => {
	const { t } = useTranslation();

	return (
		<FooterContainer>
			<Container>
				<Subtext>{t('homepage.footer.subtext.powered')}</Subtext>
				<ExternalLink href={EXTERNAL_LINKS.Synthetix.Home}>
					<img src={TextLogo} alt="" />
				</ExternalLink>
			</Container>
			<FlexDivRowCentered>
				<CopyrightText>
					{t('homepage.footer.subtext.copyright', { currentYear: CURRENT_YEAR })}
				</CopyrightText>
				<SocialIcons>
					<ExternalLink href={EXTERNAL_LINKS.Social.Twitter}>
						<TwitterLogo />
					</ExternalLink>
					<ExternalLink href={EXTERNAL_LINKS.Social.Medium}>
						<MediumLogo />
					</ExternalLink>
				</SocialIcons>
			</FlexDivRowCentered>
		</FooterContainer>
	);
};

const FooterContainer = styled.footer`
	padding: 0px 20px;
	margin: 260px 0 60px 0;
	display: grid;
	grid-auto-flow: column;
	justify-content: space-between;
	${media.lessThan('sm')`
		grid-auto-flow: row;
		justify-content: center;
	    grid-gap: 35px;
	`}
`;

const Subtext = styled(Paragraph)`
	font-size: 12px;
	color: ${(props) => props.theme.colors.silver};
	padding-right: 30px;
	${media.lessThan('sm')`
		padding-right: 0;
	`}
`;

const CopyrightText = styled(Subtext)`
	padding-right: 60px;
	${media.lessThan('sm')`
		padding-right: 30px;
	`}
`;

const Container = styled.div`
	display: grid;
	grid-auto-flow: column;
	${media.lessThan('sm')`
		grid-auto-flow: row;
		text-align: center;
		grid-gap: 15px;
	`}
`;

const SocialIcons = styled(FlexDiv)`
	> * + * {
		margin-left: 10px;
	}
`;

export default Footer;
