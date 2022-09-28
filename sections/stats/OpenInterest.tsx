import { useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import AAVEIcon from 'assets/png/currencies/sAAVE.png';
import APEIcon from 'assets/png/currencies/sAPECOIN.png';
import AVAXIcon from 'assets/png/currencies/sAVAX.png';
import BTCIcon from 'assets/png/currencies/sBTC.png';
import DYDXIcon from 'assets/png/currencies/sDYDX.png';
import ETHIcon from 'assets/png/currencies/sETH.png';
import EURIcon from 'assets/png/currencies/sEUR.png';
import LINKIcon from 'assets/png/currencies/sLINK.png';
import MATICIcon from 'assets/png/currencies/sMATIC.png';
import SOLIcon from 'assets/png/currencies/sSOL.png';
import UNIIcon from 'assets/png/currencies/sUNI.png';
import XAGIcon from 'assets/png/currencies/sXAG.png';
import XAUIcon from 'assets/png/currencies/sXAU.png';
import { futuresMarketsState } from 'store/futures';
import colors from 'styles/theme/colors/common';
import fonts from 'styles/theme/fonts';

import { initBarChart } from './initBarChart';
import type { EChartsOption } from './initBarChart';
import { OpenInterestWrapper, ScrollableWrapper } from './stats.styles';

let chartInstance: any;

export const OpenInterest = () => {
	const { t } = useTranslation();

	const openInterestRef = useRef<HTMLDivElement | null>(null);
	const futuresMarkets = useRecoilValue(futuresMarketsState);

	const openInterests = useMemo(() => {
		return futuresMarkets.map((data) => {
			if (data.openInterest?.longUSD === undefined) {
				if (data.openInterest?.shortUSD === undefined) {
					return 0;
				} else {
					// @ts-ignore
					return data.openInterest.longUSD.toNumber();
				}
			} else if (data.openInterest.shortUSD === undefined) {
				if (data.openInterest.longUSD === undefined) {
					return 0;
				} else {
					// @ts-ignore
					return data.openInterest.shortUSD.toNumber();
				}
			}
			return data.openInterest?.longUSD.add(data.openInterest?.shortUSD).toNumber();
		});
	}, [futuresMarkets]);

	useEffect(() => {
		if (!openInterestRef || !openInterestRef.current || !openInterests || !openInterests.length) {
			return;
		}

		const text = t('stats.open-interest.title');
		const subtext = '$40,461,472';
		const ASSETS: any = {
			ETH: {
				underlying: 'Ether',
				icon: ETHIcon,
			},
			BTC: {
				underlying: 'Bitcoin',
				icon: BTCIcon,
			},
			SOL: {
				underlying: 'Solana',
				icon: SOLIcon,
			},
			EUR: {
				underlying: 'Euros',
				icon: EURIcon,
			},
			XAG: {
				underlying: 'Silver',
				icon: XAGIcon,
			},
			MATIC: {
				underlying: 'Matic',
				icon: MATICIcon,
			},
			XAU: {
				underlying: 'Gold',
				icon: XAUIcon,
			},
			APE: {
				underlying: 'APE',
				icon: APEIcon,
			},
			LINK: {
				underlying: 'Chainlink',
				icon: LINKIcon,
			},
			DYDX: {
				underlying: 'DYDX',
				icon: DYDXIcon,
			},
			UNI: {
				underlying: 'Uniswap',
				icon: UNIIcon,
			},
			AVAX: {
				underlying: 'Avalanche',
				icon: AVAXIcon,
			},
			AAVE: {
				underlying: 'Aave',
				icon: AAVEIcon,
			},
		};

		const data = Object.keys(ASSETS);
		const option: EChartsOption = {
			title: {
				text,
				subtext,
				left: 20,
				top: 40,
				itemGap: 10,
				textStyle: {
					color: colors.primaryWhite,
					fontFamily: fonts.regular,
					fontSize: 18,
				},
				subtextStyle: {
					color: colors.primaryWhite,
					fontFamily: fonts.monoBold,
					fontSize: 28,
				},
			},
			grid: {
				top: 137,
				// right: 40,
				bottom: 100,
				left: 40,
			},
			xAxis: {
				type: 'category',
				data,
				axisLabel: {
					margin: -20,
					formatter: (sAsset: any) => {
						return [
							`{${sAsset}| }`,
							`{syntheticAsset|${sAsset}}`,
							`{underlyingAsset|${ASSETS[sAsset].underlying}}`,
						].join('\n');
					},
					rich: {
						syntheticAsset: {
							fontFamily: fonts.regular,
							fontSize: 15,
							color: colors.primaryWhite,
							width: 35,
							height: 23,
							padding: [9, 0, 0, 0],
						},
						underlyingAsset: {
							fontFamily: fonts.regular,
							fontSize: 12,
						},
						ETH: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.ETH.icon,
							// },
						},
						BTC: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sBTC.icon,
							// },
						},
						SOL: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sSOL.icon,
							// },
						},
						EUR: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sEUR.icon,
							// },
						},
						XAG: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sXAG.icon,
							// },
						},
						MATIC: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sMATIC.icon,
							// },
						},
						XAU: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sXAU.icon,
							// },
						},
						APE: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sAPE.icon,
							// },
						},
						LINK: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sLINK.icon,
							// },
						},
						DYDX: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sDYDX.icon,
							// },
						},
						UNI: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sUNI.icon,
							// },
						},
						AVAX: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sAVAX.icon,
							// },
						},
						AAVE: {
							width: 40,
							height: 40,
							// backgroundColor: {
							// 	image: ASSETS.sAAVE.icon,
							// },
						},
					},
					interval: 0,
				},
				axisTick: {
					show: false,
				},
			},
			yAxis: {
				type: 'value',
				splitLine: {
					lineStyle: {
						color: '#C9975B',
					},
				},
				position: 'right',
			},
			tooltip: {
				show: true,
				backgroundColor: '#0C0C0C',
				extraCssText:
					'box-shadow: 0px 24px 40px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.08), inset 0px 0px 20px rgba(255, 255, 255, 0.03);backdrop-filter: blur(60px);/* Note: backdrop-filter has minimal browser support */border-radius: 15px;',
			},
			series: [
				{
					data: openInterests.filter((e) => e !== undefined).sort((a, b) => b - a),
					type: 'bar',
					name: 'Total Trades',
					itemStyle: {
						color: '#C9975B',
					},
				},
			],
		};

		if (chartInstance) {
			chartInstance.dispose();
		}
		chartInstance = initBarChart(openInterestRef.current);
		chartInstance.setOption(option);
	}, [openInterestRef, t, openInterests]);

	return (
		<OpenInterestWrapper>
			<ScrollableWrapper ref={openInterestRef} />
		</OpenInterestWrapper>
	);
};
