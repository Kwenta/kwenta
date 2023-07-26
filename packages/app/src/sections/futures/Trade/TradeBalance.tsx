import { MIN_MARGIN_AMOUNT } from '@kwenta/sdk/constants'
import { formatDollars } from '@kwenta/sdk/utils'
import { FC, memo, useCallback, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import Pill from 'components/Pill'
import { StyledCaretDownIcon } from 'components/Select'
import { Body, NumericValue } from 'components/Text'
import Tooltip from 'components/Tooltip/Tooltip'
import useWindowSize from 'hooks/useWindowSize'
import { setOpenModal } from 'state/app/reducer'
import { selectShowModal } from 'state/app/selectors'
import { ModalType } from 'state/app/types'
import {
	selectAvailableMargin,
	selectFuturesType,
	selectIdleMargin,
	selectLockedMarginInMarkets,
	selectWithdrawableMargin,
} from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import PencilButton from '../../../components/Button/PencilButton'
import CrossMarginInfoBox from '../TradeCrossMargin/CrossMarginInfoBox'

import SmartMarginOnboardModal from './SmartMarginOnboardModal'

type BrdigeAndWithdrawButtonProps = {
	modalType: ModalType
	onPillClick: () => void
	expanded: boolean
}

const BrdigeAndWithdrawButton: FC<BrdigeAndWithdrawButtonProps> = ({
	modalType,
	onPillClick,
	expanded,
}) => {
	const dispatch = useAppDispatch()

	return (
		<FlexDivRowCentered columnGap="15px">
			<PencilButton
				width={16}
				height={16}
				onClick={(e) => {
					e.stopPropagation()
					dispatch(setOpenModal(modalType))
				}}
			/>
			<Pill roundedCorner={false} onClick={onPillClick}>
				<StyledCaretDownIcon $flip={expanded} style={{ marginTop: '1.5px' }} />
			</Pill>
		</FlexDivRowCentered>
	)
}

const TradeBalance = memo(() => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const { deviceType } = useWindowSize()
	const accountType = useAppSelector(selectFuturesType)
	const availableCrossMargin = useAppSelector(selectIdleMargin)
	const lockedMargin = useAppSelector(selectLockedMarginInMarkets)
	const availableIsolatedMargin = useAppSelector(selectAvailableMargin)
	const withdrawable = useAppSelector(selectWithdrawableMargin)
	const openModal = useAppSelector(selectShowModal)

	const [expanded, setExpanded] = useState(false)

	const { isMobile, size } = useMemo(() => {
		const isMobile = deviceType === 'mobile'
		const size: 'small' | 'medium' = isMobile ? 'small' : 'medium'
		return { isMobile, size }
	}, [deviceType])

	const isCrossMarginAccount = useMemo(() => accountType === 'cross_margin', [accountType])

	const isDepositRequired = useMemo(() => {
		return availableCrossMargin.lt(MIN_MARGIN_AMOUNT) && withdrawable.eq(0) && lockedMargin.eq(0)
	}, [availableCrossMargin, lockedMargin, withdrawable])

	const onClickContainer = useCallback(() => {
		if (!isCrossMarginAccount) return
		setExpanded(!expanded)
	}, [expanded, isCrossMarginAccount])

	return (
		<Container mobile={isMobile}>
			<BalanceContainer clickable={isCrossMarginAccount} onClick={onClickContainer}>
				{isCrossMarginAccount && isDepositRequired ? (
					<DepositContainer>
						<FlexDivCol>
							<FlexDivRow columnGap="5px" justifyContent="flex-start">
								<Body size={size} color="secondary">
									{availableCrossMargin.lt(0.01) ? (
										t('futures.market.trade.trade-balance.no-available-margin')
									) : (
										<Trans
											i18nKey="futures.market.trade.trade-balance.only-available-margin"
											values={{ balance: formatDollars(availableCrossMargin) }}
										/>
									)}
								</Body>
								<StyledCaretDownIcon $flip={expanded} />
							</FlexDivRow>
							<Body size={size} color="preview">
								{t('futures.market.trade.trade-balance.min-margin')}
							</Body>
						</FlexDivCol>
						{availableCrossMargin.lt(0.01) ? (
							<Button
								variant="yellow"
								size="xsmall"
								textTransform="none"
								onClick={() => dispatch(setOpenModal('futures_smart_margin_socket'))}
							>
								{t('header.balance.get-susd')}
							</Button>
						) : (
							<BrdigeAndWithdrawButton
								modalType="futures_cross_withdraw"
								onPillClick={onClickContainer}
								expanded={expanded}
							/>
						)}
					</DepositContainer>
				) : (
					<>
						{isMobile ? (
							<FlexDivCol rowGap="5px">
								<FlexDivRow style={{ width: '170px' }}>
									<Body size={'medium'} color="secondary">
										{t('futures.market.trade.trade-balance.available-margin')}:
									</Body>
									<NumericValue size={'medium'} weight="bold">
										{isCrossMarginAccount
											? formatDollars(availableCrossMargin)
											: formatDollars(availableIsolatedMargin)}
									</NumericValue>
								</FlexDivRow>
								{isCrossMarginAccount && lockedMargin.gt(0) && (
									<FlexDivRow style={{ width: '170px' }}>
										<Body size={'medium'} color="secondary">
											{t('futures.market.trade.trade-balance.locked-margin')}:
										</Body>
										<FlexDivRowCentered columnGap="5px">
											<NumericValue size={'medium'} weight="bold" color="secondary">
												{formatDollars(lockedMargin)}
											</NumericValue>
											<Tooltip
												position="fixed"
												content={t('futures.market.trade.trade-balance.tooltip')}
												width="200px !important"
											>
												<HelpIcon />
											</Tooltip>
										</FlexDivRowCentered>
									</FlexDivRow>
								)}
							</FlexDivCol>
						) : (
							<FlexDivRow columnGap="10px" justifyContent="flex-start">
								<FlexDivCol>
									<Body size={'medium'} color="secondary">
										{t('futures.market.trade.trade-balance.available-margin')}
									</Body>
									<NumericValue size={'large'} weight="bold">
										{isCrossMarginAccount
											? formatDollars(availableCrossMargin)
											: formatDollars(availableIsolatedMargin)}
									</NumericValue>
								</FlexDivCol>
								{isCrossMarginAccount && lockedMargin.gt(0) && (
									<StyledFlexDivCol>
										<FlexDivRowCentered columnGap="5px">
											<Body size={'medium'} color="secondary">
												{t('futures.market.trade.trade-balance.locked-margin')}
											</Body>
											<Tooltip
												position="fixed"
												content={t('futures.market.trade.trade-balance.tooltip')}
												width="280px"
											>
												<HelpIcon />
											</Tooltip>
										</FlexDivRowCentered>
										<NumericValue size={'large'} weight="bold" color="secondary">
											{formatDollars(lockedMargin)}
										</NumericValue>
									</StyledFlexDivCol>
								)}
							</FlexDivRow>
						)}
					</>
				)}

				{(!isCrossMarginAccount || withdrawable.gt(0) || !isDepositRequired) && (
					<BrdigeAndWithdrawButton
						modalType={
							isCrossMarginAccount ? 'futures_cross_withdraw' : 'futures_isolated_transfer'
						}
						onPillClick={onClickContainer}
						expanded={expanded}
					/>
				)}
			</BalanceContainer>

			{expanded && isCrossMarginAccount && (
				<DetailsContainer>{<CrossMarginInfoBox />}</DetailsContainer>
			)}
			{openModal === 'futures_smart_margin_socket' && (
				<SmartMarginOnboardModal
					onDismiss={() => {
						dispatch(setOpenModal(null))
					}}
				/>
			)}
		</Container>
	)
})

const DepositContainer = styled(FlexDivRowCentered)`
	width: 100%;
`

const StyledFlexDivCol = styled(FlexDivCol)`
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
	padding-left: 10px;
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

const DetailsContainer = styled.div`
	margin-top: 15px;
`

export default TradeBalance
