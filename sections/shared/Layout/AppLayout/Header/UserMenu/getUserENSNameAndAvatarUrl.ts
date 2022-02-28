export default async function getENSNameAndAvatarUrl(_account: string, _provider: any) {
	const name = await _provider.lookupAddress(_account);

	if (!name) return null;

	const resolver = await _provider.getResolver(name);
	const avatar = resolver ? await resolver.getText('avatar') : null;

	if (!avatar) return { name, avatarUrl: null };
}
