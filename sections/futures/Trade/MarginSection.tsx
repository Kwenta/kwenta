import { FC } from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import { formatCurrency } from 'utils/formatters/number';
import { SYNTHS_MAP } from 'constants/currency';
import { useTranslation } from 'react-i18next';

import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import Card from 'components/Card';
import Button from 'components/Button';

type MarginSectionProps = {
	availableMargin: BigNumber;
	sUSDBalance: BigNumber;
	onDeposit: () => void;
};

const MarginSection: FC<MarginSectionProps> = ({ availableMargin, sUSDBalance, onDeposit }) => {
	const { t } = useTranslation();
	return (
		<FlexDivCol>
			<Divider />
			<StyledCard>
				<FlexDivRowCentered>
					<FlexDivCol>
						<AvailableMargin>{t('futures.market.trade.margin.available-margin')}</AvailableMargin>
						<MarginBalance>
							{formatCurrency(SYNTHS_MAP.sUSD, availableMargin, { sign: '$' })}
						</MarginBalance>
					</FlexDivCol>
					<Button variant="primary" isRounded size="sm">
						{t('futures.market.trade.button.deposit')}
					</Button>
				</FlexDivRowCentered>
			</StyledCard>
			<FlexDivRow>
				<AvailableBalanceLabel>
					{t('futures.market.trade.margin.available-balance')}
				</AvailableBalanceLabel>
				<AvailableBalanceValue>
					{formatCurrency(SYNTHS_MAP.sUSD, sUSDBalance, { sign: '$' })}
				</AvailableBalanceValue>
			</FlexDivRow>
		</FlexDivCol>
	);
};

const Divider = styled.hr`
	border: 1px solid ${(props) => props.theme.colors.vampire};
	margin: 24px -32px;
`;

const StyledCard = styled(Card)`
	background: ${(props) => props.theme.colors.navy};
	padding: 20px;
	margin-bottom: 24px;
`;

const AvailableMargin = styled.div`
	color: ${(props) => props.theme.colors.silver};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	text-transform: capitalize;
`;

const MarginBalance = styled.div`
	margin-top: 4px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
`;

const AvailableBalanceLabel = styled.div`
	color: ${(props) => props.theme.colors.blueberry};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
`;

const AvailableBalanceValue = styled.div`
	color: ${(props) => props.theme.colors.blueberry};
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	text-transform: capitalize;
`;

export default MarginSection;
