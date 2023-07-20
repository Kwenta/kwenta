import { formatNumber, toWei, truncateNumbers } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import SegmentedControl from 'components/SegmentedControl'
import { DEFAULT_TOKEN_DECIMALS } from 'constants/defaults'
import { StakingCard } from 'sections/dashboard/Stake/card'
import media from 'styles/media'

import { Body, NumericValue } from './Text'

type StakeCardProps = {
	title: string
	stakeBalance: Wei
	unstakeBalance: Wei
	onStake(amount: string): void
	onUnstake(amount: string): void
	stakeEnabled?: boolean
	unstakeEnabled?: boolean
	isStaked?: boolean | undefined
	isUnstaked?: boolean | undefined
	isApproved?: boolean
	onApprove?: () => void
	isStaking?: boolean
	isUnstaking?: boolean
	isApproving?: boolean
}

const StakeCard: FC<StakeCardProps> = memo(
	({
		title,
		stakeBalance,
		unstakeBalance,
		onStake,
		onUnstake,
		stakeEnabled = true,
		unstakeEnabled = true,
		isStaked = false,
		isUnstaked = false,
		isApproved,
		onApprove,
		isStaking = false,
		isUnstaking = false,
		isApproving = false,
	}) => {
		const { t } = useTranslation()
		const [amount, setAmount] = useState('')
		const [activeTab, setActiveTab] = useState(0)

		const balance = useMemo(() => {
			return activeTab === 0 ? stakeBalance : unstakeBalance
		}, [activeTab, stakeBalance, unstakeBalance])

		const isEnabled = useMemo(() => {
			return toWei(amount).gt(0) && balance.gt(0)
		}, [amount, balance])

		const isStakeEnabled = useMemo(() => {
			return activeTab === 0 && isEnabled && stakeEnabled
		}, [activeTab, isEnabled, stakeEnabled])

		const isUnstakeEnabled = useMemo(() => {
			return activeTab === 1 && isEnabled && unstakeEnabled
		}, [activeTab, isEnabled, unstakeEnabled])

		const isDisabled = useMemo(() => {
			return activeTab === 0 ? !isStakeEnabled : !isUnstakeEnabled
		}, [activeTab, isStakeEnabled, isUnstakeEnabled])

		const balanceString = useMemo(() => {
			return formatNumber(balance, { suggestDecimals: true })
		}, [balance])

		const isLoading = useMemo(() => {
			return activeTab === 0 ? (isApproved ? isStaking : isApproving) : isUnstaking
		}, [activeTab, isApproved, isApproving, isStaking, isUnstaking])

		const onMaxClick = useCallback(() => {
			setAmount(truncateNumbers(balance, DEFAULT_TOKEN_DECIMALS))
		}, [balance])

		const handleTabChange = useCallback((tabIndex: number) => {
			setAmount('')
			setActiveTab(tabIndex)
		}, [])

		const handleSubmit = useCallback(() => {
			if (isStakeEnabled) {
				if (isApproved) {
					onStake(amount)
				} else {
					onApprove?.()
				}
			} else if (isUnstakeEnabled) {
				onUnstake(amount)
			}
		}, [isStakeEnabled, isUnstakeEnabled, onStake, onUnstake, amount, onApprove, isApproved])

		const handleChange = useCallback((_: any, newValue: string) => {
			if (newValue !== '' && newValue.indexOf('.') === -1) {
				setAmount(parseFloat(newValue).toString())
			} else {
				setAmount(newValue)
			}
		}, [])

		useEffect(() => {
			if ((activeTab === 0 && isStaked) || (activeTab === 1 && isUnstaked)) {
				setAmount('')
			}
		}, [activeTab, isStaked, isUnstaked])

		return (
			<CardGridContainer>
				<SegmentedControl
					values={[
						t('dashboard.stake.tabs.stake-table.stake'),
						t('dashboard.stake.tabs.stake-table.unstake'),
					]}
					onChange={handleTabChange}
					selectedIndex={activeTab}
				/>
				<FlexDivCol rowGap="50px" style={{ marginTop: '15px' }}>
					<FlexDivCol>
						<StakeInputHeader>
							<Body color="secondary">{title}</Body>
							<StyledFlexDivRowCentered>
								<Body color="secondary">{t('dashboard.stake.tabs.stake-table.balance')}</Body>
								<NumericValueButton onClick={onMaxClick}>{balanceString}</NumericValueButton>
							</StyledFlexDivRowCentered>
						</StakeInputHeader>
						<NumericInput value={amount} onChange={handleChange} bold />
					</FlexDivCol>
					<Button
						fullWidth
						variant="flat"
						size="small"
						disabled={isDisabled}
						loading={isLoading}
						onClick={handleSubmit}
					>
						{activeTab === 0
							? isApproved
								? t('dashboard.stake.tabs.stake-table.stake')
								: t('dashboard.stake.tabs.stake-table.approve')
							: t('dashboard.stake.tabs.stake-table.unstake')}
					</Button>
				</FlexDivCol>
			</CardGridContainer>
		)
	}
)

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)`
	column-gap: 5px;
`

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	${media.lessThan('lg')`
		justify-content: flex-start;
	`}
`

const StakeInputHeader = styled(FlexDivRowCentered)`
	margin: 25px 0 10px;
	color: ${(props) => props.theme.colors.selectedTheme.title};
	font-size: 14px;
`

const NumericValueButton = styled(NumericValue)`
	cursor: pointer;
`

export default StakeCard
