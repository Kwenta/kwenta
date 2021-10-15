import { FC } from 'react';

import LogoLoading from 'assets/png/futures/loading.png';

import * as Styled from './styles';

const Loading: FC = () => {
	return (
		<Styled.Root>
			<Styled.Img src={LogoLoading} />
		</Styled.Root>
	);
};

export default Loading;
