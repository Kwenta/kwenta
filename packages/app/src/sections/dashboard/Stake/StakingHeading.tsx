import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import { BANNER_TEXT } from 'constants/announcement'
import { EXTERNAL_LINKS } from 'constants/links'

interface StakingHeadingProps {
	title: string
}

export const StakingHeading: FC<StakingHeadingProps> = memo(({ title }) => {
	const { t } = useTranslation()

	return (
		<FlexDivCol>
			<BannerContainer
				onClick={() =>
					window.open(EXTERNAL_LINKS.Docs.StakingV2Migration, '_blank', 'noopener noreferrer')
				}
			>
				<FuturesLink>{BANNER_TEXT}</FuturesLink>
			</BannerContainer>
			<TitleContainer>
				<FlexDivCol rowGap="5px">
					<StyledHeading variant="h4">{title}</StyledHeading>
				</FlexDivCol>
				<StyledButton
					size="xsmall"
					isRounded
					textTransform="none"
					onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
				>
					{t('dashboard.stake.docs')}
				</StyledButton>
			</TitleContainer>
		</FlexDivCol>
	)
})

const TitleContainer = styled(FlexDivRowCentered)`
	margin-bottom: 30px;
`

const StyledButton = styled(Button)`
	border-width: 0px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const FuturesLink = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.banner.yellow.text};
	padding: 20px 0px;
`

const BannerContainer = styled(FlexDivCentered)`
	width: 100%;
	justify-content: center;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.banner.yellow.background};
	margin-bottom: 30px;
	cursor: pointer;
	border-radius: 8px;
	white-space: pre-wrap;
`
