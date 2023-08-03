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
	selectTotalAvailableMargin,
	selectLockedMarginInMarkets,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import PencilButton from '../../../components/Button/PencilButton'
import SmartMarginInfoBox from '../TradeSmartMargin/SmartMarginInfoBox'

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
	const accountMargin = useAppSelector(selectTotalAvailableMargin)
	const lockedMargin = useAppSelector(selectLockedMarginInMarkets)
	const openModal = useAppSelector(selectShowModal)

	const [expanded, setExpanded] = useState(false)

	const { isMobile, size } = useMemo(() => {
		const isMobile = deviceType === 'mobile'
		const size: 'small' | 'medium' = isMobile ? 'small' : 'medium'
		return { isMobile, size }
	}, [deviceType])

	const isDepositRequired = useMemo(() => {
		return accountMargin.lt(MIN_MARGIN_AMOUNT) && lockedMargin.eq(0)
	}, [accountMargin, lockedMargin])

	const onClickContainer = useCallback(() => {
		setExpanded(!expanded)
	}, [expanded])

	return (
		<Container mobile={isMobile}>
			<BalanceContainer clickable onClick={onClickContainer}>
				{isDepositRequired ? (
					<DepositContainer>
						<FlexDivCol>
							<FlexDivRow columnGap="5px" justifyContent="flex-start">
								<Body size={size} color="secondary">
									{accountMargin.lt(0.01) ? (
										t('futures.market.trade.trade-balance.no-available-margin')
									) : (
										<Trans
											i18nKey="futures.market.trade.trade-balance.only-available-margin"
											values={{ balance: formatDollars(accountMargin) }}
										/>
									)}
								</Body>
								<StyledCaretDownIcon $flip={expanded} />
							</FlexDivRow>
							<Body size={size} color="preview">
								{t('futures.market.trade.trade-balance.min-margin')}
							</Body>
						</FlexDivCol>
						{accountMargin.lt(0.01) ? (
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
								modalType="futures_deposit_withdraw_smart_margin"
								onPillClick={onClickContainer}
								expanded={expanded}
							/>
						)}
					</DepositContainer>
				) : (
					<>
						{isMobile ? (
							<DepositContainer>
								<FlexDivRow style={{ width: '170px' }}>
									<Body size={'medium'} color="secondary">
										{t('futures.market.trade.trade-balance.available-margin')}:
									</Body>
									<NumericValue size={'medium'} weight="bold">
										{formatDollars(accountMargin)}
									</NumericValue>
								</FlexDivRow>
								{lockedMargin.gt(0) && (
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
								<BrdigeAndWithdrawButton
									modalType={'futures_deposit_withdraw_smart_margin'}
									onPillClick={onClickContainer}
									expanded={expanded}
								/>
							</DepositContainer>
						) : (
							<DepositContainer>
								<FlexDivCol>
									<Body size={'medium'} color="secondary">
										{t('futures.market.trade.trade-balance.available-margin')}
									</Body>
									<NumericValue size={'large'} weight="bold">
										{formatDollars(accountMargin)}
									</NumericValue>
								</FlexDivCol>
								{lockedMargin.gt(0) && (
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
								<BrdigeAndWithdrawButton
									modalType={'futures_deposit_withdraw_smart_margin'}
									onPillClick={onClickContainer}
									expanded={expanded}
								/>
							</DepositContainer>
						)}
					</>
				)}
			</BalanceContainer>

			{expanded && <DetailsContainer>{<SmartMarginInfoBox />}</DetailsContainer>}
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
