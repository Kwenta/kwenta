import React, { FC } from 'react';

import { CurrencyKey, CURRENCY_KEY_TO_ICON_MAP } from 'constants/currency';

type CurrencyIconProps = {
	currencyKey: CurrencyKey;
	type?: 'synth' | 'asset';
	className?: string;
	width?: string;
	height?: string;
};

export const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, type = 'synth', ...rest }) => {
	const currencyIcon = CURRENCY_KEY_TO_ICON_MAP[currencyKey];

	if (!currencyIcon) {
		return null;
	}

	const { SynthIcon, AssetIcon } = currencyIcon;

	const Icon = type === 'synth' && SynthIcon ? SynthIcon : AssetIcon;

	// @ts-ignore
	return <Icon width="24" height="24" {...rest} />;
};

export default CurrencyIcon;
