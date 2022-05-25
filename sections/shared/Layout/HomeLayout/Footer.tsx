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
	const DOC_LINKS = [
		{
			key: t('homepage.footer.about-kwenta.title'),
			links: [
				{
					name: t('homepage.footer.about-kwenta.docs'),
					link: EXTERNAL_LINKS.Docs.DocsRoot,
				},
				{
					name: t('homepage.footer.about-kwenta.news'),
					link: EXTERNAL_LINKS.Social.Mirror,
				},
				{
					name: t('homepage.footer.about-kwenta.faq'),
					link: '',
				},
				{
					name: t('homepage.footer.about-kwenta.dao-roles'),
					link: EXTERNAL_LINKS.Docs.DaoRoles,
				},
			],
		},
		{
			key: t('homepage.footer.use-kwenta.title'),
			links: [
				{
					name: t('homepage.footer.use-kwenta.how-to'),
					link: EXTERNAL_LINKS.Docs.DocsRoot,
				},
				{
					name: t('homepage.footer.use-kwenta.perps'),
					link: EXTERNAL_LINKS.Docs.Perpetuals,
				},
				{
					name: t('homepage.footer.use-kwenta.short'),
					link: EXTERNAL_LINKS.Docs.Shorting,
				},
				{
					name: t('homepage.footer.use-kwenta.spot'),
					link: EXTERNAL_LINKS.Docs.Spot,
				},
			],
		},
		{
			key: t('homepage.footer.community.title'),
			links: [
				{
					name: t('homepage.footer.community.governance'),
					link: EXTERNAL_LINKS.Docs.Governance,
				},
				{
					name: t('homepage.footer.community.dev-dao'),
					link: EXTERNAL_LINKS.Docs.DevDao,
				},
				{
					name: t('homepage.footer.community.marketing-dao'),
					link: EXTERNAL_LINKS.Docs.MarketingDao,
				},
				{
					name: t('homepage.footer.community.kips'),
					link: EXTERNAL_LINKS.Kips.Home,
				},
			],
		},
	];
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
					{DOC_LINKS.map(({ key, links }) => (
						<ListContainer key={key}>
							<ListTitle>{key}</ListTitle>
							{links.map(({ name, link }) => (
								<StyledLink href={link} target="_blank">
									<p>{name}</p>
								</StyledLink>
							))}
						</ListContainer>
					))}
				</MultiListContainer>
				<PowerContainer>
					<PoweredBySynthetix />
					<CopyRight>{t('homepage.footer.copyright')}</CopyRight>
				</PowerContainer>
			</StyledGridContainer>
		</Container>
	);
};

const StyledLink = styled.a`
	cursor: pointer;
`;

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
