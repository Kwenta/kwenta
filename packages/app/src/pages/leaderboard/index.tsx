import Head from 'next/head'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { MobileHiddenView, MobileOnlyView } from 'components/Media'
import Leaderboard from 'sections/leaderboard/Leaderboard'
import AppLayout from 'sections/shared/Layout/AppLayout'
import { PageContent, MainContent, FullHeightContainer } from 'styles/common'

type LeaderComponent = FC & { getLayout: (page: ReactNode) => JSX.Element }

const Leader: LeaderComponent = () => {
	const { t } = useTranslation()

	return (
		<>
			<Head>
				<title>{t('leaderboard.page-title')}</title>
			</Head>
			<PageContent>
				<MobileHiddenView>
					<FullHeightContainer>
						<MainContent>
							<Leaderboard />
						</MainContent>
					</FullHeightContainer>
				</MobileHiddenView>
				<MobileOnlyView>
					<MobileMainContent>
						<Leaderboard mobile />
					</MobileMainContent>
				</MobileOnlyView>
			</PageContent>
		</>
	)
}

const MobileMainContent = styled.div`
	width: 100%;
	padding: 15px;
`

Leader.getLayout = (page) => <AppLayout>{page}</AppLayout>

export default Leader
