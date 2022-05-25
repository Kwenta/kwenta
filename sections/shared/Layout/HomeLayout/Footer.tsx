import React from 'react';
import styled from 'styled-components';

import { FlexDivCentered, ExternalLink } from 'styles/common';

import DiscordLogo from 'assets/svg/social/discord.svg';
import MediumLogo from 'assets/svg/marketing/medium-icon.svg';
import TwitterLogo from 'assets/svg/marketing/twitter-icon.svg';

import { EXTERNAL_LINKS } from 'constants/links';
import PoweredBySynthetix from 'components/PoweredBySynthetix';
import Logo from '../Logo';
import { GridContainer } from 'sections/homepage/common';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Container>
			<StyledGridContainer>
				<LogoFooter>
					<Logo isL2={false} />
					<SocialIcons>
						<ExternalLink href={EXTERNAL_LINKS.Social.Twitter}>
							<TwitterLogo />
						</ExternalLink>
						<ExternalLink href={EXTERNAL_LINKS.Social.Discord}>
							<DiscordLogo />
						</ExternalLink>
						<ExternalLink href={EXTERNAL_LINKS.Social.Mirror}>
							<MediumLogo />
						</ExternalLink>
					</SocialIcons>
				</LogoFooter>
				<MultiListContainer>
					<ListContainer>
						<ListTitle>Meet KWENTA</ListTitle>
						<p>About Kwenta</p>
						<p>Docs</p>
						<p>News</p>
						<p>FAQ</p>
						<p>DAO Roles</p>
					</ListContainer>
					<ListContainer>
						<ListTitle>Use KWENTA</ListTitle>
						<p>How to use Kwenta</p>
						<p>Perpetuals</p>
						<p>Shorting</p>
						<p>Spot Trading</p>
					</ListContainer>
					<ListContainer>
						<ListTitle>Community</ListTitle>
						<p>Governance</p>
						<p>Dev DAO</p>
						<p>Marketing DAO</p>
						<p>KIPs</p>
					</ListContainer>
				</MultiListContainer>
				<PowerContainer>
					<PoweredBySynthetix />
					<CopyRight>{t('homepage.footer.copyright')}</CopyRight>
				</PowerContainer>
			</StyledGridContainer>
		</Container>
	);
};

const CopyRight = styled.div`
	font-size: 12px;
	text-align: right;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	opacity: 0.5;
	margin-right: 20px;
	padding-top: 10px;
`;

const ListTitle = styled.div`
	font-size: 15px;
	line-height: 150%;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: uppercase;
`;

const PowerContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	width: 1280px;
	padding-top: 45px;
	border-top-width: 1px;
	border-top-style: solid;
	border-top-color: #3d3c3c;
`;

const MultiListContainer = styled.div`
	display: flex;
	flex-direction: row;
	column-gap: 350px;
	width: 1280px;
	padding-left: 40px;
	padding-right: 40px;
	margin-top: 80px;
	margin-bottom: 50px;
`;

const ListContainer = styled.div`
	disply: flex;
	flex-direction: column;
	font-size: 18px;
	line-height: 150%;
	color: ${(props) => props.theme.colors.common.primaryWhite};
`;

const LogoFooter = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	width: 1280px;
	padding-left: 40px;
	padding-right: 40px;
`;

const Container = styled.div`
	margin-bottom: 50px;
`;

const StyledGridContainer = styled(GridContainer)`
	grid-template-columns: repeat(1, auto);
	grid-column-gap: 20px;
`;

const SocialIcons = styled(FlexDivCentered)`
	> * + * {
		margin-left: 24px;
	}
`;

export default Footer;
