import React from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import { FlexDivCentered, ExternalLink } from 'styles/common';

import MediumLogo from 'assets/svg/marketing/medium-icon.svg';
import TwitterLogo from 'assets/svg/marketing/twitter-icon.svg';

import media from 'styles/media';

import { EXTERNAL_LINKS } from 'constants/links';
import PoweredBySynthetix from 'components/PoweredBySynthetix';

const Footer: React.FC = () => {
	return (
		<FooterContainer>
			<PoweredBySynthetix />
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
