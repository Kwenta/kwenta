import { useConnectModal } from '@rainbow-me/rainbowkit'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { TableNoResults } from 'components/Table'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import { useAppSelector } from 'state/hooks'
import { selectWallet } from 'state/wallet/selectors'

export const ReferralTableNoResults = memo(() => {
	const { t } = useTranslation()
	const wallet = useAppSelector(selectWallet)
	const { switchToL2 } = useNetworkSwitcher()
	const { openConnectModal } = useConnectModal()
	const isL2 = useIsL2()

	return (
		<TableNoResults>
			{wallet ? (
				isL2 ? (
					t('referrals.table.no-results-table')
				) : (
					<>
						{t('referrals.table.switch-to-optimism-prompt')}
						<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
					</>
				)
			) : (
				<>
					{t('referrals.table.switch-to-optimism-prompt')}
					<div onClick={openConnectModal}>{t('common.wallet.connect-wallet')}</div>
				</>
			)}
		</TableNoResults>
	)
})
