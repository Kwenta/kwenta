import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import LogoNoTextPNG from 'assets/png/brand/logo-no-text.png';
import MarketOrderPreview from 'assets/svg/marketing/market-order-preview.svg';
import AssetCollections from 'assets/svg/marketing/asset-collections.svg';

const HomePage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<Container>
				<img src={LogoNoTextPNG} />
				<Header>The last exchange you’ll ever use</Header>
				<MarketOrderPreview />
				<DifferentAssetsSection>
					<AssetCollectionWrapper>
						<AssetCollections />
					</AssetCollectionWrapper>
					<Col>
						<Header>Trade 213 different assets</Header>
					</Col>
				</DifferentAssetsSection>
			</Container>
		</>
	);
};

const Container = styled(FlexDivColCentered)`
	width: 100%;
	padding: 55px 0px 24px 0px;
	margin-top: 60px;
`;

const Header = styled.p`
	font-size: 48px;
	font-style: normal;
	font-weight: 700;
	line-height: 58px;
	letter-spacing: 0.20000000298023224px;
	text-align: center;
	color: ${(props) => props.theme.colors.white};
`;

const DifferentAssetsSection = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;

const AssetCollectionWrapper = styled.div`
	width: 50%;
	margin-left: -20px;
`;

const Col = styled.div`
	width: 50%;
`;

export default HomePage;
