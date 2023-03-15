import { FC, memo } from 'react';

import { Body } from 'components/Text';

const GitHashID: FC = memo(() => {
	const gitID = process.env.GIT_HASH_ID!.toString();

	return <Body>{gitID}</Body>;
});

export default GitHashID;
