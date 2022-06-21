import { FC } from 'react';
import Img from 'react-optimized-image';
import styled from 'styled-components';
import LinkWhiteIcon from 'assets/svg/app/link-white.svg';
import media from 'styles/media';
import { HEADER_HEIGHT } from 'constants/ui';

type BannerProps = {
	copy: string;
	link: string;
};

const Banner: FC<BannerProps> = ({ copy, link }) => {
	return (
		<FuturesBannerContainer>
			<FuturesLink href={link} target="_blank">
				{copy}
				<Img src={LinkWhiteIcon} className="banner" />
			</FuturesLink>
		</FuturesBannerContainer>
	);
};

export default Banner;

const FuturesBannerContainer = styled.div`
	height: 65px;
	width: 100%;
	font-size: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-family: ${(props) => props.theme.fonts.bold};

	${media.lessThan('md')`
        text-align: center;
		top: ${HEADER_HEIGHT};
		margin-bottom: ${HEADER_HEIGHT};
	`}
`;

const FuturesLink = styled.a`
	${media.lessThan('md')`
        margin: auto;
        padding: 0px;
	`}
`;
