import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useRecoilState } from 'recoil';

import { customShortCRatioState, shortCRatioState } from 'store/ui';
import { formatPercent } from 'utils/formatters/number';

import { Svg } from 'react-optimized-image';

import {
	NumericValue,
	SolidTooltip,
	SolidTooltipContent,
	SolidTooltipCustomValue,
	SolidTooltipCustomValueContainer,
	SolidTooltipItemButton,
	DropdownSelection,
} from 'styles/common';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';

import { shortCRatios } from './constants';
import { wei } from '@synthetixio/wei';

type CRatioSelectorProps = {};

export const CRatioSelector: FC<CRatioSelectorProps> = () => {
	const { t } = useTranslation();

	const [selectedShortCRatio, setSelectedShortCRatio] = useRecoilState(shortCRatioState);
	const [customShortCRatio, setCustomShortCRatio] = useRecoilState(customShortCRatioState);
	const [tooltipOpened, setTooltipOpened] = useState<boolean>(false);

	const hasCustomShortCRatio = useMemo(() => customShortCRatio !== '', [customShortCRatio]);

	const collateralShortContractInfoQuery = useCollateralShortContractInfoQuery();

	const collateralShortContractInfo = collateralShortContractInfoQuery.isSuccess
		? collateralShortContractInfoQuery?.data ?? null
		: null;

	const minCratio = collateralShortContractInfo?.minCollateralRatio;

	const shortCRatio = useMemo(
		() => (hasCustomShortCRatio ? Number(customShortCRatio) / 100 : selectedShortCRatio),
		[hasCustomShortCRatio, selectedShortCRatio, customShortCRatio]
	);

	const shortCRatioTooLow = useMemo(
		() => (minCratio != null ? wei(shortCRatio).lt(minCratio) : false),
		[shortCRatio, minCratio]
	);
	return (
		<Container>
			<Label>{t('shorting.common.cRatio')}</Label>
			<StyledSolidTooltip
				onShow={() => setTooltipOpened(true)}
				onHide={() => setTooltipOpened(false)}
				offset={[0, 20]}
				content={
					<SolidTooltipContent>
						<SolidTooltipCustomValueContainer>
							<SolidTooltipCustomValue
								value={customShortCRatio}
								onChange={(_, value) => setCustomShortCRatio(value)}
								placeholder={t('common.custom')}
							/>
						</SolidTooltipCustomValueContainer>
						{shortCRatios.map(([shortCRatioLevel, shortCRatioValue]) => (
							<SolidTooltipItemButton
								key={shortCRatioLevel}
								variant="select"
								onClick={() => {
									setCustomShortCRatio('');
									setSelectedShortCRatio(shortCRatioValue);
								}}
								isActive={hasCustomShortCRatio ? false : shortCRatioValue === selectedShortCRatio}
							>
								<span>{t(`shorting.c-ratio.${shortCRatioLevel}`)}</span>
								<NumericValue>{formatPercent(shortCRatioValue, { minDecimals: 0 })}</NumericValue>
							</SolidTooltipItemButton>
						))}
					</SolidTooltipContent>
				}
			>
				<StyledDropdownSelection
					tooltipOpened={tooltipOpened}
					shortCRatioTooLow={shortCRatioTooLow}
				>
					{formatPercent(shortCRatio, { minDecimals: 0 })}{' '}
					<Svg src={CaretDownIcon} viewBox={`0 0 ${CaretDownIcon.width} ${CaretDownIcon.height}`} />
				</StyledDropdownSelection>
			</StyledSolidTooltip>
		</Container>
	);
};

const StyledSolidTooltip = styled(SolidTooltip)`
	width: 130px;
`;

const Container = styled.div`
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const Label = styled.div`
	color: ${(props) => props.theme.colors.silver};
`;

export const StyledDropdownSelection = styled(DropdownSelection)<{
	shortCRatioTooLow: boolean;
}>`
	${(props) =>
		props.shortCRatioTooLow &&
		css`
			color: ${(props) => props.theme.colors.red};
		`}
`;

export default CRatioSelector;
