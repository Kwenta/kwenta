import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatDollars, truncateNumbers } from '@kwenta/sdk/utils'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import LinkArrowIcon from 'assets/svg/app/link-arrow.svg'
import KwentaLogo from 'assets/svg/earn/KWENTA.svg'
import OptimismLogo from 'assets/svg/providers/optimism.svg'
import Button from 'components/Button'
import { FlexDivRow } from 'components/layout/flex'
import Pill from 'components/Pill'
import { Body, LogoText } from 'components/Text'
import ROUTES from 'constants/routes'
import useClickOutside from 'hooks/useClickOutside'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { selectKwentaPrice, selectOpPrice } from 'state/earn/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
	claimMultipleAllRewards,
	claimMultipleOpRewards,
	claimMultipleSnxOpRewards,
} from 'state/staking/actions'
import { selectKwentaRewards, selectOpRewards, selectSnxOpRewards } from 'state/staking/selectors'
import media from 'styles/media'

const BalanceActions: FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const theme = useTheme()
	const router = useRouter()
	const opPrice = useAppSelector(selectOpPrice)
	const kwentaPrice = useAppSelector(selectKwentaPrice)
	const kwentaRewards = useAppSelector(selectKwentaRewards)
	const opRewards = useAppSelector(selectOpRewards)
	const snxOpRewards = useAppSelector(selectSnxOpRewards)
	const [open, setOpen] = useState(false)
	const [rewardBalance, setRewardBalance] = useState(ZERO_WEI)

	const { ref } = useClickOutside(() => setOpen(false))

	const goToStaking = useCallback(() => {
		router.push(ROUTES.Dashboard.Stake)
		setOpen(false)
	}, [router])

	const handleClaimAll = useCallback(() => {
		dispatch(claimMultipleAllRewards())
	}, [dispatch])

	const handleClaimOp = useCallback(() => {
		dispatch(claimMultipleOpRewards())
	}, [dispatch])

	const handleClaimSnxOp = useCallback(() => {
		dispatch(claimMultipleSnxOpRewards())
	}, [dispatch])

	const claimDisabledAll = useMemo(
		() => kwentaRewards.add(opRewards).add(snxOpRewards).lte(0),
		[opRewards, snxOpRewards, kwentaRewards]
	)

	const claimDisabledOp = useMemo(() => opRewards.lte(0), [opRewards])

	const claimDisabledSnxOp = useMemo(() => snxOpRewards.lte(0), [snxOpRewards])

	const REWARDS = [
		{
			key: 'trading-rewards',
			title: t('dashboard.rewards.trading-rewards.title'),
			copy: t('dashboard.rewards.trading-rewards.copy'),
			button: t('dashboard.rewards.staking'),
			kwentaIcon: true,
			linkIcon: true,
			rewards: kwentaRewards,
			onClick: goToStaking,
			isDisabled: false,
		},
		{
			key: 'op-rewards',
			title: t('dashboard.rewards.op-rewards.title'),
			copy: t('dashboard.rewards.op-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
			rewards: opRewards,
			onClick: handleClaimOp,
			isDisabled: claimDisabledOp,
		},
		{
			key: 'snx-rewards',
			title: t('dashboard.rewards.snx-rewards.title'),
			copy: t('dashboard.rewards.snx-rewards.copy'),
			button: t('dashboard.rewards.claim'),
			kwentaIcon: false,
			linkIcon: false,
			rewards: snxOpRewards,
			onClick: handleClaimSnxOp,
			isDisabled: claimDisabledSnxOp,
		},
	]

	useEffect(
		() =>
			setRewardBalance(
				kwentaPrice.mul(kwentaRewards).add(opPrice.mul(opRewards.add(snxOpRewards)))
			),
		[kwentaRewards, kwentaPrice, opPrice, snxOpRewards, opRewards]
	)

	return (
		<>
			<Button
				size="small"
				mono
				onClick={() => setOpen(!open)}
				style={{
					color: theme.colors.selectedTheme.yellow,
					borderColor: theme.colors.selectedTheme.newTheme.border.yellow,
				}}
			>
				<KwentaLogo style={{ marginRight: '5px' }} />
				<OptimismLogo height={18} width={18} style={{ marginRight: '5px' }} />
				{formatDollars(rewardBalance, { maxDecimals: 2 })}
			</Button>
			{open && (
				<RewardsTabContainer ref={ref}>
					<CardsContainer>
						{REWARDS.map((reward) => (
							<CardGrid key={reward.key}>
								<Body size="medium" color="primary" weight="bold">
									{reward.title}
								</Body>
								<StyledFlexDivRow>
									<div>
										<Body size="medium" color="secondary">
											{t('dashboard.rewards.claimable')}
										</Body>
										<LogoText kwentaIcon={reward.kwentaIcon} bold={false} size="medium" yellow>
											{truncateNumbers(reward.rewards, 4)}
										</LogoText>
									</div>
									<Button
										fullWidth
										variant="flat"
										size="small"
										disabled={reward.isDisabled}
										onClick={reward.onClick}
										style={{ marginLeft: '50px' }}
									>
										{reward.button}
										{reward.linkIcon ? (
											<LinkArrowIcon height={8} width={8} style={{ marginLeft: '2px' }} />
										) : null}
									</Button>
								</StyledFlexDivRow>
							</CardGrid>
						))}
						<Pill
							color="yellow"
							fullWidth={true}
							size="large"
							roundedCorner={false}
							weight="bold"
							onClick={handleClaimAll}
							disabled={claimDisabledAll}
						>
							{t('dashboard.rewards.claim-all')}
						</Pill>
					</CardsContainer>
				</RewardsTabContainer>
			)}
		</>
	)
}

const RewardsTabContainer = styled.div`
	z-index: 100;
	position: absolute;
	right: 12%;

	${media.lessThan('mdUp')`
		padding: 15px;
	`}

	${media.greaterThan('mdUp')`
		margin-top: 56px;
	`}
`

const CardGrid = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	row-gap: 7px;
`

const CardsContainer = styled(StakingCard)`
	display: grid;
	width: 100%;
	grid-template-rows: repeat(3, 1fr);
	grid-gap: 20px;
`

const StyledFlexDivRow = styled(FlexDivRow)`
	column-gap: 50px;
	align-items: center;
`

export default BalanceActions
