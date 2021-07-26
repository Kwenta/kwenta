import React from 'react';
import styled from 'styled-components';

import { CurrencyKey } from 'constants/currency';
import { Data, DataRow, Subtitle } from '../common';
import { FlexDivRowCentered } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { formatCurrency } from 'utils/formatters/number';

type OverviewRowProps = {
	subtitle: string;
	data: string;
	currencyKey: CurrencyKey;
	sign: string;
};

const OverviewRow: React.FC<OverviewRowProps> = ({ subtitle, data, currencyKey, sign }) => (
	<StyledDataRow>
		<Subtitle style={{ textTransform: 'none' }}>{subtitle}</Subtitle>
		<FlexDivRowCentered>
			<StyledCurrencyIcon currencyKey={currencyKey} />
			<StyledData>
				{formatCurrency(currencyKey, data, {
					sign: sign,
				})}
			</StyledData>
		</FlexDivRowCentered>
	</StyledDataRow>
);

export default OverviewRow;

const StyledDataRow = styled(DataRow)`
	margin: 8px 0px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;

const StyledData = styled(Data)`
	margin-left: 4px;
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	width: 24px;
`;
