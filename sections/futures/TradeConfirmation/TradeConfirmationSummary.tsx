import Wei from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox';
import { NumericValue } from 'components/Text';
import { NumberBody } from 'components/Text/NumericValue';
import { FuturesMarketAsset, FuturesOrderType, PositionSide } from 'sdk/types/futures';
import { getDisplayAsset, OrderNameByType } from 'sdk/utils/futures';
import { formatCurrency, zeroBN } from 'utils/formatters/number';

type Props = {
	marketAsset: FuturesMarketAsset;
	nativeSizeDelta: Wei;
	leverageSide: PositionSide;
	orderType: FuturesOrderType;
	leverage: Wei;
};

export default function TradeConfirmationSummary({
	marketAsset,
	nativeSizeDelta,
	leverageSide,
	orderType,
	leverage,
}: Props) {
	const { t } = useTranslation();

	return (
		<OrderSummaryLine>
			<InfoBoxContainer>
				<InfoBoxRow
					title={t('futures.market.user.position.modal.size')}
					value={
						<NumericValue value={nativeSizeDelta} colored>
							{formatCurrency(getDisplayAsset(marketAsset) || '', nativeSizeDelta.abs() ?? zeroBN, {
								currencyKey: getDisplayAsset(marketAsset) ?? '',
							})}
						</NumericValue>
					}
				/>
				<InfoBoxRow
					title={t('futures.market.user.position.modal.side')}
					value={
						<NumberBody
							color={leverageSide === 'short' ? 'negative' : 'positive'}
							className={leverageSide}
						>
							{leverageSide.toUpperCase()}
						</NumberBody>
					}
				/>
			</InfoBoxContainer>
			<InfoBoxContainer>
				<InfoBoxRow
					title={t('futures.market.user.position.modal.leverage')}
					value={<NumberBody>{leverage.toString(2)} X</NumberBody>}
				/>
				<InfoBoxRow
					title={t('futures.market.user.position.modal.order-type')}
					value={<NumberBody>{OrderNameByType[orderType]}</NumberBody>}
				/>
			</InfoBoxContainer>
		</OrderSummaryLine>
	);
}

const OrderSummaryLine = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	gap: 12px;
`;
