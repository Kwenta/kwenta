import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';

import CircleEllipsis from 'assets/svg/app/circle-ellipsis.svg';
import CircleTick from 'assets/svg/app/circle-tick.svg';
import Link from 'assets/svg/app/link.svg';

import { CapitalizedText, ExternalLink, FlexDivRowCentered } from 'styles/common';
import { Order } from 'store/orders';
import Etherscan from 'containers/Etherscan';
import { formatCurrency } from 'utils/formatters/number';

type CurrencyExchangeProps = {
	order: Order;
};

export const CurrencyExchange: FC<CurrencyExchangeProps> = ({ order }) => {
	const { t } = useTranslation();
	// const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
	const { etherscanInstance } = Etherscan.useContainer();

	const isConfirmed = order.status === 'confirmed';
	const isPending = order.status === 'pending';

	return (
		<Container>
			<FlexDivRowCentered>
				<span>
					<Trans
						t={t}
						i18nKey="common.currency.currency-exchange"
						values={{
							orderType: t(`common.order-types.${order.orderType}`),
							quoteCurrencyAmount: formatCurrency(
								order.quoteCurrencyKey,
								order.quoteCurrencyAmount
							),
							quoteCurrencyKey: order.quoteCurrencyKey,
							baseCurrencyAmount: formatCurrency(order.baseCurrencyKey, order.baseCurrencyAmount),
							baseCurrencyKey: order.baseCurrencyKey,
						}}
						components={[<CapitalizedText />, <span />, <span />, <span />, <span />]}
					/>
				</span>
				{isConfirmed && (
					<ConfirmedIcon>
						<CircleTick />
					</ConfirmedIcon>
				)}
				{isPending && (
					<PendingIcon>
						<CircleEllipsis />
					</PendingIcon>
				)}
			</FlexDivRowCentered>
			{isConfirmed && etherscanInstance != null && (
				<StyledExternalLink href={etherscanInstance.txLink(order.hash)}>
					<Link />
				</StyledExternalLink>
			)}
		</Container>
	);
};

const Container = styled(FlexDivRowCentered)`
	color: ${(props) => props.theme.colors.white};
`;

const StatusIconMixin = `
    padding-left: 5px;
    display: inline-flex;
`;

const ConfirmedIcon = styled.span`
	${StatusIconMixin};
	color: ${(props) => props.theme.colors.green};
`;

const PendingIcon = styled.span`
	${StatusIconMixin};
	color: ${(props) => props.theme.colors.yellow};
`;

const StyledExternalLink = styled(ExternalLink)`
	display: inline-flex;
	color: ${(props) => props.theme.colors.blueberry};
	svg {
		width: 14px;
		height: 14px;
	}
`;

export default CurrencyExchange;
