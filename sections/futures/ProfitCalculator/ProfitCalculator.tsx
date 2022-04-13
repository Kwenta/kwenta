import React, { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
// import { CellProps } from 'react-table';
// import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import BaseModal from 'components/BaseModal';
import PositionButtons from '../../../sections/futures/PositionButtons';
import { PositionSide } from '../types';
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

// // import BlockExplorer from 'containers/BlockExplorer';
// // import { ExternalLink, FlexDivCentered, GridDivCenteredRow } from 'styles/common';

// import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
// import LinkIcon from 'assets/svg/app/link.svg';
// import { TradeStatus, PositionSide } from '../types';
// import { Synths } from 'constants/currency';
// import CurrencyIcon from 'components/Currency/CurrencyIcon';

// import PendingIcon from 'assets/svg/app/circle-ellipsis.svg';
// import FailureIcon from 'assets/svg/app/circle-error.svg';
// import SuccessIcon from 'assets/svg/app/circle-tick.svg';
// import { formatCurrency, formatCryptoCurrency, formatNumber } from 'utils/formatters/number';
// import { PositionHistory } from 'queries/futures/types';

type ProfitCalculatorProps = {
	// history: PositionHistory[] | null;
	// isLoading: boolean;
	// isLoaded: boolean;
};

const LabelWithInput = (props: {
	labelText: string;
	className?: string;
	placeholder: string;
	onChange: any;
}) => {
	return (
		<>
			<LabelText>{props.labelText}</LabelText>
			<InputContainer className={props.className}>
				<StyledLabel>
					<StyledInput
						placeholder={props.placeholder}
						inputMode={'decimal'}
						type={'number'}
						onChange={props.onChange}
					/>
				</StyledLabel>
			</InputContainer>
		</>
	);
};

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
	marketAsset,
	setOpenProfitCalcModal,
}: any) => {
	const { t } = useTranslation();
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);
	const [entryPrice, setEntryPrice] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [exitPrice, setExitPrice] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [stopLoss, setStopLoss] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [gainPercent, setGainPercent] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [lossPercent, setLossPercent] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [marketAssetPositionSize, setMarketAssetPositionSize] = useState<BigNumber>(
		ethers.BigNumber.from(0)
	);
	const [basePositionSize, setBasePositionSize] = useState<BigNumber>(ethers.BigNumber.from(0));

	const handleSetEntryPrice = (e: any) => {
		let entryPrice_, isNum, isFloat, isUglyFloat1, isUglyFloat2;

		entryPrice_ = e.currentTarget.value;
		isNum = /^\d+$/.test(entryPrice_);
		isFloat = /^[0-9]+\.[0-9]+$/.test(entryPrice_);
		isUglyFloat1 = /^\.[0-9]+$/.test(entryPrice_);
		isUglyFloat2 = /^[0-9]+\.$/.test(entryPrice_);

		if (isNum || isFloat || isUglyFloat1 || isUglyFloat2) {
			if (entryPrice_.indexOf(' ') >= 0) {
				// if includes whitespace
				entryPrice_.trim();
			}

			if (!isNaN(entryPrice_) && entryPrice_ !== '') {
				setEntryPrice(entryPrice_);
			}
		}
	};

	const handleSetExitPrice = (e: any) => {
		let exitPrice_, isNum, isFloat, isUglyFloat1, isUglyFloat2;

		exitPrice_ = e.currentTarget.value;
		isNum = /^\d+$/.test(exitPrice_);
		isFloat = /^[0-9]+\.[0-9]+$/.test(exitPrice_);
		isUglyFloat1 = /^\.[0-9]+$/.test(exitPrice_);
		isUglyFloat2 = /^[0-9]+\.$/.test(exitPrice_);

		if (isNum || isFloat || isUglyFloat1 || isUglyFloat2) {
			if (exitPrice_.indexOf(' ') >= 0) {
				// if includes whitespace
				exitPrice_.trim();
			}

			if (!isNaN(exitPrice_) && exitPrice_ !== '') {
				setExitPrice(exitPrice_);
			}
		}
	};

	const handleSetPercent = (e: any, isGain: boolean) => {
		let percent_, isPositiveDecimal, isFloat, isUglyFloat1, isUglyFloat2;

		percent_ = e.currentTarget.value;
		isPositiveDecimal = /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(percent_);
		isFloat = /^[0-9]+\.[0-9]+$/.test(percent_);
		isUglyFloat1 = /^\.[0-9]+$/.test(percent_);
		isUglyFloat2 = /^[0-9]+\.$/.test(percent_);

		if (isPositiveDecimal || isFloat || isUglyFloat1 || isUglyFloat2) {
			if (percent_.indexOf(' ') >= 0) {
				// if includes whitespace
				percent_.trim();
			}

			if (!isNaN(percent_) && percent_ !== '') {
				if (isGain) {
					setGainPercent(percent_);
				} else {
					setLossPercent(percent_);
				}
			}
		}
	};

	const handleSetStopLoss = (e: any) => {
		let stopLoss_, isNum, isFloat, isUglyFloat1, isUglyFloat2;

		stopLoss_ = e.currentTarget.value;
		isNum = /^\d+$/.test(stopLoss_);
		isFloat = /^[0-9]+\.[0-9]+$/.test(stopLoss_);
		isUglyFloat1 = /^\.[0-9]+$/.test(stopLoss_);
		isUglyFloat2 = /^[0-9]+\.$/.test(stopLoss_);

		if (isNum || isFloat || isUglyFloat1 || isUglyFloat2) {
			if (stopLoss_.indexOf(' ') >= 0) {
				// if includes whitespace
				stopLoss_.trim();
			}

			if (!isNaN(stopLoss_) && stopLoss_ !== '') {
				setStopLoss(stopLoss_);
			}
		}
	};

	const handleSetPositionSize = (e: any, isBase: boolean): void => {
		let positionSize_, isNum, isFloat, isUglyFloat1, isUglyFloat2;

		positionSize_ = e.currentTarget.value;
		isNum = /^\d+$/.test(positionSize_);
		isFloat = /^[0-9]+\.[0-9]+$/.test(positionSize_);
		isUglyFloat1 = /^\.[0-9]+$/.test(positionSize_);
		isUglyFloat2 = /^[0-9]+\.$/.test(positionSize_);

		if (isNum || isFloat || isUglyFloat1 || isUglyFloat2) {
			if (positionSize_.indexOf(' ') >= 0) {
				// if includes whitespace
				positionSize_.trim();
			}

			if (!isNaN(positionSize_) && positionSize_ !== '') {
				if (isBase) {
					setBasePositionSize(positionSize_);
				} else {
					setMarketAssetPositionSize(positionSize_);
				}
			}
		}
	};

	/**
	 * @todo Save this for last!
	 */
	const handleCalculateProfit = (e: any) => {
		e.preventDefault();
	};

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
								labelText={'Exit Price: '}
								placeholder={'$46,939.11'}
								onChange={handleSetExitPrice}
							/>
							<LabelWithInput
								labelText={'Stop Loss: '}
								placeholder={'$32,000.00'}
								onChange={handleSetStopLoss}
							/>
							<LabelWithInput
								labelText={'Position Size: '}
								placeholder={`23.1 ${marketAsset}`}
								onChange={(e: any): void => handleSetPositionSize(e, false)}
							/>
						</LeftColumn>
						{/* RIGHT column */}
						<RightColumn>
							<LabelWithInput
								labelText={'Gain %: '}
								placeholder={`5.55%`}
								onChange={(e: any): void => handleSetPercent(e, true)}
							/>
							<LabelWithInput
								labelText={'Loss %: '}
								placeholder={`4.1%`}
								onChange={(e: any): void => handleSetPercent(e, false)}
							/>
							<LabelWithInput
								labelText={'Position Size: '}
								placeholder={`$305,532.28 sUSD`}
								onChange={(e: any): void => handleSetPositionSize(e, true)}
							/>
						</RightColumn>
					</ProfitCalcGrid>
					{/* BUTTONS */}
					<PositionButtons type={'submit'} selected={leverageSide} onSelect={setLeverageSide} />
					<StatsContainer>
						<Stat>{'exit PnL'}</Stat>
						<Stat>{'Stop PnL'}</Stat>
						<Stat>{'R:R'}</Stat>
					</StatsContainer>
				</form>
			</BaseModal>
		</>
	);
};

const Stat = styled.div`
width: 160px;
height: 69px;

border: 1px solid rgba(255, 255, 255, 0.1);
box-sizing: border-box;
border-radius: 6px;
`

const StatsContainer = styled.div`
	display: grid;
	grid-gap: 1.1rem;
	grid-template-columns: repeat(3, 1fr);
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

export default ProfitCalculator;
