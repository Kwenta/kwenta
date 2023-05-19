import { Checkbox } from 'components/Checkbox';

type Props = {
	checked: boolean;
	onChangeChecked: (checked: boolean) => void;
};

export default function ConfirmSlippage({ checked, onChangeChecked }: Props) {
	return (
		<Checkbox
			id="pp-override"
			label="This trade incurs high slippage, proceed anyway?"
			checkSide="right"
			checked={checked}
			onChange={() => onChangeChecked(!checked)}
		/>
	);
}
