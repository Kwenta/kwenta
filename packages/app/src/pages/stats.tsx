import Head from 'next/head'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HomeLayout from 'sections/shared/Layout/HomeLayout'
import { Stats } from 'sections/stats'
import { fetchMarkets } from 'state/futures/actions'
import { useFetchAction } from 'state/hooks'
import media from 'styles/media'

type AppLayoutProps = {
	children: React.ReactNode
}

type StatsPageComponent = FC & { layout?: FC<AppLayoutProps> }

const HomePage: StatsPageComponent = () => {
	const { t } = useTranslation()
	useFetchAction(fetchMarkets)

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<HomeLayout>
				<Stats />
			</HomeLayout>
		</>
	)
}

export const Container = styled.div`
	width: 100%;
	margin: 0 auto;
	padding: 100px 20px 0 20px;
	${media.lessThan('sm')`
		padding: 50px 15px 0 15px;
	`}
`

export default HomePage
