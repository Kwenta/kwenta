import { ZERO_WEI } from '@kwenta/sdk/constants'
import { FuturesMarketAsset, FuturesOrderType, PositionSide } from '@kwenta/sdk/types'
import { getDisplayAsset, OrderNameByType, formatCurrency } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox'
import { FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { NumericValue } from 'components/Text'

import PositionType from '../PositionType'

type Props = {
	marketAsset: FuturesMarketAsset
	nativeSizeDelta: Wei
	leverageSide: PositionSide
	orderType: FuturesOrderType
	leverage: Wei
}

export default function TradeConfirmationSummary({
	marketAsset,
	nativeSizeDelta,
	leverageSide,
	orderType,
	leverage,
}: Props) {
	const { t } = useTranslation()

	return (
		<OrderSummaryLine>
			<InfoBoxContainer>
				<InfoBoxRow
					title={t('futures.market.user.position.modal.size')}
					nodeValue={
						<FlexDivRowCentered>
							<PositionType side={leverageSide} />
							<Spacer width={6} />
							<NumericValue type="span" value={nativeSizeDelta} colored>
								{formatCurrency(
									getDisplayAsset(marketAsset) || '',
									nativeSizeDelta.abs() ?? ZERO_WEI,
									{
										currencyKey: getDisplayAsset(marketAsset) ?? '',
									}
								)}
							</NumericValue>
						</FlexDivRowCentered>
					}
				/>

				<InfoBoxRow
					title={t('futures.market.user.position.modal.leverage')}
					textValue={leverage.toString(2) + 'X'}
				/>
				<Spacer height={2} />
				<InfoBoxRow
					title={t('futures.market.user.position.modal.order-type')}
					textValue={OrderNameByType[orderType]}
				/>
			</InfoBoxContainer>
		</OrderSummaryLine>
	)
}

const OrderSummaryLine = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	gap: 12px;
`
