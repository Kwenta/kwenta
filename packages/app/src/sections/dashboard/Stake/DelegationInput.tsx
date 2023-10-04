import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import Input from 'components/Input/Input'
import { FlexDivCol } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { approveOperator } from 'state/staking/actions'
import { selectIsApprovingOperator } from 'state/staking/selectors'
import { media } from 'styles/media'

import { StakingCard } from './card'

const DelegationInput = memo(() => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const isApprovingOperator = useAppSelector(selectIsApprovingOperator)
	const [delegatedAddress, setDelegatedAddress] = useState('')

	const onInputChange = useCallback((text: string) => {
		setDelegatedAddress(text.toLowerCase().trim())
	}, [])

	const handleApproveOperator = useCallback(
		(delegatedAddress: string) => {
			dispatch(approveOperator({ delegatedAddress, isApproval: true }))
			setDelegatedAddress('')
		},
		[dispatch]
	)

	return (
		<CardGridContainer>
			<FlexDivCol rowGap="5px">
				<StyledHeading variant="h4">{t('dashboard.stake.tabs.delegate.title')}</StyledHeading>
				<Body color="secondary">{t('dashboard.stake.tabs.delegate.copy')}</Body>
			</FlexDivCol>
			<FlexDivCol rowGap="10px" style={{ marginBottom: '10px' }}>
				<Body color="secondary">{t('dashboard.stake.tabs.delegate.address')}</Body>
				<InputBarContainer>
					<InputBar>
						<AddressInput
							autoFocus={true}
							value={delegatedAddress}
							onChange={(e) => onInputChange(e.target.value)}
							placeholder=""
						/>
					</InputBar>
				</InputBarContainer>
			</FlexDivCol>
			<Button
				fullWidth
				variant="flat"
				size="small"
				loading={isApprovingOperator}
				disabled={delegatedAddress.length !== 42}
				onClick={() => handleApproveOperator(delegatedAddress)}
			>
				{t('dashboard.stake.tabs.delegate.title')}
			</Button>
		</CardGridContainer>
	)
})

const AddressInput = styled(Input)`
	position: relative;
	height: 38px;
	border-radius: 8px;
	padding: 10px 0px;
	font-size: 14px;
	background: ${(props) => props.theme.colors.selectedTheme.input.background};
	font-family: ${(props) => props.theme.fonts.mono};
	border: none;
	${media.lessThan('sm')`
		font-size: 12px;
	`}
`

const InputBar = styled.div`
	width: 100%;
	overflow-x: auto;
	position: relative;
	display: flex;
	align-items: center;
	padding-left: 8px;
	background: ${(props) => props.theme.colors.selectedTheme.input.background};
	border-radius: 8px;
	border: ${(props) => props.theme.colors.selectedTheme.input.border};
`

const InputBarContainer = styled.div`
	display: flex;
	height: 100%;
	width: 100%;
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	row-gap: 25px;
`

export default DelegationInput
