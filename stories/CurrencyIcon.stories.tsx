// import { ComponentStory } from '@storybook/react';

import { ComponentMeta } from '@storybook/react';

import CurrencyIcon from 'components/Currency/CurrencyIcon';

export default {
	title: 'Components/CurrencyIcon',
	component: CurrencyIcon,
	decorators: [
		(Story) => (
			<div style={{ width: 334 }}>
				<Story />
			</div>
		),
	],
} as ComponentMeta<typeof CurrencyIcon>;

export const All = () => {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
			<CurrencyIcon currencyKey="sUSD" />
			<CurrencyIcon currencyKey="sETH" />
			<CurrencyIcon currencyKey="sBTC" />
			<CurrencyIcon currencyKey="sLINK" />
			<CurrencyIcon currencyKey="sSOL" />
			<CurrencyIcon currencyKey="sAVAX" />
			<CurrencyIcon currencyKey="sMATIC" />
			<CurrencyIcon currencyKey="sEUR" />
			<CurrencyIcon currencyKey="sAAVE" />
			<CurrencyIcon currencyKey="sUNI" />
			<CurrencyIcon currencyKey="sINR" />
			<CurrencyIcon currencyKey="sJPY" />
			<CurrencyIcon currencyKey="sGBP" />
			<CurrencyIcon currencyKey="sCHF" />
			<CurrencyIcon currencyKey="sKRW" />
			<CurrencyIcon currencyKey="sADA" />
			<CurrencyIcon currencyKey="sAUD" />
			<CurrencyIcon currencyKey="sDOT" />
			<CurrencyIcon currencyKey="sETHBTC" />
			<CurrencyIcon currencyKey="sXMR" />
			<CurrencyIcon currencyKey="sOP" />
		</div>
	);
};
