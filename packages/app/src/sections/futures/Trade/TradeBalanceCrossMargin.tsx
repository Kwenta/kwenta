import { MIN_MARGIN_AMOUNT } from '@kwenta/sdk/constants'
import { FuturesMarginType } from '@kwenta/sdk/types'
import { formatDollars } from '@kwenta/sdk/utils'
import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { StyledCaretDownIcon } from 'components/Select'
import { Body, NumericValue } from 'components/Text'
import useWindowSize from 'hooks/useWindowSize'
import { setOpenModal } from 'state/app/reducer'
import { selectSNXUSDBalance } from 'state/balances/selectors'
import { selectFuturesType } from 'state/futures/common/selectors'
import {
	selectCrossMarginAccount,
	selectCrossMarginAvailableMargin,
	selectWithdrawableCrossMargin,
} from 'state/futures/crossMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import PencilButton from '../../../components/Button/PencilButton'

type TradeBalanceProps = {
	isMobile?: boolean
}

const TradeBalanceCrossMargin: React.FC<TradeBalanceProps> = memo(({ isMobile = false }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { deviceType } = useWindowSize()

	const accountType = useAppSelector(selectFuturesType)
	const availableCrossMargin = useAppSelector(selectCrossMarginAvailableMargin)
	const withdrawable = useAppSelector(selectWithdrawableCrossMargin)
	const crossMarginAccount = useAppSelector(selectCrossMarginAccount)
	const walletBal = useAppSelector(selectSNXUSDBalance)

	const [expanded, setExpanded] = useState(false)

	const isDepositRequired = useMemo(() => {
		return availableCrossMargin.lt(MIN_MARGIN_AMOUNT)
	}, [availableCrossMargin])

	const onClickContainer = () => {
		if (accountType === FuturesMarginType.CROSS_MARGIN) return
		setExpanded(!expanded)
	}

	const content = useMemo(() => {
		if (!crossMarginAccount) {
			return (
				<Button
					data-testid="create-cross-margin-account-button"
					variant="yellow"
					onClick={() => dispatch(setOpenModal('futures_cross_margin_onboard'))}
				>
					Create a Cross Margin Account
				</Button>
			)
		}
		if (isDepositRequired) {
			return (
				<DepositContainer>
					<FlexDivCol>
						<FlexDivRow columnGap="5px" justifyContent="flex-start">
							<Body size={isMobile ? 'small' : 'medium'} color="secondary">
								{t('futures.market.trade.trade-balance.no-available-margin')}
							</Body>
							<StyledCaretDownIcon $flip={expanded} />
						</FlexDivRow>
						<Body size={isMobile ? 'small' : 'medium'} color="preview">
							{t('futures.market.trade.trade-balance.min-margin')}
						</Body>
					</FlexDivCol>
					<Button
						variant="yellow"
						size="xsmall"
						textTransform="none"
						onClick={() =>
							// TODO: Open socket when min balance not met
							dispatch(
								setOpenModal(
									walletBal.gt(MIN_MARGIN_AMOUNT)
										? 'futures_deposit_withdraw_cross_margin'
										: 'futures_deposit_withdraw_cross_margin'
								)
							)
						}
					>
						{walletBal.gt(MIN_MARGIN_AMOUNT)
							? t('futures.market.trade.trade-balance.deposit')
							: t('header.balance.get-susd')}
					</Button>
				</DepositContainer>
			)
		}

		if (isMobile) {
			return (
				<FlexDivCol rowGap="5px">
					<FlexDivRow style={{ width: '200px' }}>
						<Body size={'medium'} color="secondary">
							{t('futures.market.trade.trade-balance.available-margin')}:
						</Body>
						<NumericValue size={'medium'} weight="bold">
							{formatDollars(availableCrossMargin)}
						</NumericValue>
					</FlexDivRow>
				</FlexDivCol>
			)
		}

		return (
			<FlexDivRow columnGap="10px" justifyContent="flex-start">
				<FlexDivCol>
					<Body size={'medium'} color="secondary">
						{t('futures.market.trade.trade-balance.available-margin')}
					</Body>
					<NumericValue size={'large'} weight="bold">
						{formatDollars(availableCrossMargin)}
					</NumericValue>
				</FlexDivCol>
			</FlexDivRow>
		)
	}, [
		t,
		crossMarginAccount,
		isDepositRequired,
		availableCrossMargin,
		isMobile,
		expanded,
		walletBal,
		dispatch,
	])

	return (
		<Container mobile={deviceType === 'mobile'}>
			<BalanceContainer clickable onClick={onClickContainer}>
				{content}

				{withdrawable.gt(0) && (
					<FlexDivRowCentered columnGap="15px">
						<PencilButton
							width={16}
							height={16}
							onClick={(e) => {
								e.stopPropagation()
								dispatch(setOpenModal('futures_deposit_withdraw_cross_margin'))
							}}
						/>
					</FlexDivRowCentered>
				)}
			</BalanceContainer>
		</Container>
	)
})

const DepositContainer = styled(FlexDivRowCentered)`
	width: 100%;
`

const Container = styled.div<{ mobile?: boolean }>`
	width: 100%;
	padding: 13px 15px;
	border-bottom: ${(props) => (props.mobile ? props.theme.colors.selectedTheme.border : 0)};
`

const BalanceContainer = styled(FlexDivRowCentered)<{ clickable: boolean }>`
	cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
	width: 100%;
`

export default TradeBalanceCrossMargin
