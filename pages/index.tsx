import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Wallet from 'containers/Wallet';

const HomePage = () => {
	const { t } = useTranslation();
	const { connectWallet, walletAddress, network, networkId } = Wallet.useContainer();

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<button onClick={connectWallet}>connect</button>
			<div>{walletAddress}</div>
		</>
	);
};

export default HomePage;
