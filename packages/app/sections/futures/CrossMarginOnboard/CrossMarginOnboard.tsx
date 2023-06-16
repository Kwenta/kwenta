import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CompleteCheck from 'assets/svg/futures/onboard-complete-check.svg';
import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import Loader from 'components/Loader';
import ProgressSteps from 'components/ProgressSteps';
import { setOpenModal } from 'state/app/reducer';
import { approveCrossMargin, createCrossMarginAccount } from 'state/futures/actions';
import {
	selectCMAccountQueryStatus,
	selectSmartMarginDepositApproved,
	selectCrossMarginAccount,
	selectFuturesSupportedNetwork,
	selectSubmittingFuturesTx,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';

import CrossMarginFAQ from './CrossMarginFAQ';

type Props = {
	isOpen: boolean;
};

export default function CrossMarginOnboard({ isOpen }: Props) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const crossMarginAvailable = useAppSelector(selectFuturesSupportedNetwork);
	const crossMarginAccount = useAppSelector(selectCrossMarginAccount);
	const queryStatus = useAppSelector(selectCMAccountQueryStatus);
	const depositApproved = useAppSelector(selectSmartMarginDepositApproved);
	const txProcessing = useAppSelector(selectSubmittingFuturesTx);
	const preview = useAppSelector(selectTradePreview);

	const onClose = () => dispatch(setOpenModal(null));

	const onComplete = () => {
		if (preview) {
			dispatch(setOpenModal('futures_confirm_smart_margin_trade'));
		} else {
			onClose();
		}
	};

	const createAccount = useCallback(async () => {
		dispatch(createCrossMarginAccount());
	}, [dispatch]);

	const onClickApprove = useCallback(async () => {
		dispatch(approveCrossMargin());
	}, [dispatch]);

	const renderProgress = (step: number, complete?: boolean) => {
		return (
			<ProgressContainer>
				<ProgressSteps step={step} totalSteps={3} complete={complete} />
			</ProgressContainer>
		);
	};

	const renderContent = () => {
		if (!crossMarginAvailable) {
			return <ErrorView message={t('futures.modals.onboard.unsupported-network')} />;
		}
		if (!crossMarginAccount && queryStatus.status === FetchStatus.Loading) {
			return (
				<LoaderContainer>
					<Loader />
				</LoaderContainer>
			);
		}

		if (depositApproved) {
			return (
				<>
					<Intro>{t('futures.modals.onboard.step3-complete')}</Intro>
					<Complete>
						<CompleteCheck />
					</Complete>
					{renderProgress(3, true)}
					<StyledButton variant="flat" onClick={onComplete}>
						Done
					</StyledButton>
				</>
			);
		}

		if (crossMarginAccount && !depositApproved) {
			return (
				<>
					<Intro>{t('futures.modals.onboard.step2-intro')}</Intro>
					<div>
						<FAQHeader>FAQ:</FAQHeader>
						<CrossMarginFAQ />
					</div>
					{renderProgress(2)}
					<StyledButton variant="flat" onClick={onClickApprove} disabled={txProcessing}>
						{txProcessing ? <Loader /> : 'Approve'}
					</StyledButton>
				</>
			);
		}

		// TODO: Replace with bridge option

		// if (crossMarginAccount) {
		// 	return (
		// 		<>
		// 			<Intro>{t('futures.modals.onboard.step3-intro')}</Intro>
		// 			<InputBalanceLabel
		// 				balance={susdBal || ZERO_WEI}
		// 				currencyKey="sUSD"
		// 				onSetAmount={setDepositAmount}
		// 			/>
		// 			<NumericInput placeholder="0.00" value={depositAmount} onChange={onEditAmount} />
		// 			{renderProgress(3)}
		// 			{isDepositDisabled && (
		// 				<MinimumAmountDisclaimer>
		// 					{t('futures.market.trade.margin.modal.deposit.disclaimer')}
		// 				</MinimumAmountDisclaimer>
		// 			)}
		// 			<StyledButton
		// 				disabled={isDepositDisabled || txProcessing}
		// 				variant="flat"
		// 				textTransform="none"
		// 				onClick={depositToAccount}
		// 			>
		// 				{txProcessing ? <Loader /> : 'Deposit sUSD'}
		// 			</StyledButton>
		// 		</>
		// 	);
		// }

		return (
			<>
				<Intro>{t('futures.modals.onboard.step1-intro')}</Intro>
				<div>
					<FAQHeader>FAQ:</FAQHeader>
					<CrossMarginFAQ />
				</div>
				{renderProgress(1)}
				<StyledButton noOutline onClick={createAccount} disabled={txProcessing}>
					{txProcessing ? <Loader /> : 'Create Account'}
				</StyledButton>
			</>
		);
	};

	return (
		<StyledBaseModal onDismiss={onClose} isOpen={isOpen} title={t('futures.modals.onboard.title')}>
			{renderContent()}
		</StyledBaseModal>
	);
}

const StyledBaseModal = styled(BaseModal)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

const StyledButton = styled(Button)`
	margin-top: 24px;
	height: 50px;
	width: 100%;
`;

const FAQHeader = styled.div`
	padding-bottom: 4px;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	margin-bottom: 5px;
`;

const ProgressContainer = styled.div`
	margin-top: 30px;
`;

const Intro = styled.div`
	margin-bottom: 30px;
`;

const Complete = styled.div`
	padding: 40px;
	text-align: center;
`;

const LoaderContainer = styled.div`
	height: 120px;
`;
