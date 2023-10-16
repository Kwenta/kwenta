import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FlexDivRowCentered } from 'components/layout/flex'
import { SplitContainer } from 'components/layout/grid'
import { Heading } from 'components/Text'
import media from 'styles/media'

import RedeemInputCard from './Stake/InputCards/RedeempInputCard'

const RedemptionTab = () => {
	const { t } = useTranslation()

	return (
		<Container>
			<TitleContainer>
				<StyledHeading variant="h4">{t('dashboard.stake.tabs.redeem.title')}</StyledHeading>
			</TitleContainer>
			<SplitContainer>
				<RedeemInputCard
					inputLabel={t('dashboard.stake.tabs.stake-table.vkwenta-token')}
					isVKwenta
				/>
				<RedeemInputCard
					inputLabel={t('dashboard.stake.tabs.stake-table.vekwenta-token')}
					isVKwenta={false}
				/>
			</SplitContainer>
		</Container>
	)
}

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const TitleContainer = styled(FlexDivRowCentered)`
	margin: 30px 0px;
	column-gap: 10%;
`

const Container = styled.div`
	${media.lessThan('lg')`
		padding: 0px 15px;
	`}
	margin-top: 20px;
`

export default RedemptionTab
