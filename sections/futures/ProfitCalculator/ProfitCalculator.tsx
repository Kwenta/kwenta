import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
// import { CellProps } from 'react-table';
// import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
// import { wei } from '@synthetixio/wei';

// // import BlockExplorer from 'containers/BlockExplorer';
// // import { ExternalLink, FlexDivCentered, GridDivCenteredRow } from 'styles/common';

// import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
// import LinkIcon from 'assets/svg/app/link.svg';
// import { TradeStatus, PositionSide } from '../types';
// import { Synths } from 'constants/currency';
// import CurrencyIcon from 'components/Currency/CurrencyIcon';

// import PendingIcon from 'assets/svg/app/circle-ellipsis.svg';
// import FailureIcon from 'assets/svg/app/circle-error.svg';
// import SuccessIcon from 'assets/svg/app/circle-tick.svg';
// import { formatCurrency, formatCryptoCurrency, formatNumber } from 'utils/formatters/number';
// import { PositionHistory } from 'queries/futures/types';

type ProfitCalculatorProps = {
	// history: PositionHistory[] | null;
	// isLoading: boolean;
	// isLoaded: boolean;
};

const ProfitCalculator: React.FC<ProfitCalculatorProps> = () => {
	const { t } = useTranslation();

	return (
		<Modal>
			<></>
		</Modal>
	);
};

export default ProfitCalculator;

const Modal = styled.div`
	// TODO: finish styling
	display: flex;
`;
