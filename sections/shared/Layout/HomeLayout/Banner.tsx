import { memo, useCallback, useEffect } from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import {
	BANNER_ENABLED,
	BANNER_HEIGHT_DESKTOP,
	BANNER_HEIGHT_MOBILE,
	BANNER_LINK_URL,
	BANNER_TEXT,
	BANNER_WAITING_TIME,
} from 'constants/announcement';
import CloseIconWithHover from 'sections/shared/components/CloseIconWithHover';
import { setShowBanner } from 'state/app/reducer';
import { selectShowBanner } from 'state/app/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import media from 'styles/media';
import localStore from 'utils/localStore';

const Banner = memo(() => {
	const dispatch = useAppDispatch();
	const showBanner = useAppSelector(selectShowBanner);
	const currentTime = new Date().getTime();
	const storedTime: number = localStore.get('bannerIsClicked') || 0;

	useEffect(
		() => {
			dispatch(setShowBanner(currentTime - storedTime >= BANNER_WAITING_TIME));
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[storedTime]
	);

	const handleDismiss = useCallback(
		(e) => {
			dispatch(setShowBanner(false));
			localStore.set('bannerIsClicked', currentTime);
			e.stopPropagation();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const openDetails = useCallback(
		() => window.open(BANNER_LINK_URL, '_blank', 'noopener noreferrer'),
		[]
	);

	if (!BANNER_ENABLED || !showBanner) return null;

	return (
		<>
			<DesktopOnlyView>
				<FuturesBannerContainer onClick={openDetails}>
					<FuturesBannerLinkWrapper>
						<FuturesLink>
							<strong>Important: </strong>
							{BANNER_TEXT}
						</FuturesLink>
						<CloseIconWithHover onClick={handleDismiss} style={{ marginTop: '3px' }} />
					</FuturesBannerLinkWrapper>
				</FuturesBannerContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<FuturesBannerContainer onClick={openDetails}>
					<FuturesLink>
						<strong>Important: </strong>
						{BANNER_TEXT}
					</FuturesLink>
					<CloseIconWithHover
						width={12}
						height={12}
						onClick={handleDismiss}
						style={{ flex: '0.08', marginTop: '5px' }}
					/>
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
	${media.lessThan('md')`
		margin-right: 0px;
		flex: 1;
	`};
`;

const FuturesBannerContainer = styled.div<{ $compact?: boolean }>`
	height: ${BANNER_HEIGHT_DESKTOP}px;
	width: 100%;
	display: flex;
	align-items: center;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.badge.yellow.dark.background};
	margin-bottom: 0;
	cursor: pointer;

	${media.lessThan('md')`
		position: relative;
		margin-bottom: 0px;
		flex-direction: row;
		justify-content: center;
		text-align: center;
		background: transaparent;
		padding: 12px 10px;
		border-radius: 0px;
		gap: 5px;
		height: ${BANNER_HEIGHT_MOBILE}px;
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
