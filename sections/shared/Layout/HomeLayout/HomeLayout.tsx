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
	left: 2.01px;
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
	left: 604.83px;
	top: 800px;

	background: #c9975a;
	opacity: 0.3;
	filter: blur(217.829px);
`;

const BlueBlurImageShortList = styled.div`
	position: absolute;
	width: 151.37px;
	height: 220.5px;
	left: 300px;
	top: 3400px;

	background: #02e1ff;
	opacity: 0.5;
	filter: blur(240px);
	transform: rotate(51.27deg);
`;

const GoldenBlurImageShortList = styled.div`
	position: absolute;
	width: 350.34px;
	height: 493px;
	left: 604.83px;
	top: 3300px;

	background: #c9975a;
	opacity: 0.3;
	filter: blur(217.829px);
`;

const BlueBlurImageEarning = styled.div`
	position: absolute;
	width: 151.37px;
	height: 220.5px;
	left: 100px;
	top: 4400px;

	background: #02e1ff;
	opacity: 0.5;
	filter: blur(240px);
	transform: rotate(51.27deg);
`;

const GoldenBlurImageEarning = styled.div`
	position: absolute;
	width: 350.34px;
	height: 493px;
	left: 154.83px;
	top: 4300px;

	background: #c9975a;
	opacity: 0.3;
	filter: blur(217.829px);
`;

const BlueBlurImageTradeNow = styled.div`
	position: absolute;
	width: 201.37px;
	height: 220.5px;
	left: 100px;
	top: 8000px;

	background: #02e1ff;
	opacity: 0.5;
	filter: blur(240px);
	transform: rotate(51.27deg);
`;

const GoldenBlurImageTradeNow = styled.div`
	position: absolute;
	width: 350.34px;
	height: 493px;
	left: 1154.83px;
	top: 7900px;

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
