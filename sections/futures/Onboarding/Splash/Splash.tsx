import { FC } from 'react';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { Svg } from 'react-optimized-image';

import SVGLogoWithName from 'assets/svg/futures/logowithName.svg';
import SVGBackground from 'assets/svg/futures/background.svg';

import * as Styled from './styles';
import * as StyledOnboarding from '../styles';
import useSwitchToOptimisticKovan from './useSwitchToOptimisticKovan';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState } from 'store/wallet';

const Splash: FC = () => {
	const { connectWallet } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const switchNetwork = useSwitchToOptimisticKovan();

	return (
		<StyledOnboarding.Root>
			<Styled.Root>
				<Styled.Logo>
					<Svg src={SVGLogoWithName} />
				</Styled.Logo>
				<Styled.Background>
					<Svg src={SVGBackground} />
				</Styled.Background>
				<Styled.Blank />
				<Styled.Line1>Welcome to</Styled.Line1>
				<Styled.Line2>Decentralized</Styled.Line2>
				<Styled.Line2>Futures on Layer 2</Styled.Line2>
				<Styled.Line3>
					Connect your Layer 2 Optimistic Kovan wallet and sign up for a chance to be part of the
					Kwenta Elite!
				</Styled.Line3>
				<Styled.Line4>
					An L2 testnet trading competition powered by the OVM. Experience the speed of optimistic
					rollups and compete to <Styled.Line4Strong>win 50k SNX.</Styled.Line4Strong>
				</Styled.Line4>
				{isWalletConnected ? (
					<Button
						isRounded
						onClick={switchNetwork}
						size="lg"
						style={{ margin: '0 auto 12px' }}
						variant="primary"
					>
						Switch to Optimistic Kovan
					</Button>
				) : (
					<Button
						isRounded
						onClick={connectWallet}
						size="lg"
						style={{ margin: '0 auto 12px' }}
						variant="primary"
					>
						Connect Wallet
					</Button>
				)}
				<Styled.Line5>We recommend creating a new wallet to use for the competition.</Styled.Line5>
				<Styled.Line6>
					For help getting started, check out our blog post:
					{` `}
					<Styled.Link href="https://blog.kwenta.io/futures-competition-onboarding" target="_blank">
						https://blog.kwenta.io/futures-competition-onboarding
					</Styled.Link>
				</Styled.Line6>
			</Styled.Root>
		</StyledOnboarding.Root>
	);
};

export default Splash;
