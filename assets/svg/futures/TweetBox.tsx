import { FC } from 'react';

type TweetBoxProps = {
	address: string;
};

const TweetBox: FC<TweetBoxProps> = ({ address }) => {
	return (
		<svg
			fill="none"
			height="251"
			viewBox="0 0 661 251"
			width="661"
			xmlns="http://www.w3.org/2000/svg"
		>
			<linearGradient id="a">
				<stop offset="0" stopColor="#be9461" />
				<stop offset="1" stopColor="#9c6c3c" />
			</linearGradient>
			<linearGradient
				id="b"
				gradientUnits="userSpaceOnUse"
				x1="330.5"
				x2="330.5"
				xlinkHref="#a"
				y1="0"
				y2="251"
			/>
			<linearGradient
				id="c"
				gradientUnits="userSpaceOnUse"
				x1="330.5"
				x2="330.5"
				xlinkHref="#a"
				y1="7"
				y2="243.657"
			/>
			<linearGradient id="d">
				<stop offset="0" stopColor="#e4b378" />
				<stop offset="1" stopColor="#b98c55" />
			</linearGradient>
			<linearGradient
				id="e"
				gradientUnits="userSpaceOnUse"
				x1="612.9"
				x2="612.9"
				xlinkHref="#d"
				y1="197"
				y2="218.3"
			/>
			<linearGradient
				id="f"
				gradientUnits="userSpaceOnUse"
				x1="47.9"
				x2="47.9"
				xlinkHref="#d"
				y1="32"
				y2="53.3"
			/>
			<path d="m8.25.25h644.5v250.5h-644.5z" stroke="url(#b)" strokeWidth=".5" />
			<path d="m.25 7.25h660.5v236.157h-660.5z" stroke="url(#c)" strokeWidth=".5" />
			<path
				d="m627.8 203.4c0 3.2-.7 6.133-2.1 8.8s-3.467 4.7-6.2 6.1l-3.4-2.8c1.533-.533 2.867-1.7 4-3.5 1.333-1.867 2-3.567 2-5.1h-6.5v-9.9h12.2zm-17.6 0c0 3.133-.733 6.133-2.2 9-1.533 2.867-3.567 4.833-6.1 5.9l-3.4-2.8c1.533-.533 2.867-1.7 4-3.5 1.333-1.867 2-3.567 2-5.1h-6.5v-9.9h12.2z"
				fill="url(#e)"
			/>
			<path
				d="m62.8 53.3h-12.2v-6.6c0-3.2.7-6.1 2.1-8.7 1.4-2.6667 3.4667-4.6667 6.2-6l3.4 2.5c-.6667.6667-1.3333 1.3-2 1.9-.6.6-1.2333 1.2-1.9 1.8-1.4 1.6-2.1 3.3-2.1 5.1h6.5zm-17.6 0h-12.2v-6.6c0-3.2.7-6.1 2.1-8.7 1.4-2.6667 3.4667-4.6667 6.2-6l3.4 2.5c-.6.6667-1.2333 1.3-1.9 1.9s-1.3333 1.2-2 1.8c-1.4 1.7333-2.1 3.4333-2.1 5.1h6.5z"
				fill="url(#f)"
			/>{' '}
			<switch>
				<foreignObject
					x="70"
					y="20"
					width="540"
					height="200"
					textAnchor="middle"
					dominantBaseline="middle"
				>
					<p style={{ color: 'white', fontSize: '22px', lineHeight: 1.45, textAlign: 'center' }}>
						{`Hey @kwenta_io, it's ${address}. Let me in to the L2
						testnet trading competition! @optimismPBC @synthetix_io https://futures.kwenta.io #FuturesOnKwentaIsHere`}
					</p>
				</foreignObject>
			</switch>
		</svg>
	);
};

export default TweetBox;
