import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import useWindowSize from 'hooks/useWindowSize'

type HeadingProps = {
	title: string
	copy: string
}

export const ReferralsHeading: FC<HeadingProps> = memo(({ title, copy }) => {
	const { t } = useTranslation()
	const { deviceType } = useWindowSize()
	const isMobile = useMemo(() => deviceType === 'mobile', [deviceType])

	return (
		<TitleContainer>
			<FlexDivCol rowGap="5px">
				<StyledHeading variant="h4">{title}</StyledHeading>
				{!isMobile && <Body color="secondary">{copy}</Body>}
			</FlexDivCol>
			<StyledButton
				size="xsmall"
				isRounded
				textTransform="none"
				onClick={() => window.open(EXTERNAL_LINKS.Docs.Referrals, '_blank')}
			>
				{t('referrals.docs')}
			</StyledButton>
		</TitleContainer>
	)
})

const TitleContainer = styled(FlexDivRowCentered)`
	margin: 72px 0 30px;
`

const StyledButton = styled(Button)`
	border-width: 0px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`
