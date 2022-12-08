import { FC } from 'react';

import LoaderIcon from 'assets/svg/app/loader.svg';
import { AbsoluteCenteredDiv } from 'styles/common';

type LoaderProps = {
	inline?: boolean;
	width?: string;
	height?: string;
	style?: Record<string, any>;
};

export const Loader: FC<LoaderProps> = ({
	inline,
	width = '38px',
	height = '38px',
	style = {},
	...rest
}) => {
	const loader = <LoaderIcon style={{ width, height, ...style }} />;

	return inline ? loader : <AbsoluteCenteredDiv {...rest}>{loader}</AbsoluteCenteredDiv>;
};

Loader.defaultProps = {
	inline: false,
};

export const MiniLoader: FC<LoaderProps & { centered?: boolean }> = (props) => {
	return (
		<Loader
			inline
			height="11px"
			width="11px"
			style={{ marginLeft: `${!props.centered ? '10px' : '0px'}` }}
		/>
	);
};

export const ButtonLoader = () => {
	return <Loader inline height="20x" width="20px" />;
};

export default Loader;
