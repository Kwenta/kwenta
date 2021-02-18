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
} from 'styles/common';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';

export type ShortCRatioLevel = 'safe' | 'safeMax' | 'highRisk';

export const SHORT_C_RATIO: Record<ShortCRatioLevel, number> = {
	safe: 2,
	safeMax: 1.65,
	highRisk: 1.55,
};

export const shortCRatios = Object.entries(SHORT_C_RATIO) as [ShortCRatioLevel, number][];

type CRatioSelectorProps = {};

export const CRatioSelector: FC<CRatioSelectorProps> = () => {
	const { t } = useTranslation();

	const [selectedShortCRatio, setSelectedShortCRatio] = useRecoilState(shortCRatioState);
	const [customShortCRatio, setCustomShortCRatio] = useRecoilState(customShortCRatioState);
	const [tooltipOpened, setTooltipOpened] = useState<boolean>(false);

	const hasCustomShortCRatio = useMemo(() => customShortCRatio !== '', [customShortCRatio]);

	const shortCRatio = useMemo(
		() => (hasCustomShortCRatio ? Number(customShortCRatio) / 100 : selectedShortCRatio),
		[hasCustomShortCRatio, selectedShortCRatio, customShortCRatio]
	);

	const shortCRatioTooLow = useMemo(() => shortCRatio < SHORT_C_RATIO.highRisk, [shortCRatio]);

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
				<DropdownSelection
					role="button"
					tooltipOpened={tooltipOpened}
					shortCRatioTooLow={shortCRatioTooLow}
				>
					{formatPercent(shortCRatio, { minDecimals: 0 })}{' '}
					<Svg src={CaretDownIcon} viewBox={`0 0 ${CaretDownIcon.width} ${CaretDownIcon.height}`} />
				</DropdownSelection>
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

export const DropdownSelection = styled.span<{
	tooltipOpened: boolean;
	shortCRatioTooLow: boolean;
}>`
	user-select: none;
	display: inline-flex;
	align-items: center;
	font-family: ${(props) => props.theme.fonts.bold};
	padding-left: 5px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
	svg {
		color: ${(props) => props.theme.colors.goldColors.color3};
		width: 10px;
		margin-left: 5px;
		transition: transform 0.2s ease-in-out;
		${(props) =>
			props.tooltipOpened &&
			css`
				transform: rotate(-180deg);
			`};
	}
	${(props) =>
		props.shortCRatioTooLow &&
		css`
			color: ${(props) => props.theme.colors.red};
		`}
`;

export default CRatioSelector;
