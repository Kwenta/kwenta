import { SWAP_DEPOSIT_TOKENS } from '@kwenta/sdk/constants'

import Select from 'components/Select'

const SwapDepositTokenSelector = () => {
	return (
		<div>
			<Select options={SWAP_DEPOSIT_TOKENS.map((token) => ({ label: token, value: token }))} />
		</div>
	)
}

export default SwapDepositTokenSelector
