import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CurrencyKey } from 'constants/currency';

import BalancerImage from 'assets/svg/providers/balancer.svg';

import { CenteredModal } from '../common';

type BalancerApproveModalProps = {
	onDismiss: () => void;
	synth: CurrencyKey;
	approveError: string | null;
};

export const BalancerApproveModal: FC<BalancerApproveModalProps> = ({
	onDismiss,
	synth,
	approveError,
}) => {
	const { t } = useTranslation();
	return (
		<StyledCenteredModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('modals.afterHours.approve', { synth })}
			lowercase={true}
		>
			<InnerModalWrap>
				<IconWrap>
					<BalancerImage
						alt={t('common.dex-aggregators.balancer.title')}
						width="48px"
						height="48px"
					/>
				</IconWrap>
				<SubText>{t('modals.afterHours.balancer-pool')}</SubText>
				<ConfirmText>{t('modals.afterHours.confirm-text')}</ConfirmText>
				{approveError != null ? <ErrorText>{approveError}</ErrorText> : null}
			</InnerModalWrap>
		</StyledCenteredModal>
	);
};

const StyledCenteredModal = styled(CenteredModal)`
	padding: 10px;
	text-align: center;
	.card {
		width: 420px;
		margin: 0 auto;
	}
`;

const InnerModalWrap = styled.div`
	text-align: center;
`;

const IconWrap = styled.div`
	padding: 20px 0 5px 0;
	margin: 0 auto;
`;

const ErrorText = styled.div`
	color: ${(props) => props.theme.colors.red};
`;

const SubText = styled.div`
	color: ${(props) => props.theme.colors.white};
	padding: 20px 0;
`;

const ConfirmText = styled.div`
	color: ${(props) => props.theme.colors.silver};
	padding: 20px 0;
`;

export default BalancerApproveModal;
