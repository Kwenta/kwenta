import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useTranslation, Trans } from 'react-i18next';

import ROUTES from 'constants/routes';
import { SYNTHS_MAP } from 'constants/currency';

import Button from 'components/Button';

import media from 'styles/media';
import { GridDivCentered, NoTextTransform } from 'styles/common';

import SynthBalanceRow, { SynthBalanceRowProps } from './SynthBalanceRow';
import { SynthBalance } from '@synthetixio/queries';

type SynthBalancesProps = Omit<SynthBalanceRowProps, 'synth'> & {
	balances: SynthBalance[];
};

const { sUSD } = SYNTHS_MAP;

const SynthBalances: FC<SynthBalancesProps> = ({ exchangeRates, balances, totalUSDBalance }) => {
	const { t } = useTranslation();

	if (balances.length === 0) {
		return (
			<NoBalancesContainer>
				<Message>
					<Trans
						t={t}
						i18nKey="exchange.onboard.message"
						values={{ currencyKey: sUSD }}
						components={[<NoTextTransform />]}
					/>
				</Message>
				<Link href={ROUTES.Dashboard.Convert}>
					<Button size="lg" variant="primary" isRounded={true}>
						<Trans
							t={t}
							i18nKey="common.currency.buy-currency"
							values={{ currencyKey: sUSD }}
							components={[<NoTextTransform />]}
						/>
					</Button>
				</Link>
			</NoBalancesContainer>
		);
	}

	return (
		<>
			{balances.map((synth: SynthBalance) => (
				<SynthBalanceRow
					key={synth.currencyKey}
					synth={synth}
					totalUSDBalance={totalUSDBalance}
					exchangeRates={exchangeRates}
				/>
			))}
		</>
	);
};

export const NoBalancesContainer = styled(GridDivCentered)`
	width: 100%;
	border-radius: 4px;
	grid-template-columns: 1fr auto;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 16px 32px;
	margin: 0 auto;
	${media.lessThan('md')`
		justify-items: center;
		grid-template-columns: unset;
		grid-gap: 30px;
	`}
`;

export const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
`;

export default SynthBalances;
