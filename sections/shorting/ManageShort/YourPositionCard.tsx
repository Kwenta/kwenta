import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import { FlexDivCol, FlexDivRow, BoldText } from 'styles/common';
import { Short } from 'queries/short/types';
import { formatNumber, formatPercent } from 'utils/formatters/number';
import { formatDateWithTime } from 'utils/formatters/date';
import Etherscan from 'containers/Etherscan';
import { ExternalLink } from 'styles/common';
import { NO_VALUE } from 'constants/placeholder';
import LinkIcon from 'assets/svg/app/link.svg';

interface YourPositionCardProps {
	short: Short;
}

const YourPositionCard: FC<YourPositionCardProps> = ({ short }) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	return (
		<Container>
			<SectionRow>
				<Subtitle>{t('shorting.history.manageShort.subtitle')}</Subtitle>
				{etherscanInstance != null && short.txHash ? (
					<StyledExternalLink href={etherscanInstance.txLink(short.txHash)}>
						<StyledLinkIcon src={LinkIcon} viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`} />
					</StyledExternalLink>
				) : (
					NO_VALUE
				)}
			</SectionRow>
			<SectionRow>
				<InnerRow>
					<LightFieldText>
						{t('shorting.history.manageShort.fields.collateral', { asset: short.collateralLocked })}
					</LightFieldText>
					<DataField>{formatNumber(short.collateralLockedAmount)}</DataField>
				</InnerRow>
				<InnerRow>
					<LightFieldText>{t('shorting.history.manageShort.fields.shorting')}</LightFieldText>
					<DataField>{`${formatNumber(short.synthBorrowedAmount)} ${
						short.synthBorrowed
					}`}</DataField>
				</InnerRow>
			</SectionRow>
			<SectionRow>
				<InnerRow>
					<LightFieldText>
						{t('shorting.history.manageShort.fields.liquidationPrice', {
							asset: short.collateralLocked,
						})}
					</LightFieldText>
					<DataField>
						{formatNumber(
							(short.collateralLockedAmount * short.collateralLockedPrice) /
								(short.synthBorrowedAmount * (short.contractData?.minCratio ?? 0))
						)}
					</DataField>
				</InnerRow>
				<InnerRow>
					<LightFieldText>
						{t('shorting.history.manageShort.fields.collateralRatio')}
					</LightFieldText>
					<DataField>
						{formatPercent(
							(short.collateralLockedAmount * short.collateralLockedPrice) /
								(short.synthBorrowedAmount * short.synthBorrowedPrice)
						)}
					</DataField>
				</InnerRow>
			</SectionRow>
			<SectionRow>
				<InnerRow>
					<LightFieldText>
						{t('shorting.history.manageShort.fields.interestRate', {
							asset: short.synthBorrowed,
						})}
					</LightFieldText>
					<DataField>{formatNumber(0)}</DataField>
				</InnerRow>
				<InnerRow>
					<LightFieldText>
						{t('shorting.history.manageShort.fields.interestAccrued')}
					</LightFieldText>
					<DataField>{formatPercent(short.interestAccrued)}</DataField>
				</InnerRow>
			</SectionRow>
			<SectionRow>
				<InnerRow>
					<LightFieldText>
						{t('shorting.history.manageShort.fields.profitLoss', { asset: short.collateralLocked })}
					</LightFieldText>
					{/* 
				      need to put profit loss here. this is just a placeholder for now
				    */}
					<DataField profitLoss={1}>{formatNumber(1)}</DataField>
				</InnerRow>
				<InnerRow>
					<LightFieldText>{t('shorting.history.manageShort.fields.date')}</LightFieldText>
					<DataField>{formatDateWithTime(short.createdAt)}</DataField>
				</InnerRow>
			</SectionRow>
		</Container>
	);
};

const Container = styled(FlexDivCol)`
	font-family: ${(props) => props.theme.fonts.mono};
	border-radius: 4px;
	background-color: ${(props) => props.theme.colors.elderberry};
	width: 100%;
	margin-bottom: 30px;
`;

const Subtitle = styled(BoldText)`
	font-size: 16px;
	color: ${(props) => props.theme.colors.white};
	padding-left: 20px;
`;

const StyledExternalLink = styled(ExternalLink)`
	padding-right: 20px;
`;

const InnerRow = styled(FlexDivRow)`
	height: 35px;
	width: calc(50% - 20px);
	padding: 0 20px;
`;

const SectionRow = styled(FlexDivRow)`
	height: 45px;
	padding: 14px;
	border-bottom: 0.5px solid ${(props) => props.theme.colors.navy};
	&:last-child {
		border-bottom: none;
	}
`;

const LightFieldText = styled.div`
	color: ${(props) => props.theme.colors.blueberry};
`;

const DataField = styled.div<{ profitLoss?: number }>`
	color: ${(props) =>
		props.profitLoss != null
			? props.profitLoss >= 0
				? props.theme.colors.green
				: props.theme.colors.red
			: props.theme.colors.white};
`;

const StyledLinkIcon = styled(Svg)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

export default YourPositionCard;
