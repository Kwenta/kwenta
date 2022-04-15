import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { BigNumber } from '@ethersproject/bignumber';
import cl from '../../../soupStuff';

import BaseModal from 'components/BaseModal';
import PositionButtons from '../../../sections/futures/PositionButtons';
import { PositionSide } from '../types';

type ProfitCalculatorProps = {
	// history: PositionHistory[] | null;
	// isLoading: boolean;
	// isLoaded: boolean;
};

const LabelWithInput = (props: {
	id?: string;
	labelText: string;
	className?: string;
	placeholder: string;
	onChange?: any;
}) => {
	return (
		<>
			<LabelText>{props.labelText}</LabelText>
			<InputContainer className={props.className}>
				<StyledLabel>
					<StyledInput
						id={props.id}
						placeholder={props.placeholder}
						inputMode={'decimal'}
						onChange={props.onChange}
						step={'0.01'}
					/>
				</StyledLabel>
			</InputContainer>
		</>
	);
};

const StatWithContainer = (props: { label: string; stateVar: any; type: number }) => {
	return (
		<>
			<StatContainer>
				<StatLabel>{props.label}</StatLabel>
				{props.type === 0 ? <Stat style={{ color: '#7FD482' }}>{`$ ${props.stateVar}`}</Stat> : ''}
				{props.type === 1 ? <Stat style={{ color: '#EF6868' }}>{`$ ${props.stateVar}`}</Stat> : ''}
				{props.type === 2 ? <Stat style={{ color: '#ECE8E3' }}>{`${props.stateVar}x`}</Stat> : ''}
			</StatContainer>
		</>
	);
};

const PnLs = (props: { entryPrice: BigNumber; exitPrice: BigNumber; stopLoss: BigNumber }) => {
	// const PnLs = (props: { entryPrice: number; exitPrice: number; stopLoss: number }) => {
	let rateOfReturn: any = 0,
		profit: BigNumber = ethers.BigNumber.from(0),
		loss: BigNumber = ethers.BigNumber.from(0);
	// profit: number = 0,
	// loss: number = 0;

	const labels = ['Exit PnL', 'Stop PnL', 'R:R'];

	if (
		parseFloat(props.entryPrice.toString()) !== 0 &&
		parseFloat(props.exitPrice.toString()) !== 0 &&
		parseFloat(props.stopLoss.toString()) !== 0
		// props.entryPrice !== 0 &&
		// props.exitPrice !== 0 &&
		// props.stopLoss !== 0
	) {
		profit = props.exitPrice.sub(props.entryPrice);
		loss = props.stopLoss.sub(props.entryPrice);
		// profit = props.exitPrice - props.entryPrice;
		// loss = props.stopLoss - props.entryPrice;

		rateOfReturn = profit.div(loss.abs());
		// rateOfReturn = profit / Math.abs(loss);

		rateOfReturn = parseFloat(rateOfReturn.toString()).toPrecision(2);
	}

	const returnStateVar = (index: number) => {
		if (index === 0) return profit.toString();
		if (index === 1) return loss.toString();
		if (index === 2) return rateOfReturn;
	};

	return (
		<>
			{labels.map((_label: string, index: number) => (
				<StatWithContainer
					key={index}
					label={_label}
					stateVar={returnStateVar(index)}
					type={index}
				/>
			))}
		</>
	);
};

const ProfitDetails = (props: {
	leverageSide: PositionSide;
	exitPrice: BigNumber;
	stopLoss: BigNumber;
	marketAssetPositionSize: BigNumber;
	// exitPrice: number;
	// stopLoss: number;
	// marketAssetPositionSize: number;
	marketAsset: string;
}) => {
	const entryOrderDetails = props.leverageSide === PositionSide.LONG ? 'Long' : 'Short';

	return (
		<>
			{/**
			 * @todo 1. Add css for row-separating lines
			 *       2. Add css for spacing between `Sell` and `at` and value
			 *       3. add proper margins to fit this component ~46px from the bottom
			 *          of the modal container
			 */}
			<StyledProfitDetails>
				{/* ENTRY ORDER */}
				<div>
					<RowText className="row-name">{'Entry Order:'}</RowText>
				</div>
				<div>
					<RowText className={props.leverageSide}>{`${entryOrderDetails}`}</RowText>
					<RowText>{`, Market`}</RowText>
				</div>
				{/* TAKE PROFIT */}
				<div>
					<RowText className="row-name">{'Take Profit:'}</RowText>
				</div>
				<div>
					<RowText>{`Sell`}</RowText>
					<RowText className="gray-font-color">{`at`}</RowText>
					<RowText>{props.exitPrice.toString()}</RowText>
				</div>
				{/* STOP LOSS */}
				<div>
					<RowText className="row-name">{'Stop Loss:'}</RowText>
				</div>
				<div>
					<RowText>{`Sell`}</RowText>
					<RowText className="gray-font-color">{`at`}</RowText>
					<RowText>{props.stopLoss.toString()}</RowText>
				</div>
				{/* SIZE */}
				<div>
					<RowText className="row-name">{'Size:'}</RowText>
				</div>
				<div>
					<RowText>{`${props.marketAssetPositionSize}`}</RowText>
					<RowText className="gray-font-color">{`${props.marketAsset}-PERP`}</RowText>
				</div>
			</StyledProfitDetails>
		</>
	);
};

// Core component
const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
	marketAsset,
	setOpenProfitCalcModal,
}: any) => {
	const { t } = useTranslation();

	/**
	 * @todo Working with BigNumbers is complicated due to underflow/overflow
	 *       errors AND because of errors when the input is a `float` type
	 */
	// BigNumbers
	const [entryPrice, setEntryPrice] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [exitPrice, setExitPrice] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [stopLoss, setStopLoss] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [gainPercent, setGainPercent] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [lossPercent, setLossPercent] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [marketAssetPositionSize, setMarketAssetPositionSize] = useState<BigNumber>(
		ethers.BigNumber.from(0)
	);
	const [basePositionSize, setBasePositionSize] = useState<BigNumber>(ethers.BigNumber.from(0));

	// // Numbers
	// const [entryPrice, setEntryPrice] = useState<number>(0.0);
	// const [exitPrice, setExitPrice] = useState<number>(0.0);
	// const [stopLoss, setStopLoss] = useState<number>(0.0);
	// // const [gainPercent, setGainPercent] = useState<number>(0.0);
	// // const [lossPercent, setLossPercent] = useState<number>(0.0);
	// const [marketAssetPositionSize, setMarketAssetPositionSize] = useState<number>(0.0);
	// // const [basePositionSize, setBasePositionSize] = useState<number>(0.0);
	// // Strings

	// Custom type
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);

	const scalar = 100;

	const handleSetEntryPrice = (e: any) => {
		let entryPrice_, isNum, isFloat, isUglyFloat1, isUglyFloat2, clampDecimals;

		entryPrice_ = e.currentTarget.value;
		isNum = /^\d+$/.test(entryPrice_);
		isFloat = /^[0-9]+\.[0-9]+$/.test(entryPrice_);
		isUglyFloat1 = /^\.[0-9]+$/.test(entryPrice_);
		isUglyFloat2 = /^[0-9]+\.$/.test(entryPrice_);
		clampDecimals = /^\d+\.\d{0,2}$/.test(entryPrice_);

		if (isNum || isFloat || isUglyFloat1 || isUglyFloat2 || clampDecimals) {
			if (entryPrice_.indexOf(' ') >= 0) {
				// if includes whitespace
				entryPrice_.trim();
			}

			if (!isNaN(entryPrice_) && entryPrice_ !== '') {
				setEntryPrice(
					ethers.BigNumber.from(parseFloat(parseFloat(entryPrice_).toPrecision(2) * scalar))
				);
				cl('entryPrice: ', entryPrice.toString());
			}
		}
	};

	const handleSetExitPrice = (e: any) => {
		let src_, isNum, isFloat, isUglyFloat1, isUglyFloat2, clampDecimals;

		src_ = e.currentTarget.value;
		isNum = /^\d+$/.test(src_);
		isFloat = /^[0-9]+\.[0-9]+$/.test(src_);
		isUglyFloat1 = /^\.[0-9]+$/.test(src_);
		isUglyFloat2 = /^[0-9]+\.$/.test(src_);
		clampDecimals = /^\d+\.\d{0,2}$/.test(src_);

		if (isNum || isFloat || isUglyFloat1 || isUglyFloat2 || clampDecimals) {
			if (src_.indexOf(' ') >= 0) {
				// if includes whitespace
				src_.trim();
			}

			if (!isNaN(src_) && src_ !== '') {
				setExitPrice(ethers.BigNumber.from(parseFloat(parseFloat(src_).toPrecision(2)) * scalar));
				cl('exitPrice: ', exitPrice.toString());
			}
		}
	};

	const handleSetStopLoss = (e: any) => {
		let stopLoss_, isNum, isFloat, isUglyFloat1, isUglyFloat2, clampDecimals;

		stopLoss_ = e.currentTarget.value;
		isNum = /^\d+$/.test(stopLoss_);
		isFloat = /^[0-9]+\.[0-9]+$/.test(stopLoss_);
		isUglyFloat1 = /^\.[0-9]+$/.test(stopLoss_);
		isUglyFloat2 = /^[0-9]+\.$/.test(stopLoss_);
		clampDecimals = /^\d+\.\d{0,2}$/.test(stopLoss_);

		if (isNum || isFloat || isUglyFloat1 || isUglyFloat2 || clampDecimals) {
			if (stopLoss_.indexOf(' ') >= 0) {
				// if includes whitespace
				stopLoss_.trim();
			}

			if (!isNaN(stopLoss_) && stopLoss_ !== '') {
				setStopLoss(
					ethers.BigNumber.from(parseFloat(parseFloat(stopLoss_).toPrecision(2) * scalar))
				);
				cl('stopLoss: ', stopLoss.toString());
			}
		}
	};

	const handleSetPositionSize = (e: any, isBase: boolean): void => {
		let positionSize_, isNum, isFloat, isUglyFloat1, isUglyFloat2, clampDecimals;

		positionSize_ = e.currentTarget.value;
		isNum = /^\d+$/.test(positionSize_);
		isFloat = /^[0-9]+\.[0-9]+$/.test(positionSize_);
		isUglyFloat1 = /^\.[0-9]+$/.test(positionSize_);
		isUglyFloat2 = /^[0-9]+\.$/.test(positionSize_);
		clampDecimals = /^\d+\.\d{0,2}$/.test(positionSize_);

		if (isNum || isFloat || isUglyFloat1 || isUglyFloat2 || clampDecimals) {
			if (positionSize_.indexOf(' ') >= 0) {
				// if includes whitespace
				positionSize_.trim();
			}

			if (!isNaN(positionSize_) && positionSize_ !== '') {
				setMarketAssetPositionSize(
					ethers.BigNumber.from(parseFloat(parseFloat(positionSize_).toPrecision(2) * scalar))
				);
				cl('marketAssetPositionSize: ', marketAssetPositionSize.toString());
			}
		}
	};

	/**
	 * @todo Save this for last!
	 */
	const handleCalculateProfit = (e: any) => {
		e.preventDefault();
	};

	const setTargetInputValue = (source: string, target: string) => {
		let src_: HTMLElement | null | string = document.getElementById(source),
			target_: HTMLElement | null | string = document.getElementById(target);

		if (src_ !== null && target_ !== null) {
			if (src_.nodeValue !== null && target_.nodeValue !== null) {
				target_.nodeValue = src_.nodeValue;
			}
		}
	};

	// Run this whenever `exitPrice` and `stopLoss` are updated
	useEffect(() => {
		// let exitPrice_: HTMLElement | null | string = document.getElementById('exit-price'),
		// 	stopLoss_: HTMLElement | null | string = document.getElementById('stop-loss'),
		// 	positionSize_: HTMLElement | null | string = document.getElementById('market-position-size');

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
					<form onSubmit={handleCalculateProfit}>
						<LabelWithInput
							className={'entry-price'}
							labelText={'Entry Price: '}
							placeholder={'$43,938.11'}
							onChange={handleSetEntryPrice}
						/>
						<ProfitCalcGrid>
							{/* LEFT column */}
							<LeftColumn>
								<LabelWithInput
									id={'exit-price'}
									labelText={'Exit Price: '}
									placeholder={'$46,939.11'}
									onChange={handleSetExitPrice}
								/>
								<LabelWithInput
									id={'stop-loss'}
									labelText={'Stop Loss: '}
									placeholder={'$32,000.00'}
									onChange={handleSetStopLoss}
								/>
								<LabelWithInput
									id={'market-position-size'}
									labelText={'Position Size: '}
									placeholder={`23.1 ${marketAsset}`}
									onChange={(e: any): void => handleSetPositionSize(e, false)}
								/>
							</LeftColumn>
							{/* RIGHT column */}
							<RightColumn>
								<LabelWithInput id={'gain-percent'} labelText={'Gain %: '} placeholder={`5.55%`} />
								<LabelWithInput id={'loss-percent'} labelText={'Loss %: '} placeholder={`4.1%`} />
								<LabelWithInput
									id={'base-position-size'}
									labelText={'Position Size: '}
									placeholder={`$305,532.28 sUSD`}
									onChange={(e: any): void => handleSetPositionSize(e, true)}
								/>
							</RightColumn>
						</ProfitCalcGrid>
						{/* BUTTONS */}
						<PositionButtons type={'submit'} selected={leverageSide} onSelect={setLeverageSide} />
						{/* STATS row of 3 */}
						<StatsGrid>
							<PnLs entryPrice={entryPrice} exitPrice={exitPrice} stopLoss={stopLoss} />
						</StatsGrid>
						{/* PROFIT DETAILS */}
						<ProfitDetails
							leverageSide={leverageSide}
							exitPrice={exitPrice}
							stopLoss={stopLoss}
							marketAssetPositionSize={marketAssetPositionSize}
							marketAsset={marketAsset}
						/>
					</form>
				</ModalWindow>
			</BaseModal>
		</>
	);
};

const RowText = styled.p`
	display: inline-block;

	color: #ece8e3;
	color: ${(props) => (props.className === 'long' ? '#7FD482' : '')};
	color: ${(props) => (props.className === 'short' ? '#EF6868' : '')};
	color: ${(props) => (props.className === 'gray-font-color' ? '#787878' : '')};

	font-size: 14px;
	line-height: 17px;
	text-align: ${(props) => (props.className === 'row-name' ? 'left' : 'right')};
`;

const StyledProfitDetails = styled.div`
	display: grid;
	grid-gap: 0rem;
	grid-template-columns: repeat(2, 1fr);

	border: 1px solid rgba(255, 255, 255, 0.1);
	box-sizing: border-box;
	border-radius: 6px;

	margin-top: 20px;
`;

const Stat = styled.div`
	font-size: 16px;
	line-height: 19px;
	margin: -7.5px 0px 0px 12px;
`;

const StatLabel = styled.p`
	font-size: 14px;
	line-height: 14px;
	color: #787878;
	margin-left: 12px;
`;

const StatContainer = styled.div`
	width: auto;
	height: 69px;

	border: 1px solid rgba(255, 255, 255, 0.1);
	box-sizing: border-box;
	border-radius: 6px;
`;

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

const LabelText = styled.p`
	width: 100.91px;
	height: 12px;
	left: 479px;
	top: 329px;

	font-weight: 400;
	font-size: 12px;
	line-height: 12px;

	color: #ece8e3;
`;

const StyledLabel = styled.label`
	display: flex;
	flex-direction: row;
`;

const StyledInput = styled.input`
	/* Rectangle 2050 */

	color: #ece8e3;
	width: 100%;
	height: 46px;

	background: linear-gradient(180deg, #101010 33.26%, rgba(24, 24, 24, 0.37) 100%);
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-sizing: border-box;
	border-radius: 6px;
`;

const InputContainer = styled.div`
	width: ${(props) => (props.className ? '100%' : 'auto')};
	height: 46px;
`;

const ModalWindow = styled.div`
	height: 789px;
`;

export default ProfitCalculator;
