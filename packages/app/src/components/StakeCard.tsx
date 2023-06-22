import { toWei, truncateNumbers } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import SegmentedControl from 'components/SegmentedControl'
import { DEFAULT_CRYPTO_DECIMALS, DEFAULT_TOKEN_DECIMALS } from 'constants/defaults'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { numericValueCSS } from 'styles/common'

import ErrorView from './ErrorView'
import Spacer from './Spacer'

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
			return truncateNumbers(balance, DEFAULT_CRYPTO_DECIMALS)
		}, [balance])

		const onMaxClick = useCallback(() => {
			setAmount(truncateNumbers(balance, DEFAULT_TOKEN_DECIMALS))
		}, [balance])

		const handleTabChange = useCallback((tabIndex: number) => {
			setAmount('')
			setActiveTab(tabIndex)
		}, [])

		const handleSubmit = useCallback(() => {
			if (!isApproved) {
				onApprove?.()
			} else if (isStakeEnabled) {
				onStake(amount)
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
			<StakingInputCardContainer>
				<SegmentedControl
					values={[
						t('dashboard.stake.tabs.stake-table.stake'),
						t('dashboard.stake.tabs.stake-table.unstake'),
					]}
					onChange={handleTabChange}
					selectedIndex={activeTab}
				/>
				<FlexDivCol>
					<FlexDivCol>
						<StakeInputHeader>
							<div>{title}</div>
							<StyledFlexDivRowCentered>
								<div>{t('dashboard.stake.tabs.stake-table.balance')}</div>
								<div className="max" onClick={onMaxClick}>
									{balanceString}
								</div>
							</StyledFlexDivRowCentered>
						</StakeInputHeader>
						<NumericInput value={amount} onChange={handleChange} bold />
					</FlexDivCol>
					<Spacer height={25} />
					<Button
						fullWidth
						variant="flat"
						size="small"
						disabled={isDisabled}
						onClick={handleSubmit}
					>
						{!isApproved
							? t('dashboard.stake.tabs.stake-table.approve')
							: activeTab === 0
							? t('dashboard.stake.tabs.stake-table.stake')
							: t('dashboard.stake.tabs.stake-table.unstake')}
					</Button>
					<Spacer height={25} />
					<ErrorView message={'2 week unstaking cooldown lock'} containerStyle={{ margin: '0' }} />
				</FlexDivCol>
			</StakingInputCardContainer>
		)
	}
)

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)`
	column-gap: 5px;
`

const StakingInputCardContainer = styled(StakingCard)`
	min-height: 125px;
	margin-bottom: 0px;
`

const StakeInputHeader = styled(FlexDivRowCentered)`
	margin: 25px 0 10px;
	color: ${(props) => props.theme.colors.selectedTheme.title};
	font-size: 14px;

	.max {
		cursor: pointer;
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		${numericValueCSS};
	}
`
export default StakeCard
