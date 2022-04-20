import { useEffect, useState } from 'react';
import Wei, { wei } from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import PnLs from './PnLs';
import ProfitDetails from './ProfitDetails';
import BaseModal from 'components/BaseModal';
import LabelWithInput from './LabelWithInput';
import PositionButtons from 'sections/futures/PositionButtons';
import { PositionSide } from '../types';

const ProfitCalculator = ({ marketAsset, marketAssetRate, setOpenProfitCalcModal }: any) => {
	const { t } = useTranslation();

	// Wei
	const [entryPrice, setEntryPrice] = useState<Wei>(wei(0));
	const [exitPrice, setExitPrice] = useState<Wei>(wei(0));
	const [stopLoss, setStopLoss] = useState<Wei>(wei(0));
	const [marketAssetPositionSize, setMarketAssetPositionSize] = useState<Wei>(wei(0));
	// Custom type
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);

	const handleSetInput = (_e: any, _stateVar: any, _stateVarName: string) => {
		_stateVar = _e.currentTarget.value;

		if (!isNaN(_stateVar) && _stateVar !== '' && parseFloat(_stateVar) > 0) {
			if (_stateVarName === 'entryPrice') setEntryPrice(wei(_stateVar));
			if (_stateVarName === 'exitPrice') setExitPrice(wei(_stateVar));
			if (_stateVarName === 'stopLoss') setStopLoss(wei(_stateVar));
			if (_stateVarName === 'marketAssetPositionSize') setMarketAssetPositionSize(wei(_stateVar));
		}
	};

	const setTargetInputValue = (source: string, target: string) => {
		// We set the type of these `HTMLEement`s to `any` to ignore lint errors uwu
		let src_: any = document.getElementById(source),
			target_: any = document.getElementById(target);

		if (src_ !== null && target_ !== null) {
			if (src_.value !== null && target_.value !== null) {
				if (source === 'exit-price') {
					const gainPercent: number = parseFloat(src_.value) / entryPrice.toNumber();
					target_.value = gainPercent.toFixed(2);
				}

				if (source === 'stop-loss') {
					const lossPercent: number = parseFloat(src_.value) / stopLoss.toNumber();
					target_.value = lossPercent.toFixed(2);
				}

				if (source === 'market-position-size') {
					const basePositionSize: number = parseFloat(src_.value) * entryPrice.toNumber();
					target_.value = basePositionSize.toFixed(2);
				}
			}
		}
	};

	// Run this whenever `exitPrice` and `stopLoss` are updated
	useEffect(() => {
		setTargetInputValue('exit-price', 'gain-percent');
		setTargetInputValue('stop-loss', 'loss-percent');
		setTargetInputValue('market-position-size', 'base-position-size');
	}, [exitPrice, stopLoss, marketAssetPositionSize]);

	return (
		<>
			<BaseModal
				onDismiss={() => setOpenProfitCalcModal(false)}
				isOpen={true}
				/**
				 * @todo IDK how to make this comply with this project's style, e.g.
				 *       `t('modals.confirm-transaction.title')`
				 */
				title={t('Profit Calculator')}
			>
				<ModalWindow>
					<LabelWithInput
						defaultValue={marketAssetRate}
						labelText={'Entry Price: '}
						placeholder={'$43,938.11'}
						onChange={(e: any) => handleSetInput(e, entryPrice, 'entryPrice')}
					/>
					<ProfitCalcGrid>
						{/* LEFT column */}
						<LeftColumn>
							<LabelWithInput
								id={'exit-price'}
								labelText={'Exit Price: '}
								placeholder={'$46,939.11'}
								onChange={(e: any) => handleSetInput(e, exitPrice, 'exitPrice')}
							/>
							<LabelWithInput
								id={'stop-loss'}
								labelText={'Stop Loss: '}
								placeholder={'$32,000.00'}
								onChange={(e: any) => handleSetInput(e, stopLoss, 'stopLoss')}
							/>
							<LabelWithInput
								right={marketAsset}
								placeholder={`23.1`}
								id={'market-position-size'}
								labelText={'Position Size: '}
								onChange={(e: any) =>
									handleSetInput(e, marketAssetPositionSize, 'marketAssetPositionSize')
								}
							/>
						</LeftColumn>
						{/* RIGHT column */}
						<RightColumn>
							<LabelWithInput
								id={'gain-percent'}
								labelText={'Gain %: '}
								placeholder={`${marketAssetRate * 0.05}`}
								disabled={true}
							/>
							<LabelWithInput
								id={'loss-percent'}
								labelText={'Loss %: '}
								placeholder={`${marketAssetRate * -0.05}`}
								disabled={true}
							/>
							<LabelWithInput
								id={'base-position-size'}
								labelText={'Position Size: '}
								placeholder={`${marketAssetRate * 10}`}
								disabled={true}
								right={'sUSD'}
							/>
						</RightColumn>
					</ProfitCalcGrid>
					{/* BUTTONS */}
					<div style={{ marginTop: '20px' }} />
					<PositionButtons
						isMarketClosed={false}
						selected={leverageSide}
						onSelect={setLeverageSide}
					/>
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
						marketAsset={marketAsset}
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
