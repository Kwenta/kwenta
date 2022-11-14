import { useState } from 'react';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import localStore from 'utils/localStore';
import logError from 'utils/logError';
import { useRouter } from 'next/router';

export default function AcknowledgementModal() {
	const { walletAddress, signer } = Connector.useContainer();
	const router = useRouter();
	const [signedMessage, setSignedMessage] = useState<string | null>(null);

	const acknowledgedAddresses = (localStore.get('acknowledgedAddresses') || {}) as Record<
		string,
		string
	>;

	const protectedRoute =
		router.asPath.startsWith(ROUTES.Earn.Home) ||
		router.asPath.startsWith(ROUTES.Exchange.Home) ||
		router.asPath.includes('/market');

	if (
		!protectedRoute ||
		signedMessage ||
		!walletAddress ||
		acknowledgedAddresses[walletAddress.toLowerCase()]
	) {
		return null;
	}

	const onAccept = async () => {
		try {
			const signed = await signer?.signMessage('I acknowledge and accept Kwenta terms of service');
			if (signed) {
				acknowledgedAddresses[walletAddress.toLowerCase()] = signed;
				localStore.set('acknowledgedAddresses', acknowledgedAddresses);
				setSignedMessage(signed);
			}
		} catch (err) {
			logError(err);
		}
	};

	return (
		<StyledBaseModal onDismiss={() => {}} title="Kwenta Terms of Service" showCross={false}>
			<BodyText>
				Kwenta is a decentralized exchange, native to the internet, managed by an international
				community, offering accessible investment tooling in an effort to improve financial
				equality. By agreeing, you acknowledge that Kwenta is not designed for use in every legal
				jurisdiction and represent that you have investigated your personal legal situation and
				consulted with a legal representative in your jurisdiction if necessary.
				<br />
				<br />
				Please acknowledge that you have read our terms and conditions agreement (once available) as
				well as understood your local regulations well enough to determine whether you are operating
				within your rights when using Kwenta as Kwenta does not block anyone from accessing the
				protocol due its reliance on smart contracts and blockchain systems. All users assume
				responsibility for their own actions.
				<br />
				<br />
			</BodyText>
			<Button variant="flat" size="md" onClick={onAccept}>
				Accept & Sign
			</Button>
		</StyledBaseModal>
	);
}

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		max-width: 400px;
	}
`;

const BodyText = styled.div`
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.text.body};
`;
