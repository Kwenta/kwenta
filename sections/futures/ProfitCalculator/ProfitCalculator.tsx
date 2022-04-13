import React, { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
// import { CellProps } from 'react-table';
// import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import BaseModal from 'components/BaseModal';
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

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
	marketAsset,
	setOpenProfitCalcModal,
}: any) => {
	const { t } = useTranslation();
	const [entryPrice, setEntryPrice] = useState<BigNumber>(ethers.BigNumber.from(0));
	const [exitPrice, setExitPrice] = useState<BigNumber>(ethers.BigNumber.from(0));

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

	const handleSetGainPercent = () => {};
	const handleSetStopLoss = () => {};
	const handleSetLossPercent = () => {};
	const handleSetMarketAssetPositionSize = () => {};
	const handleSetBasePositionSize = () => {};

	const handleProfitCalcSubmit = () => {};

	return (
		<>
			{console.log('entry price has changed! ', entryPrice.toString())}
			{console.log('exit price has changed! ', exitPrice.toString())}
			<BaseModal
				onDismiss={() => setOpenProfitCalcModal(false)}
				isOpen={true}
				/**
				 * @todo IDK how to make this comply with this project's style, e.g.
				 *       `t('modals.confirm-transaction.title')`
				 */
				title={t('Profit Calculator')}
			>
				<ProfitCalcContainer>
					<form onSubmit={handleProfitCalcSubmit}>
						<LabelText>Entry Price: </LabelText>
						<StyledLabel>
							<StyledInput
								placeholder={'$43,938.11'}
								inputMode={'decimal'}
								type={'number'}
								onChange={handleSetEntryPrice}
							/>
						</StyledLabel>
						{/* LEFT column */}
						<LeftColumn>
							<LabelText>Exit Price: </LabelText>
							<StyledLabel>
								<StyledInput
									placeholder={'$46,939.11'}
									inputMode={'decimal'}
									type={'number'}
									onChange={handleSetExitPrice}
								/>
							</StyledLabel>
							<LabelText>Stop Loss: </LabelText>
							<StyledLabel>
								<StyledInput
									placeholder={'$32,000.00'}
									inputMode={'decimal'}
									type={'number'}
									onChange={handleSetStopLoss}
								/>
							</StyledLabel>
							<LabelText>Position Size: </LabelText>
							<StyledLabel>
								<StyledInput
									placeholder={`23.1 ${marketAsset}`}
									inputMode={'decimal'}
									type={'number'}
									onChange={handleSetMarketAssetPositionSize}
								/>
							</StyledLabel>
						</LeftColumn>
						{/* RIGHT column */}
						<RightColumn>
							<LabelText>Gas %: </LabelText>
							<StyledLabel>
								<StyledInput
									placeholder={'5.55%'}
									inputMode={'decimal'}
									type={'number'}
									onChange={handleSetGainPercent}
								/>
							</StyledLabel>
							<LabelText>Loss %: </LabelText>
							<StyledLabel>
								<StyledInput
									placeholder={'4.1%'}
									inputMode={'decimal'}
									type={'number'}
									onChange={handleSetLossPercent}
								/>
							</StyledLabel>
							<LabelText>Position Size: </LabelText>
							<StyledLabel>
								<StyledInput
									placeholder={'$305,532.28'}
									inputMode={'decimal'}
									type={'number'}
									onChange={handleSetBasePositionSize}
								/>
							</StyledLabel>
						</RightColumn>
					</form>
				</ProfitCalcContainer>
			</BaseModal>
		</>
	);
};

const LeftColumn = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: left;
`;

const RightColumn = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: right;
`;

const ProfitCalcContainer = styled.div`
	width: 624px;
	height: 789px;
	left: 408px;
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

// const ExitPrice = styled.input`
// 	/* Rectangle 2050 */

// 	color: #ece8e3;

// 	width: 247px;
// 	height: 46px;
// 	left: 466px;
// 	top: 429px;

// 	background: linear-gradient(180deg, #101010 33.26%, rgba(24, 24, 24, 0.37) 100%);
// 	border: 1px solid rgba(255, 255, 255, 0.1);
// 	box-sizing: border-box;
// 	border-radius: 6px;
// `;

const StyledInput = styled.input`
	/* Rectangle 2050 */

	color: #ece8e3;
	// width: 508px;
	// height: 46px;
	// left: 466px;
	// top: 348px;

	background: linear-gradient(180deg, #101010 33.26%, rgba(24, 24, 24, 0.37) 100%);
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-sizing: border-box;
	border-radius: 6px;
`;

export default ProfitCalculator;
