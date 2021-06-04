import { EXTERNAL_LINKS } from 'constants/links';
import React from 'react';
import styled from 'styled-components';
import { ExternalLink, Paragraph } from 'styles/common';
import media from 'styles/media';
import { useTranslation } from 'react-i18next';
import { Img } from 'react-optimized-image';

import TextLogo from 'assets/svg/brand/text-logo-white.svg';

const PoweredBySynthetix = () => {
	const { t } = useTranslation();
	return (
		<Container>
			<Text>{t('common.powered-by')}</Text>
			<ExternalLink href={EXTERNAL_LINKS.Synthetix.Home}>
				<Img src={TextLogo} height="10.5px" />
			</ExternalLink>
		</Container>
	);
};

const Container = styled.div`
	display: grid;
	grid-auto-flow: column;
	${media.lessThan('sm')`
		grid-auto-flow: row;
		text-align: center;
		grid-gap: 15px;
	`}
`;

const Text = styled(Paragraph)`
	font-size: 12px;
	color: ${(props) => props.theme.colors.silver};
	font-family: ${(props) => props.theme.fonts.bold};
	padding-right: 10px;
	text-transform: uppercase;
	line-height: normal;
	${media.lessThan('sm')`
		padding-right: 0;
	`}
`;

export default PoweredBySynthetix;
