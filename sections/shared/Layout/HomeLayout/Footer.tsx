import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Img, { Svg } from 'react-optimized-image';

import { FlexDivCentered, Paragraph, ExternalLink } from 'styles/common';

import TextLogo from 'assets/svg/brand/text-logo-white.svg';
import MediumLogo from 'assets/inline-svg/marketing/medium-icon.svg';
import TwitterLogo from 'assets/inline-svg/marketing/twitter-icon.svg';

import media from 'styles/media';

import { EXTERNAL_LINKS } from 'constants/links';

const Footer: React.FC = () => {
	const { t } = useTranslation();

	return (
		<FooterContainer>
			<Container>
				<Subtext>{t('common.powered-by')}</Subtext>
				<ExternalLink href={EXTERNAL_LINKS.Synthetix.Home}>
					<Img src={TextLogo} alt="" />
				</ExternalLink>
			</Container>
			<SocialIcons>
				<ExternalLink href={EXTERNAL_LINKS.Social.Twitter}>
					<Svg src={TwitterLogo} />
				</ExternalLink>
				<ExternalLink href={EXTERNAL_LINKS.Social.Medium}>
					<Svg src={MediumLogo} />
				</ExternalLink>
			</SocialIcons>
		</FooterContainer>
	);
};

const FooterContainer = styled.footer`
	padding: 0px 20px;
	margin: 360px 0 60px 0;
	display: grid;
	grid-auto-flow: column;
	justify-content: space-between;
	${media.lessThan('sm')`
		margin-top: 150px;
		grid-auto-flow: row;
		justify-content: center;
	    grid-gap: 35px;
	`}
`;

const Subtext = styled(Paragraph)`
	font-size: 14px;
	color: ${(props) => props.theme.colors.silver};
	padding-right: 30px;
	${media.lessThan('sm')`
		padding-right: 0;
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

const SocialIcons = styled(FlexDivCentered)`
	> * + * {
		margin-left: 10px;
	}
	${media.lessThan('sm')`
		justify-content: center;
		> * + * {
			margin-left: 24px;
		}
	`}
`;

export default Footer;
