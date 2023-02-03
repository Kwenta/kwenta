import { memo } from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { BANNER_ENABLED, BANNER_LINK_URL, BANNER_TEXT } from 'constants/announcement';
import media from 'styles/media';

const Banner = memo(() => {
	if (!BANNER_ENABLED) return null;

	return (
		<>
			<DesktopOnlyView>
				<FuturesBannerContainer>
					<FuturesBannerLinkWrapper>{bannerLink}</FuturesBannerLinkWrapper>
				</FuturesBannerContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<FuturesBannerContainer>{bannerLink}</FuturesBannerContainer>
			</MobileOrTabletView>
		</>
	);
});

const FuturesLink = styled.a`
	margin-right: 5px;
	background: #313131;
	padding: 4px 9px;
	border-radius: 20px;
`;

const linkProps = BANNER_LINK_URL
	? { href: BANNER_LINK_URL, target: '_blank' }
	: { as: 'p' as const };

const bannerLink = <FuturesLink {...linkProps}>{BANNER_TEXT}</FuturesLink>;

const FuturesBannerContainer = styled.div`
	height: 70px;
	width: 100%;
	display: flex;
	align-items: center;
	margin-bottom: -35px;

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

	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

export default Banner;
