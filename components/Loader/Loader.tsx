import { FC } from 'react';
import LoaderIcon from 'assets/inline-svg/app/loader.svg';

import { AbsoluteCenteredDiv } from 'styles/common';

type LoaderProps = {
	inline?: boolean;
};

export const Loader: FC<LoaderProps> = ({ inline }) => {
	const loader = <LoaderIcon />;

	return inline ? loader : <AbsoluteCenteredDiv>{loader}</AbsoluteCenteredDiv>;
};

Loader.defaultProps = {
	inline: false,
};

export default Loader;
