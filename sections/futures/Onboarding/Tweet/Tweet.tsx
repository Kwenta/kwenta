import { FC, useState } from 'react';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import SVGListening from 'assets/svg/futures/listening.svg';
import SVGTweetBox from 'assets/svg/futures/TweetBox';
import SVGTwitter from 'assets/svg/futures/twitter.svg';

import { truncatedWalletAddressState, walletAddressState } from 'store/wallet';
import * as Styled from './styles';

import WalletOptionsModal from 'sections/shared/modals/WalletOptionsModal';

import * as StyledOnboarding from '../styles';

const Tweet: FC = () => {
	const [walletOptionsModalOpened, setWalletOptionsModalOpened] = useState<boolean>(false);

	const [submitted, setSubmitted] = useState(false);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const walletAddress = useRecoilValue(walletAddressState);

	function tweet() {
		setSubmitted(true);
		window.open(
			`https://twitter.com/intent/tweet?text=Hey%20%40kwenta_io%2C%20it%27s%20${walletAddress}.%20Let%20me%20in%20to%20the%20L2%20testnet%20trading%20competition!%20%40optimismPBC%20%40synthetix_io%20https%3A%2F%2Ffutures.kwenta.io%20%23futuresOnKwentaIsHere`
		);
	}

	return (
		<StyledOnboarding.Root>
			<Styled.Root>
				{walletOptionsModalOpened && (
					<WalletOptionsModal onDismiss={() => setWalletOptionsModalOpened(false)} />
				)}
				<Styled.WalletButton
					size="md"
					variant="outline"
					onClick={() => setWalletOptionsModalOpened(true)}
					data-testid="wallet-btn"
				>
					<Styled.ConnectionDot />
					{truncatedWalletAddress}
				</Styled.WalletButton>
				<Styled.Line1>Welcome to Futures on Kwenta</Styled.Line1>
				<Styled.Line2>Tweet to get started</Styled.Line2>
				<Styled.Line3>
					To start trading on L2 you need to claim sUSD OVM tokens. Tweet your wallet address along
					with #futuresOnKwentaIsHere and start trading now!
				</Styled.Line3>
				<SVGTweetBox address={walletAddress || ''} />
				<Styled.Line4>
					We recommend using a fresh, new wallet for the competition, as there will be a public
					leaderboard displayed.
				</Styled.Line4>
				{submitted ? <Svg src={SVGListening} /> : <Svg src={SVGTwitter} onClick={() => tweet()} />}
			</Styled.Root>
		</StyledOnboarding.Root>
	);
};

export default Tweet;
