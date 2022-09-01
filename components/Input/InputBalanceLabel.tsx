import Wei from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivRowCentered } from 'styles/common';
import { formatCurrency } from 'utils/formatters/number';

type Props = {
	balance: Wei;
	currencyKey: string;
};

export default function InputBalanceLabel({ balance, currencyKey }: Props) {
	const { t } = useTranslation();

	const key = currencyKey.toLowerCase();
	const isUsd = key === 'susd' || key === 'usd';
	return (
		<BalanceContainer>
			<BalanceText>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
			<BalanceText>
				<span>
					{formatCurrency(currencyKey, balance, {
						sign: isUsd ? '$' : '',
						maxDecimals: isUsd ? 2 : undefined,
					})}
				</span>{' '}
				{currencyKey}
			</BalanceText>
		</BalanceContainer>
	);
}

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	p {
		margin: 0;
	}
`;

export const BalanceText = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`;
