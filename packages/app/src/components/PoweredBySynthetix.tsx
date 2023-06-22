import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TextLogo from 'assets/svg/brand/text-logo-white.svg'
import { FlexDivColCentered } from 'components/layout/flex'
import { Body } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import { ExternalLink } from 'styles/common'

const PoweredBySynthetix = () => {
	const { t } = useTranslation()
	return (
		<Container>
			<Text>{t('common.powered-by')}</Text>
			<ExternalLink href={EXTERNAL_LINKS.Synthetix.Home}>
				<TextLogo height="10.5px" />
			</ExternalLink>
		</Container>
	)
}

const Container = styled(FlexDivColCentered)`
	row-gap: 5px;
`

const Text = styled(Body)`
	font-size: 10px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	opacity: 0.5;
	letter-spacing: 0.04em;
	font-variant: small-caps;
	text-transform: uppercase;
	line-height: 100%;
	text-align: center;
`

export default PoweredBySynthetix
