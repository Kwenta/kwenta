import { useCallback, useEffect, useState } from 'react';
import { wei } from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import PnLs from './PnLs';
import ProfitDetails from './ProfitDetails';
import BaseModal from 'components/BaseModal';
import LabelWithInput from './LabelWithInput';
import PositionButtons from 'sections/futures/PositionButtons';
import { PositionSide } from '../types';

const ProfitCalculator = ({ marketAsset, marketAssetRate, setOpenProfitCalcModal }: any) => {
	const marketAsset__RemovedSChar = marketAsset[0] === 's' ? marketAsset.slice(1) : marketAsset;
	const { t } = useTranslation();

	// Wei
	const [entryPrice, setEntryPrice] = useState<string>('');
	const [exitPrice, setExitPrice] = useState<string>('');
	const [gainPercent, setGainPercent] = useState<string>('');
	const [stopLoss, setStopLoss] = useState<string>('');
	const [lossPercent, setLossPercent] = useState<string>('');
	const [marketAssetPositionSize, setMarketAssetPositionSize] = useState<string>('');
	const [basePositionSize, setBasePositionSize] = useState<string>('');
	// Custom type
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);

	const onEntryPriceAmountChange = (value: string) => {
		setEntryPrice(value);
	};

	const onExitPriceAmountChange = (value: string, fromLeverage: boolean = false) => {
		setExitPrice(fromLeverage ? (value === '' ? '' : wei(value).toNumber().toFixed(2)) : value);
		setGainPercent(
			value === ''
				? ''
				: (
						100 *
						(leverageSide === 'long'
							? wei(value).div(entryPrice).toNumber() - 1
							: (wei(value).div(entryPrice).toNumber() - 1) * -1)
				  ).toFixed(2)
		);
	};

	const onGainPercentChange = useCallback(
		(value: string) => {
			setGainPercent(value);
			setExitPrice(
				value === ''
					? ''
					: (leverageSide === 'long'
							? wei(value).div(100).add(1).mul(entryPrice).toNumber()
							: wei(1).sub(wei(value).div(100)).mul(entryPrice).toNumber()
					  ).toFixed(2)
			);
		},
		[entryPrice, leverageSide]
	);

	const onStopLossAmountChange = (value: string, fromLeverage: boolean = false) => {
		setStopLoss(fromLeverage ? (value === '' ? '' : wei(value).toNumber().toFixed(2)) : value);
		setLossPercent(
			value === ''
				? ''
				: (leverageSide === 'long'
						? (1 - wei(value).div(entryPrice).toNumber()) * 100
						: (1 - wei(value).div(entryPrice).toNumber()) * 100 * -1
				  ).toFixed(2)
		);
	};

	const onLossPercentChange = useCallback(
		(value: string) => {
			setLossPercent(value);
			setStopLoss(
				value === ''
					? ''
					: (leverageSide === 'long'
							? wei(1).sub(wei(value).div(100)).mul(entryPrice).toNumber()
							: wei(value).div(100).add(1).mul(entryPrice).toNumber()
					  ).toFixed(2)
			);
		},
		[entryPrice, leverageSide]
	);

	const onTradeAmountChange = useCallback(
		(value: any, fromLeverage: boolean = false) => {
			setMarketAssetPositionSize(
				fromLeverage ? (value === '' ? '' : wei(value).toNumber().toFixed(2)) : value
			);
			setBasePositionSize(
				value === '' ? '' : (parseFloat(entryPrice) * parseFloat(value)).toFixed(2)
			);
		},
		[entryPrice]
	);

	const onTradeAmountSUSDChange = useCallback(
		(value: string) => {
			setBasePositionSize(value);
			setMarketAssetPositionSize(
				value === '' ? '' : wei(value).div(entryPrice).toNumber().toFixed(2)
			);
		},
		[entryPrice]
	);

	useEffect(() => {
		setEntryPrice(marketAssetRate);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		onGainPercentChange(gainPercent);
		onLossPercentChange(lossPercent);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leverageSide]);

	return (
		<>
			<BaseModal
				onDismiss={() => setOpenProfitCalcModal(false)}
				isOpen={true}
				title={t('futures.modals.profit-calculator.title')}
			>
				<ModalWindow>
					<LabelWithInput
						labelText={'Entry Price: '}
						value={entryPrice}
						onChange={(_: any, v: any) => onEntryPriceAmountChange(v)}
					/>
					<ProfitCalcGrid>
						{/* LEFT column */}
						<LeftColumn>
							<LabelWithInput
								id={'exit-price'}
								labelText={'Exit Price: '}
								placeholder={`${(marketAssetRate + marketAssetRate * 0.05).toFixed(2)}`}
								value={exitPrice}
								onChange={(_: any, v: any) => onExitPriceAmountChange(v)}
							/>
							<LabelWithInput
								id={'stop-loss'}
								labelText={'Stop Loss: '}
								placeholder={`${(marketAssetRate - marketAssetRate * 0.05).toFixed(2)}`}
								value={stopLoss}
								onChange={(_: any, v: any) => onStopLossAmountChange(v)}
							/>
							<LabelWithInput
								id={'market-position-size'}
								labelText={'Position Size: '}
								placeholder={`10.00`}
								right={marketAsset__RemovedSChar}
								value={marketAssetPositionSize}
								onChange={(_: any, v: any) => onTradeAmountChange(v)}
							/>
						</LeftColumn>
						{/* RIGHT column */}
						<RightColumn>
							<LabelWithInput
								id={'gain-percent'}
								labelText={'Gain %: '}
								placeholder={`5.00`}
								value={gainPercent}
								onChange={(_: any, v: any) => onGainPercentChange(v)}
							/>
							<LabelWithInput
								id={'loss-percent'}
								labelText={'Loss %: '}
								placeholder={`5.00`}
								value={lossPercent}
								onChange={(_: any, v: any) => onLossPercentChange(v)}
							/>
							<LabelWithInput
								id={'base-position-size'}
								labelText={'Position Size: '}
								placeholder={`${(marketAssetRate * 10).toFixed(2)}`}
								right={'sUSD'}
								value={basePositionSize}
								onChange={(_: any, v: any) => onTradeAmountSUSDChange(v)}
							/>
						</RightColumn>
					</ProfitCalcGrid>
					{/* BUTTONS */}
					<div style={{ marginTop: '20px' }} />
					<PositionButtons selected={leverageSide} onSelect={setLeverageSide} />
					{/* STATS row of 3 */}
					<StatsGrid>
						<PnLs
							stopLoss={stopLoss}
							exitPrice={exitPrice}
							entryPrice={entryPrice}
							leverageSide={leverageSide}
							amountInAsset={marketAssetPositionSize}
						/>
					</StatsGrid>
					{/* PROFIT DETAILS */}
					<ProfitDetails
						stopLoss={stopLoss}
						exitPrice={exitPrice}
						marketAsset={marketAsset__RemovedSChar}
						leverageSide={leverageSide}
						marketAssetPositionSize={marketAssetPositionSize}
					/>
				</ModalWindow>
			</BaseModal>
		</>
	);
};

const StatsGrid = styled.div`
	display: grid;
	grid-gap: 1.1rem;
	grid-template-columns: repeat(3, 1fr);

	margin-top: 20px;
`;

const LeftColumn = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: left;
	align-self: left;
`;

const RightColumn = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: right;
	align-self: right;
`;

const ProfitCalcGrid = styled.div`
	display: grid;
	grid-gap: 1.1rem;
	grid-template-columns: repeat(2, 1fr);
`;

const ModalWindow = styled.div`
	height: 729px;
	padding: 0px 25px;
`;

export default ProfitCalculator;
