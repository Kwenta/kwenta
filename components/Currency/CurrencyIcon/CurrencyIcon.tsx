import React, { FC } from 'react';

import { CurrencyKey, currencyKeyToIconMap } from 'constants/currency';

type CurrencyIconProps = {
	currencyKey: CurrencyKey;
	type?: 'synth' | 'asset';
	className?: string;
};

export const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, type = 'synth', ...rest }) => {
	const currencyIcon = currencyKeyToIconMap[currencyKey];

	if (!currencyIcon) {
		return null;
	}

	const { SynthIcon, AssetIcon } = currencyIcon;

	const Icon = type === 'synth' && SynthIcon ? SynthIcon : AssetIcon;

	// @ts-ignore
	return <Icon width="24" height="24" {...rest} />;
};

export default CurrencyIcon;
