import React from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
	leverageSideState,
	leverageState,
	marketInfoState,
	maxLeverageState,
	orderTypeState,
	positionState,
	potentialTradeDetailsState,
	sizeDeltaState,
	tradeSizeState,
} from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import { useTranslation } from 'react-i18next';
import ClosePositionModal from '../PositionCard/ClosePositionModal';
import { PositionSide } from 'queries/futures/types';

type ManagePositionProps = {
	translationKey: string;
	marketCapReached: boolean;
	error: string | null;
	orderError: string | null;
	openConfirmationModal(): void;
};

const ManagePosition: React.FC<ManagePositionProps> = ({
	translationKey,
	marketCapReached,
	openConfirmationModal,
	error,
	orderError,
}) => {
	const { t } = useTranslation();
	const leverage = useRecoilValue(leverageState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const position = useRecoilValue(positionState);
	const maxLeverageValue = useRecoilValue(maxLeverageState);
	const marketInfo = useRecoilValue(marketInfoState);
	const previewTrade = useRecoilValue(potentialTradeDetailsState);
	const positionDetails = position?.position;
	const orderType = useRecoilValue(orderTypeState);
	const [, setLeverageSide] = useRecoilState(leverageSideState);
	const [, setTradeSize] = useRecoilState(tradeSizeState);
	const [isCancelModalOpen, setCancelModalOpen] = React.useState(false);

	return (
		<>
			<div>
				<ManageOrderTitle>
					Manage&nbsp; —<span>&nbsp; Adjust your position</span>
				</ManageOrderTitle>

				<ManagePositionContainer>
					<PlaceOrderButton
						data-testid="trade-open-position-button"
						noOutline
						fullWidth={true}
						disabled={
							!leverage ||
							Number(leverage) < 0 ||
							Number(leverage) > maxLeverageValue.toNumber() ||
							sizeDelta.eq(zeroBN) ||
							!!error ||
							translationKey === 'futures.market.trade.button.deposit-margin-minimum' ||
							marketInfo?.isSuspended ||
							marketCapReached
						}
						onClick={openConfirmationModal}
					>
						{t(translationKey)}
					</PlaceOrderButton>

					<CloseOrderButton
						data-testid="trade-close-position-button"
						fullWidth={true}
						noOutline={true}
						variant="danger"
						onClick={() => {
							if (orderType === 1 && position?.position?.size) {
								const newTradeSize = position.position.size;
								const newLeverageSide =
									position.position.side === PositionSide.LONG
										? PositionSide.SHORT
										: PositionSide.LONG;
								setLeverageSide(newLeverageSide);
								setTradeSize(newTradeSize.toString());
								openConfirmationModal();
							} else {
								setCancelModalOpen(true);
							}
						}}
						disabled={!positionDetails || marketInfo?.isSuspended}
					>
						{t('futures.market.user.position.close-position')}
					</CloseOrderButton>
				</ManagePositionContainer>
			</div>

			{(orderError || error || previewTrade?.showStatus) && (
				<ErrorMessage>{orderError || error || previewTrade?.statusMessage}</ErrorMessage>
			)}

			{isCancelModalOpen && <ClosePositionModal onDismiss={() => setCancelModalOpen(false)} />}
		</>
	);
};

const ManagePositionContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 15px;
	margin-bottom: 16px;
`;

const PlaceOrderButton = styled(Button)`
	font-size: 16px;
	height: 55px;
	text-align: center;
	white-space: normal;
`;

const CloseOrderButton = styled(Button)`
	font-size: 16px;
	height: 55px;
	text-align: center;
	white-space: normal;
	background: rgba(239, 104, 104, 0.04);
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.red};
	transition: all 0s ease-in-out;

	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.red};
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}

	&:disabled {
		border: ${(props) => props.theme.colors.selectedTheme.border};
		background: transparent;
		color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		transform: none;
	}
`;

const ManageOrderTitle = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 13px;
	margin-bottom: 8px;
	margin-left: 14px;

	span {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

const ErrorMessage = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.red};
	font-size: 12px;
	margin-bottom: 16px;
`;

export default ManagePosition;
