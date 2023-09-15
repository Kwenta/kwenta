import Head from 'next/head'
import { FC, ReactNode, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { MobileHiddenView, MobileOnlyView } from 'components/Media'
import ReferralsTabs from 'sections/referrals/ReferralsTabs'
import { ReferralsTab } from 'sections/referrals/types'
import AppLayout from 'sections/shared/Layout/AppLayout'
import { useFetchReferralData } from 'state/futures/hooks'
import { FullHeightContainer, MainContent, PageContent } from 'styles/common'

type ReferralsComponent = FC & { getLayout: (page: ReactNode) => JSX.Element }

const Referrals: ReferralsComponent = () => {
	const { t } = useTranslation()
	const [currentTab, setCurrentTab] = useState(ReferralsTab.Traders)
	const handleChangeTab = useCallback(
		(tab: ReferralsTab) => () => {
			setCurrentTab(tab)
		},
		[]
	)

	useFetchReferralData()

	return (
		<>
			<Head>
				<title>{t('referrals.page-title')}</title>
			</Head>
			<PageContent>
				<MobileHiddenView>
					<FullHeightContainer>
						<MainContent>
							<ReferralsTabs currentTab={currentTab} onChangeTab={handleChangeTab} />
						</MainContent>
					</FullHeightContainer>
				</MobileHiddenView>
				<MobileOnlyView>
					<MobileMainContent>
						<ReferralsTabs currentTab={currentTab} onChangeTab={handleChangeTab} />
					</MobileMainContent>
				</MobileOnlyView>
			</PageContent>
		</>
	)
}

Referrals.getLayout = (page) => <AppLayout>{page}</AppLayout>

const MobileMainContent = styled.div`
	width: 100%;
	padding: 15px;
`

export default Referrals
