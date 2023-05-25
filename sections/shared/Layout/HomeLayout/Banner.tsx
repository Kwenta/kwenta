import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { BANNER_ENABLED, BANNER_TEXT } from 'constants/announcement';
import ROUTES from 'constants/routes';
import { selectMarketAsset } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import media from 'styles/media';

const Banner = memo(() => {
	const router = useRouter();
	const currentMarket = useAppSelector(selectMarketAsset);

	const switchToSM = useCallback(() => {
		router.push(ROUTES.Markets.MarketPair(currentMarket, 'cross_margin'));
	}, [currentMarket, router]);

	if (!BANNER_ENABLED) return null;

	return (
		<>
			<DesktopOnlyView>
				<FuturesBannerContainer onClick={() => switchToSM()}>
					<FuturesBannerLinkWrapper>
						<FuturesLink>{BANNER_TEXT}</FuturesLink>
					</FuturesBannerLinkWrapper>
				</FuturesBannerContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<FuturesBannerContainer onClick={() => switchToSM()}>
					<FuturesLink>{BANNER_TEXT}</FuturesLink>
				</FuturesBannerContainer>
			</MobileOrTabletView>
		</>
	);
});

const FuturesLink = styled.div`
	margin-right: 5px;
	padding: 4px 9px;
	border-radius: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.badge.yellow.dark.text};
`;

const FuturesBannerContainer = styled.div<{ $compact?: boolean }>`
	height: 60px;
	width: 100%;
	display: flex;
	align-items: center;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.badge.yellow.dark.background};
	margin-bottom: 0;
	cursor: pointer;

	${media.lessThan('md')`
		position: relative;
		margin-bottom: 0px;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		background: transaparent;
		padding: 22px 10px;
		border-radius: 0px;
		gap: 5px;
	`}
`;

const FuturesBannerLinkWrapper = styled.div`
	width: 100%;
	text-align: center;
	position: absolute;
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

export default Banner;
