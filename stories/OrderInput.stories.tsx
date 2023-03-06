import { useState } from 'react';

import SwitchAssetArrows from 'assets/svg/futures/switch-arrows.svg';
import NumericInput from 'components/Input/NumericInput';
import { InputButton } from 'sections/futures/OrderSizing/OrderSizing';

const DenominationToggle = () => {
	const [asset, setAsset] = useState<'sUSD' | 'ETH'>('sUSD');

	const toggle = () => {
		setAsset((s) => (s === 'sUSD' ? 'ETH' : 'sUSD'));
	};

	return (
		<InputButton onClick={toggle}>
			{asset}
			<span>{<SwitchAssetArrows />}</span>
		</InputButton>
	);
};

export const Default = () => {
	const [value, setValue] = useState('');
	<div style={{ width: 334 }}>
		<NumericInput value={value} onChange={(_, v) => setValue(v)} right={<DenominationToggle />} />
	</div>;
};
