import Connector from 'containers/Connector';
import { useEffect, useState } from 'react';

const useResolveENS = (searchTerm: string) => {
	const [address, setAddress] = useState<string | null>(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState<boolean>(false);
	const { staticMainnetProvider } = Connector.useContainer();

	useEffect(() => {
		let mounted = true;

		if (mounted && searchTerm.includes('.eth')) {
			setLoading(true);
			(async () => {
				try {
					const address_ = await staticMainnetProvider.resolveName(searchTerm);
					setAddress(address_);
				} catch (err) {
					setError(err);
				} finally {
					setLoading(false);
				}
			})();
		}
		return () => {
			mounted = false;
			setAddress(null);
		};
	}, [searchTerm, staticMainnetProvider]);

	if (!loading && error) console.log(error);

	if (!loading && address) return address;
};

export default useResolveENS;
