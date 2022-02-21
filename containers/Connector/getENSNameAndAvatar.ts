export default async function getENSNameAndAvatarUrl(account: string, provider: any) {
	const name = await provider.lookupAddress(account);

	if (!name) return null;

	const resolver = await provider.getResolver(name);
	const avatar = resolver ? await resolver.getText('avatar') : null;

	if (!avatar) return { name, avatarUrl: null };
}
