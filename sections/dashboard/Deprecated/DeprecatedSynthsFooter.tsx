import useSynthetixQueries from '@synthetixio/queries';
import Wei from '@synthetixio/wei';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import { Synths } from 'constants/currency';
import {
	SummaryItem,
	SummaryItemValue,
	SummaryItemLabel,
} from 'sections/exchange/FooterCard/common';
import GasPriceSummaryItem from 'sections/exchange/FooterCard/TradeSummaryCard/GasPriceSummaryItem';
import media from 'styles/media';
import { formatCurrency } from 'utils/formatters/number';

type DeprecatedSynthsFooterProps = {
	totalUSDBalance: Wei;
	onSubmit: () => void;
	isRedeeming: boolean;
	transactionFee: number | null;
};

const DeprecatedSynthsFooter: FC<DeprecatedSynthsFooterProps> = ({
	totalUSDBalance,
	onSubmit,
	isRedeeming,
	transactionFee,
}) => {
	const { t } = useTranslation();
	const { useEthGasPriceQuery } = useSynthetixQueries();

	const ethGasPriceQuery = useEthGasPriceQuery();
	const gasPrices = useMemo(() => ethGasPriceQuery?.data ?? undefined, [ethGasPriceQuery.data]);

	return (
		<>
			<Container>
				<div></div>
				<Col>
					<GasPriceSummaryItem {...{ gasPrices, transactionFee }} />
				</Col>
				<Col>
					<SummaryItem>
						<SummaryItemLabel>{t('dashboard.deprecated.susd-total')}</SummaryItemLabel>
						<SummaryItemValue>{formatCurrency(Synths.sUSD, totalUSDBalance)}</SummaryItemValue>
					</SummaryItem>
				</Col>
				<div>
					<Button
						variant="primary"
						isRounded={true}
						size="lg"
						disabled={isRedeeming}
						onClick={onSubmit}
					>
						{t(`dashboard.deprecated.button.${isRedeeming ? 'redeeming' : 'default'}`)}
					</Button>
				</div>
			</Container>
		</>
	);
};

const Container = styled.div`
	background: ${(props) => props.theme.colors.elderberry};
	padding: 12px 22px 12px 16px;
	margin-top: 2px;
	display: grid;
	grid-gap: 20px;
	justify-content: space-between;
	align-items: center;
	grid-template-columns: repeat(4, minmax(80px, 150px));
	${media.lessThan('md')`
		grid-template-columns: auto auto;
	`}
`;

const Col = styled.div`
	justify-self: flex-end;
	text-align: right;
`;

export default DeprecatedSynthsFooter;
