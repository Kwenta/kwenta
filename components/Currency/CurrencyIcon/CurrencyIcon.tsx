import React, { FC } from 'react';

import { CurrencyKey, currencyKeyToIconMap } from 'constants/currency';

type CurrencyIconProps = {
	currencyKey: CurrencyKey;
	type?: 'synth' | 'asset';
};

export const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, type = 'synth', ...rest }) => {
	const currencyIcon = currencyKeyToIconMap[currencyKey];

	if (!currencyIcon) {
		return null;
	}

	const { SynthIcon, AssetIcon } = currencyIcon;

	const Icon = type === 'synth' && SynthIcon ? SynthIcon : AssetIcon;

	return <Icon width="24" height="24" {...rest} />;
};

export default CurrencyIcon;
