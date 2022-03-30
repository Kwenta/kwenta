export default async function getENSName(_account: string, _provider: any) {
	const name = await _provider.lookupAddress(_account);
	if (!name) return null;
	return name;
}
