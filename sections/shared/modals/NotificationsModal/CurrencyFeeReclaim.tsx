import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';

import CircleEllipsis from 'assets/svg/app/circle-ellipsis.svg';
import { CurrencyKey } from 'constants/currency';
import { FlexDivRowCentered, NoTextTransform } from 'styles/common';

type CurrencyFeeReclaimProps = {
	currencyKey: CurrencyKey;
	waitingPeriod: number;
};

export const CurrencyFeeReclaim: FC<CurrencyFeeReclaimProps> = ({ currencyKey }) => {
	const { t } = useTranslation();

	return (
		<Container>
			<FlexDivRowCentered>
				<span>
					<Trans
						t={t}
						i18nKey="common.currency.trade-into"
						values={{
							currencyKey,
						}}
						components={[<NoTextTransform />]}
					/>
				</span>
				<PendingIcon>
					<CircleEllipsis />
				</PendingIcon>
				<PriceAjustmentLabel>{t('common.currency.price-adjustment')}</PriceAjustmentLabel>
			</FlexDivRowCentered>
		</Container>
	);
};

const Container = styled(FlexDivRowCentered)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	padding: 12px 16px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
`;

const StatusIconMixin = `
  padding-left: 5px;
  display: inline-flex;
`;

const PendingIcon = styled.span`
	${StatusIconMixin};
	color: ${(props) => props.theme.colors.yellow};
`;

const PriceAjustmentLabel = styled.div`
	color: ${(props) => props.theme.colors.yellow};
`;

export default CurrencyFeeReclaim;
