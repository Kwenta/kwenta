import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import InfoIcon from 'assets/svg/app/info.svg';

import Button from 'components/Button';

import { SummaryItem, SummaryItemLabel, SummaryItemValue } from '../common';
import { Tooltip, NumericValue, FlexDivRowCentered } from 'styles/common';

import { formatPercent } from 'utils/formatters/number';
import NumericInput from 'components/Input/NumericInput';
import Tippy from '@tippyjs/react';

type SlippageSelectProps = {
	setMaxSlippageTolerance: (num: string) => void;
	maxSlippageTolerance: string;
};

const SlippageSelect: React.FC<SlippageSelectProps> = ({
	maxSlippageTolerance,
	setMaxSlippageTolerance,
	...rest
}) => {
	const { t } = useTranslation();

	const SLIPPAGE_VALUES = useMemo(
		() => [
			{
				text: t('common.summary.max-slippage-tolerance.low'),
				value: '0.001',
			},
			{
				text: t('common.summary.max-slippage-tolerance.medium'),
				value: '0.005',
			},
			{
				text: t('common.summary.max-slippage-tolerance.high'),
				value: '0.01',
			},
		],
		[t]
	);

	return (
		<SummaryItem {...rest}>
			<FlexDivRowCentered>
				<SummaryItemLabel>{t('common.summary.max-slippage-tolerance.title')}</SummaryItemLabel>
				<SlippageHelperTooltip content={<span>{t('')}</span>} arrow={false}>
					<InfoIconWrapper>
						<Svg src={InfoIcon} />
					</InfoIconWrapper>
				</SlippageHelperTooltip>
			</FlexDivRowCentered>
			<SummaryItemValue>
				<span>{formatPercent(maxSlippageTolerance)}</span>
				<Tooltip
					trigger="click"
					arrow={false}
					content={
						<SlippageSelectContainer>
							<CustomSlippageContainer>
								<CustomSlippage
									value={maxSlippageTolerance}
									onChange={(_, value) => setMaxSlippageTolerance(value)}
									placeholder={t('common.custom')}
								/>
							</CustomSlippageContainer>
							{SLIPPAGE_VALUES.map(({ text, value }) => (
								<StyedSlippageButton
									key={text}
									variant="select"
									onClick={() => setMaxSlippageTolerance(value)}
									isActive={maxSlippageTolerance === value}
								>
									<span>{text}</span>
									<NumericValue>{formatPercent(value)}</NumericValue>
								</StyedSlippageButton>
							))}
						</SlippageSelectContainer>
					}
					interactive={true}
				>
					<StyledSlippageEditButton role="button">{t('common.edit')}</StyledSlippageEditButton>
				</Tooltip>
			</SummaryItemValue>
		</SummaryItem>
	);
};
export default SlippageSelect;

const SlippageSelectContainer = styled.div`
	padding: 16px 0 8px 0;
`;

const CustomSlippageContainer = styled.div`
	margin: 0 10px 5px 10px;
`;

const SlippageHelperTooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.elderberry};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 120px;
	.tippy-content {
		padding: 0;
	}
`;

const CustomSlippage = styled(NumericInput)`
	width: 100%;
	border: 0;
	font-size: 12px;
	::placeholder {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

const StyedSlippageButton = styled(Button)`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 10px;
	padding-right: 10px;
`;

const InfoIconWrapper = styled.span`
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	svg {
		margin-left: 5px;
	}
`;

const StyledSlippageEditButton = styled.span`
	font-family: ${(props) => props.theme.fonts.bold};
	padding-left: 5px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.goldColors.color3};
	text-transform: uppercase;
`;
