import { FC } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { FullScreenContainer } from 'styles/common';
import Footer from './Footer';

import Header from './Header';

type HomeLayoutProps = {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => (
	<FullScreenContainer>
		<BlueBlurImageHero />
		<GoldenBlurImageHero />
		<BlueBlurImageShortList />
		<GoldenBlurImageShortList />
		<BlueBlurImageEarning />
		<GoldenBlurImageEarning />
		<BlueBlurImageTradeNow />
		<GoldenBlurImageTradeNow />
		<GlobalStyle />
		<Header />
		{children}
		<Footer />
	</FullScreenContainer>
);

const BlueBlurImageHero = styled.div`
	position: absolute;
	width: 201.37px;
	height: 220.5px;
	left: 302.01px;
	top: 600px;

	background: #02e1ff;
	opacity: 0.5;
	filter: blur(240px);
	transform: rotate(51.27deg);
`;

const GoldenBlurImageHero = styled.div`
	position: absolute;
	width: 550.34px;
	height: 493px;
	left: 904.83px;
	top: 700px;

	background: #c9975a;
	opacity: 0.3;
	filter: blur(217.829px);
`;

const BlueBlurImageShortList = styled.div`
	position: absolute;
	width: 121.37px;
	height: 180.5px;
	left: 600px;
	top: 3400px;

	background: #02e1ff;
	opacity: 0.5;
	filter: blur(240px);
	transform: rotate(51.27deg);
`;

const GoldenBlurImageShortList = styled.div`
	position: absolute;
	width: 300.34px;
	height: 453px;
	left: 1204.83px;
	top: 3300px;

	background: #c9975a;
	opacity: 0.3;
	filter: blur(217.829px);
`;

const BlueBlurImageEarning = styled.div`
	position: absolute;
	width: 151.37px;
	height: 220.5px;
	left: 200px;
	top: 4000px;

	background: #02e1ff;
	opacity: 0.5;
	filter: blur(240px);
	transform: rotate(51.27deg);
`;

const GoldenBlurImageEarning = styled.div`
	position: absolute;
	width: 350.34px;
	height: 493px;
	left: 254.83px;
	top: 3700px;

	background: #c9975a;
	opacity: 0.3;
	filter: blur(217.829px);
`;

const BlueBlurImageTradeNow = styled.div`
	position: absolute;
	width: 201.37px;
	height: 270.5px;
	left: 400px;
	top: 7500px;

	background: #02e1ff;
	opacity: 0.5;
	filter: blur(240px);
	transform: rotate(51.27deg);
`;

const GoldenBlurImageTradeNow = styled.div`
	position: absolute;
	width: 350.34px;
	height: 493px;
	left: 1204.83px;
	top: 7400px;

	background: #c9975a;
	opacity: 0.3;
	filter: blur(217.829px);
`;
const GlobalStyle = createGlobalStyle`
	body {
		overflow-x: hidden;
	}
`;

export default HomeLayout;
