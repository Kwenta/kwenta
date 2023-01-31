import CrossMarginIconDark from 'assets/svg/futures/cross-margin-icon-dark.svg';
import CrossMarginIconLight from 'assets/svg/futures/cross-margin-icon-light.svg';
import IsolatedMarginIconDark from 'assets/svg/futures/isolated-margin-icon-dark.svg';
import IsolatedMarginIconLight from 'assets/svg/futures/isolated-margin-icon-light.svg';
import { FuturesAccountType } from 'queries/futures/subgraph';
import { useAppSelector } from 'state/hooks';
import { selectCurrentTheme } from 'state/preferences/selectors';

type IconProps = {
	type: FuturesAccountType;
};

export default function FuturesIcon(props: IconProps) {
	const currentTheme = useAppSelector(selectCurrentTheme);

	const CrossMarginIcon = currentTheme === 'dark' ? CrossMarginIconDark : CrossMarginIconLight;
	const IsolatedMarginIcon =
		currentTheme === 'dark' ? IsolatedMarginIconDark : IsolatedMarginIconLight;
	return props.type === 'cross_margin' ? (
		<CrossMarginIcon {...props} />
	) : (
		<IsolatedMarginIcon {...props} />
	);
}

export function CrossMarginIcon() {
	const currentTheme = useAppSelector(selectCurrentTheme);

	const Icon = currentTheme === 'dark' ? CrossMarginIconDark : CrossMarginIconLight;
	return <Icon />;
}

export function IsolatedMarginIcon() {
	const currentTheme = useAppSelector(selectCurrentTheme);

	const Icon = currentTheme === 'dark' ? IsolatedMarginIconDark : IsolatedMarginIconLight;
	return <Icon />;
}
