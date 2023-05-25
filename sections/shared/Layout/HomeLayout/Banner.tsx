import { memo, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { BANNER_ENABLED, BANNER_TEXT } from 'constants/announcement';
import { MILLISECONDS_PER_DAY } from 'sdk/constants/period';
import media from 'styles/media';
import localStore from 'utils/localStore';

const Banner = memo(() => {
	const currentTime = new Date().getTime();
	const storedTime: number = localStore.get('bannerIsClicked') || 0;
	const [isClicked, setIsClicked] = useState(currentTime - storedTime < 3 * MILLISECONDS_PER_DAY);

	useEffect(() => {
		if (isClicked) {
			localStore.set('bannerIsClicked', currentTime);
		}
	}, [isClicked, currentTime]);

	const handleClick = useCallback(() => {
		setIsClicked(true);
	}, []);

	if (!BANNER_ENABLED || isClicked) return null;

	return (
		<>
			<DesktopOnlyView>
				<FuturesBannerContainer onClick={handleClick}>
					<FuturesBannerLinkWrapper>
						<FuturesLink>{BANNER_TEXT}</FuturesLink>
					</FuturesBannerLinkWrapper>
				</FuturesBannerContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<FuturesBannerContainer onClick={handleClick}>
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
	height: 50px;
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
		padding: 12px 10px;
		border-radius: 0px;
		gap: 5px;
		height: 60px;
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
