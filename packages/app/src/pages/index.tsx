import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FC, useCallback, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Earning from 'sections/homepage/Earning'
import Features from 'sections/homepage/Features'
import Hero from 'sections/homepage/Hero'
import ShortList from 'sections/homepage/ShortList'
import TradeNow from 'sections/homepage/TradeNow'
import BaseReferralModal from 'sections/referrals/ReferralModal/BaseReferralModal'
import HomeLayout from 'sections/shared/Layout/HomeLayout'
import { setOpenModal } from 'state/app/reducer'
import { selectShowModal } from 'state/app/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { fetchUnmintedBoostNftForCode } from 'state/referrals/action'
import { selectIsReferralCodeValid } from 'state/referrals/selectors'
import media from 'styles/media'

type AppLayoutProps = {
	children: React.ReactNode
}

type HomePageComponent = FC & { layout?: FC<AppLayoutProps> }

const Assets = dynamic(() => import('../sections/homepage/Assets'), {
	ssr: false,
})

const HomePage: HomePageComponent = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const router = useRouter()
	const routerReferralCode = (router.query.ref as string)?.toLowerCase()
	const isReferralCodeValid = useAppSelector(selectIsReferralCodeValid)
	const openModal = useAppSelector(selectShowModal)

	useLayoutEffect(() => {
		if (router.isReady && routerReferralCode) {
			dispatch(fetchUnmintedBoostNftForCode(routerReferralCode))
		}
	}, [dispatch, router.isReady, routerReferralCode])

	useLayoutEffect(() => {
		if (isReferralCodeValid) {
			dispatch(setOpenModal('referrals_mint_boost_nft'))
		}
	}, [dispatch, isReferralCodeValid])

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null))
	}, [dispatch])

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<HomeLayout>
				<Container>
					<Hero />
					<Assets />
					<ShortList />
					<Earning />
					<Features />
					<TradeNow />
				</Container>
			</HomeLayout>
			{openModal === 'referrals_mint_boost_nft' && routerReferralCode && isReferralCodeValid && (
				<BaseReferralModal onDismiss={onDismiss} referralCode={routerReferralCode} />
			)}
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
