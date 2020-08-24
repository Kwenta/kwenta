import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import Etherscan from 'containers/Etherscan';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';
import { networkIdState } from 'store/connection';

const HomePage = () => {
	const { t } = useTranslation();
	const [networkId, setNetworkId] = useRecoilState(networkIdState);
	const etherscan = Etherscan.useContainer();

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
				{/* <span>{etherscan.txLink('xxx')}</span> */}
			</Head>
			<div>
				<button
					onClick={() => {
						setNetworkId(42);
					}}
				>
					Change network
				</button>
				<span>{etherscan.txLink('xxx')}</span>
			</div>
		</>
	);
};

export default HomePage;
