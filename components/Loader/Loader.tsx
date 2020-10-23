import { FC } from 'react';
import { Svg } from 'react-optimized-image';
import LoaderIcon from 'assets/inline-svg/app/loader.svg';

import { AbsoluteCenteredDiv } from 'styles/common';

type LoaderProps = {
	inline?: boolean;
};

export const Loader: FC<LoaderProps> = ({ inline }) => {
	const loader = <Svg src={LoaderIcon} />;

	return inline ? loader : <AbsoluteCenteredDiv>{loader}</AbsoluteCenteredDiv>;
};

Loader.defaultProps = {
	inline: false,
};

export default Loader;
