import Wei from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox';
import { FlexDivRowCentered } from 'components/layout/flex';
import Spacer from 'components/Spacer';
import { NumericValue } from 'components/Text';
import { NumberBody } from 'components/Text/NumericValue';
import { FuturesMarketAsset, FuturesOrderType, PositionSide } from 'sdk/types/futures';
import { getDisplayAsset, OrderNameByType } from 'sdk/utils/futures';
import { formatCurrency, zeroBN } from 'sdk/utils/number';

import PositionType from '../PositionType';

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
						<FlexDivRowCentered>
							<PositionType side={leverageSide} />
							<Spacer width={6} />
							<NumericValue value={nativeSizeDelta} colored>
								{formatCurrency(
									getDisplayAsset(marketAsset) || '',
									nativeSizeDelta.abs() ?? zeroBN,
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
					value={<NumberBody>{leverage.toString(2)}X</NumberBody>}
				/>
				<Spacer height={2} />
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
