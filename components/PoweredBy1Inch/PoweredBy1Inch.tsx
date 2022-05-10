import { EXTERNAL_LINKS } from 'constants/links';
import React from 'react';
import styled from 'styled-components';
import { ExternalLink, Paragraph } from 'styles/common';
import media from 'styles/media';
import { useTranslation } from 'react-i18next';

import Branding from 'assets/svg/providers/1inch.svg';

const PoweredBy1Inch = () => {
	const { t } = useTranslation();
	return (
		<Container>
			<Text>{t('common.powered-by')}</Text>
			<StyledExternalLink href={EXTERNAL_LINKS.Trading.OneInch}>
				<Branding height={20} />
			</StyledExternalLink>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	align-items: center;
	margin: 0 14px;
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

const StyledExternalLink = styled(ExternalLink)`
	line-height: 0.9em;
`;

export default PoweredBy1Inch;
