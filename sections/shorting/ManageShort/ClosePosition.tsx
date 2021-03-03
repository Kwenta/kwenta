import { FC, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import { formatCurrency, toBigNumber } from 'utils/formatters/number';

import { GasPrices } from 'queries/network/useEthGasPriceQuery';
import { ShortPosition } from 'queries/collateral/useCollateralShortPositionQuery';

import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import GasPriceSummaryItem from 'sections/exchange/FooterCard/TradeSummaryCard/GasPriceSummaryItem';
import TotalTradePriceSummaryItem from 'sections/exchange/FooterCard/TradeSummaryCard/TotalTradePriceSummaryItem';

import Button from 'components/Button';

import {
	SummaryItems,
	SummaryItem,
	SummaryItemLabel,
	SummaryItemValue,
	MessageContainer,
} from 'sections/exchange/FooterCard/common';

import Card from 'components/Card';

type ManagePositionProps = {
	gasPrices: GasPrices | undefined;
	synthCollateralPriceRate: number;
	transactionFee: number | null;
	short: ShortPosition;
	handleSubmit: () => void;
	txError: string | null;
};

const ManagePosition: FC<ManagePositionProps> = ({
	gasPrices,
	synthCollateralPriceRate,
	transactionFee,
	short,
	handleSubmit,
	txError,
}) => {
	const { t } = useTranslation();
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);

	const totalTradePrice = useMemo(() => {
		return toBigNumber(synthCollateralPriceRate)
			.multipliedBy(short.collateralLockedAmount)
			.toString();
	}, [short.collateralLockedAmount, synthCollateralPriceRate]);

	const closeTabSummaryItems = (
		<SummaryItems attached={false}>
			<GasPriceSummaryItem gasPrices={gasPrices} transactionFee={transactionFee} />
			<SummaryItem>
				<SummaryItemLabel>
					{t('shorting.history.manage-short.sections.close-position.total-to-replay-label')}
				</SummaryItemLabel>
				<SummaryItemValue>
					{formatCurrency(short.synthBorrowed, short.synthBorrowedAmount, {
						currencyKey: short.synthBorrowed,
					})}
				</SummaryItemValue>
			</SummaryItem>
			<TotalTradePriceSummaryItem totalTradePrice={totalTradePrice} />
		</SummaryItems>
	);

	return (
		<>
			<MobileOrTabletView>
				<MobileCard className="trade-summary-card">
					<Card.Body>{closeTabSummaryItems}</Card.Body>
				</MobileCard>
			</MobileOrTabletView>
			<MessageContainer attached={false} className="footer-card">
				<DesktopOnlyView>{closeTabSummaryItems}</DesktopOnlyView>
				<Button variant="danger" isRounded={true} onClick={handleSubmit} size="lg">
					{t('shorting.history.manage-short.sections.close-position.close-button-label')}
				</Button>
			</MessageContainer>
			{txConfirmationModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxConfirmationModalOpen(false)}
					txError={txError}
					attemptRetry={handleSubmit}
					baseCurrencyAmount={`${short.collateralLockedAmount}`}
					quoteCurrencyAmount={`${short.synthBorrowedAmount}`}
					feeAmountInBaseCurrency={null}
					baseCurrencyKey={short.collateralLocked}
					quoteCurrencyKey={short.synthBorrowed}
					totalTradePrice={totalTradePrice}
					txProvider="synthetix"
					baseCurrencyLabel={t(
						`shorting.history.manage-short.sections.close-tab.tx-confirm.base-currency-label`
					)}
					quoteCurrencyLabel={t(
						`shorting.history.manage-short.sections.close-tab.tx-confirm.quote-currency-label`
					)}
				/>
			)}
		</>
	);
};

export const MobileCard = styled(Card)`
	margin: 0 auto 86px auto;
`;

export default ManagePosition;
