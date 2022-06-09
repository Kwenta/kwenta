import React from 'react';
import styled from 'styled-components';

import Button from 'components/Button';
import { useRecoilValue } from 'recoil';
import {
	leverageState,
	marketInfoState,
	maxLeverageState,
	positionState,
	sizeDeltaState,
} from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import { useTranslation } from 'react-i18next';
import ClosePositionModal from '../PositionCard/ClosePositionModal';

type ManagePositionProps = {
	translationKey: string;
	marketCapReached: boolean;
	error: string | null;
	openConfirmationModal(): void;
};

const ManagePosition: React.FC<ManagePositionProps> = ({
	translationKey,
	marketCapReached,
	openConfirmationModal,
	error,
}) => {
	const { t } = useTranslation();
	const leverage = useRecoilValue(leverageState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const position = useRecoilValue(positionState);
	const maxLeverageValue = useRecoilValue(maxLeverageState);
	const marketInfo = useRecoilValue(marketInfoState);
	const positionDetails = position?.position;
	const [isCancelModalOpen, setCancelModalOpen] = React.useState(false);

	return (
		<>
			<div>
				<ManageOrderTitle>
					Manage&nbsp; —<span>&nbsp; Adjust your position</span>
				</ManageOrderTitle>

				<ManagePositionContainer>
					<PlaceOrderButton
						variant="primary"
						fullWidth
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
						isRounded
						fullWidth
						variant="danger"
						onClick={() => setCancelModalOpen(true)}
						disabled={!positionDetails || marketInfo?.isSuspended}
						noOutline
					>
						{t('futures.market.user.position.close-position')}
					</CloseOrderButton>
				</ManagePositionContainer>
			</div>

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
	border: 1px solid #ef6868;
	box-shadow: none;
	transition: all 0s ease-in-out;

	&:hover {
		background: ${(props) => props.theme.colors.common.primaryRed};
		color: ${(props) => props.theme.colors.white};
		transform: scale(0.98);
	}

	&:disabled {
		border: ${(props) => props.theme.colors.selectedTheme.border};
		background: transparent;
		color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		transform: none;
	}
`;

const ManageOrderTitle = styled.p`
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-size: 12px;
	margin-bottom: 8px;
	margin-left: 14px;

	span {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

export default ManagePosition;
