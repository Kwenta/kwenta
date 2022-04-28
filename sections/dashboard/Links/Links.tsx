import { FC } from 'react';
import { Svg } from 'react-optimized-image';
import styled from 'styled-components';

import { EXTERNAL_LINKS } from 'constants/links';
import twitterIcon from '../../../assets/svg/social/twitter-2.svg';
import discordIcon from '../../../assets/svg/social/discord-2.svg';
import gitbookIcon from '../../../assets/svg/gitbook.svg';

const Links: FC = () => {
	return (
		<LinkContainer>
			<a href={EXTERNAL_LINKS.Social.Twitter} target="_blank" rel="noreferrer">
				<Svg src={twitterIcon} />
			</a>
			<a href={EXTERNAL_LINKS.Social.Discord} target="_blank" rel="noreferrer">
				<Svg src={discordIcon} />
			</a>
			<a href={EXTERNAL_LINKS.Docs.DocsRoot} target="_blank" rel="noreferrer">
				<Svg src={gitbookIcon} />
			</a>
		</LinkContainer>
	);
};

const LinkContainer = styled.div`
	max-width: 80px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 100px;
	margin-left: 15px;
`;

export default Links;
