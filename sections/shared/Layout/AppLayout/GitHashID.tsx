import { FC, memo } from 'react';

import { Body } from 'components/Text';

const GitHashID: FC = memo(() => {
	const gitID = process.env.GIT_HASH_ID!.toString();

	return (
		<a href="https://github.com/Kwenta/kwenta/releases/latest" target="_blank" rel="noreferrer">
			<Body color="secondary">{gitID}</Body>
		</a>
	);
});

export default GitHashID;
