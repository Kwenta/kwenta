import { useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import { futuresAccountState } from 'store/futures';

import CrossMarginOnboard from '../CrossMarginOnboard';

export default function AccountTypeToggle() {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [accountState, setAccountState] = useRecoilState(futuresAccountState);

	const onCreatedAccount = () => {
		// TODO: handle complete
	};

	const onSelectCrossMargin = () => {
		accountState.crossMarginAddress
			? setAccountState({
					...accountState,
					selectedAccountType: 'cross_margin',
					selectedFuturesAddress: accountState.crossMarginAddress,
			  })
			: setOpenModal(true);
	};

	return (
		<>
			<CrossMarginOnboard
				isOpen={!!openModal}
				onClose={() => setOpenModal(false)}
				onComplete={onCreatedAccount}
			/>

			{accountState.selectedAccountType === 'cross_margin' ? (
				<LegacyFuturesButton
					onClick={() =>
						setAccountState({
							...accountState,
							selectedAccountType: 'isolated_margin',
							selectedFuturesAddress: accountState.walletAddress,
						})
					}
				>
					← Switch to Legacy Futures
				</LegacyFuturesButton>
			) : (
				<SwitchAccountButton variant="primary" onClick={onSelectCrossMargin}>
					Switch to Cross Margin
				</SwitchAccountButton>
			)}
		</>
	);
}

const SwitchAccountButton = styled(Button)`
	margin-bottom: 24px;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
	width: 100%;
`;

const LegacyFuturesButton = styled.div`
	cursor: pointer;
	margin-bottom: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
`;
