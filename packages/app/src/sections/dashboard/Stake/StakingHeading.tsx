import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import { Heading } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'

interface StakingHeadingProps {
	title: string
}

export const StakingHeading: FC<StakingHeadingProps> = memo(({ title }) => {
	const { t } = useTranslation()

	return (
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
