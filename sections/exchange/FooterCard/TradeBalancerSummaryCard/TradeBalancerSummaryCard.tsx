import { FC, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { customGasPriceState, gasSpeedState } from 'store/wallet';
import { useRecoilState } from 'recoil';
import { Svg } from 'react-optimized-image';
import BigNumber from 'bignumber.js';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';

import { NO_VALUE, ESTIMATE_VALUE } from 'constants/placeholder';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';

import { numericValueCSS, NumericValue, FlexDivRowCentered, FlexDivCol } from 'styles/common';

import { formatPercent } from 'utils/formatters/number';
import { GasPrices, GAS_SPEEDS } from '@synthetixio/queries/build/node/queries/network/useEthGasPriceQuery';

type TradeBalancerSummaryCardProps = {
	submissionDisabledReason: ReactNode;
	onSubmit: () => void;
	gasPrices: GasPrices | undefined;
	estimatedSlippage: BigNumber;
	setMaxSlippageTolerance: (num: string) => void;
	maxSlippageTolerance: string;
	isApproved?: boolean;
};

const TradeBalancerSummaryCard: FC<TradeBalancerSummaryCardProps> = ({
	submissionDisabledReason,
	onSubmit,
	gasPrices,
	estimatedSlippage,
	maxSlippageTolerance,
	setMaxSlippageTolerance,
	isApproved = true,
}) => {
	const { t } = useTranslation();
	const [gasSpeed, setGasSpeed] = useRecoilState<keyof GasPrices>(gasSpeedState);
	const [customGasPrice, setCustomGasPrice] = useRecoilState(customGasPriceState);

	const SLIPPAGE_VALUES = useMemo(
		() => [
			{
				text: t('modals.afterHours.slippage-levels.low'),
				value: '0.001',
			},
			{
				text: t('modals.afterHours.slippage-levels.medium'),
				value: '0.005',
			},
			{
				text: t('modals.afterHours.slippage-levels.high'),
				value: '0.01',
			},
		],
		[t]
	);
	const hasCustomGasPrice = customGasPrice !== '';
	const gasPrice = gasPrices ? gasPrices[gasSpeed] : null;

	const isSubmissionDisabled = useMemo(() => (submissionDisabledReason != null ? true : false), [
		submissionDisabledReason,
	]);

	const gasPriceItem = hasCustomGasPrice ? (
		<span data-testid="gas-price">{Number(customGasPrice)}</span>
	) : (
		<span data-testid="gas-price">
			{ESTIMATE_VALUE} {gasPrice}
		</span>
	);

	return (
		<SummaryItems>
			<SummaryItem>
				<SummaryItemLabel>{t('modals.afterHours.max-slippage-tolerance')}</SummaryItemLabel>
				<SummaryItemValue>
					<FlexDivRowCentered>
						<span>{formatPercent(maxSlippageTolerance)}</span>
						<Tooltip
							trigger="click"
							arrow={false}
							content={
								<GasSelectContainer>
									<CustomGasPriceContainer>
										<CustomGasPrice
											value={maxSlippageTolerance}
											onChange={(_, value) => setMaxSlippageTolerance(value)}
											placeholder={t('common.custom')}
										/>
									</CustomGasPriceContainer>
									{SLIPPAGE_VALUES.map(({ text, value }) => (
										<StyedGasButton
											key={text}
											variant="select"
											onClick={() => setMaxSlippageTolerance(value)}
											isActive={maxSlippageTolerance === value}
										>
											<span>{text}</span>
											<NumericValue>{formatPercent(value)}</NumericValue>
										</StyedGasButton>
									))}
								</GasSelectContainer>
							}
							interactive={true}
						>
							<StyledIconWrap role="button">
								<Svg src={CaretDownIcon} />
							</StyledIconWrap>
						</Tooltip>
					</FlexDivRowCentered>
				</SummaryItemValue>
			</SummaryItem>
			<SummaryItem>
				<SummaryItemLabel>{t('modals.afterHours.estimated-slippage')}</SummaryItemLabel>
				<SummaryItemValue>{formatPercent(estimatedSlippage.toNumber())}</SummaryItemValue>
			</SummaryItem>
			<SummaryItem>
				<SummaryItemLabel>{t('exchange.summary-info.gas-price-gwei')}</SummaryItemLabel>
				<SummaryItemValue>
					{gasPrice != null ? (
						<FlexDivRowCentered>
							<span>{gasPriceItem}</span>
							<Tooltip
								trigger="click"
								arrow={false}
								content={
									<GasSelectContainer>
										<CustomGasPriceContainer>
											<CustomGasPrice
												value={customGasPrice}
												onChange={(_, value) => setCustomGasPrice(value)}
												placeholder={t('common.custom')}
											/>
										</CustomGasPriceContainer>
										{GAS_SPEEDS.map((speed) => (
											<StyedGasButton
												key={speed}
												variant="select"
												onClick={() => {
													setCustomGasPrice('');
													setGasSpeed(speed);
												}}
												isActive={hasCustomGasPrice ? false : gasSpeed === speed}
											>
												<span>{t(`common.gas-prices.${speed}`)}</span>
												<NumericValue>{gasPrices![speed]}</NumericValue>
											</StyedGasButton>
										))}
									</GasSelectContainer>
								}
								interactive={true}
							>
								<StyledIconWrap role="button">
									<Svg src={CaretDownIcon} />
								</StyledIconWrap>
							</Tooltip>
						</FlexDivRowCentered>
					) : (
						NO_VALUE
					)}
				</SummaryItemValue>
			</SummaryItem>
			<StyledButton
				variant="primary"
				isRounded={true}
				disabled={isSubmissionDisabled}
				onClick={onSubmit}
				size="lg"
				data-testid="submit-order"
			>
				{isSubmissionDisabled
					? submissionDisabledReason
					: !isApproved
					? t('exchange.summary-info.button.approve-balancer')
					: t('exchange.summary-info.button.submit-order')}
			</StyledButton>
		</SummaryItems>
	);
};

const SummaryItems = styled(FlexDivCol)`
	margin: 10px auto;
`;

const SummaryItem = styled(FlexDivRowCentered)`
	border-bottom: 0.5px solid ${(props) => props.theme.colors.navy};
	height: 40px;
	width: 320px;
`;

const SummaryItemLabel = styled.div`
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.blueberry};
`;

const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	${numericValueCSS};
`;

const Tooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.elderberry};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 120px;
	.tippy-content {
		padding: 0;
	}
`;

const StyledButton = styled(Button)`
	margin: 20px auto 0 auto;
	width: 320px;
`;

const GasSelectContainer = styled.div`
	padding: 16px 0 8px 0;
`;

const CustomGasPriceContainer = styled.div`
	margin: 0 10px 5px 10px;
`;

const CustomGasPrice = styled(NumericInput)`
	width: 100%;
	border: 0;
	font-size: 12px;
	::placeholder {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

const StyedGasButton = styled(Button)`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 10px;
	padding-right: 10px;
`;

const StyledIconWrap = styled.span`
	padding: 4px 0 0 8px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.goldColors.color3};
`;

export default TradeBalancerSummaryCard;
