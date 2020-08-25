import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

import ROUTES from 'constants/routes';

const Logo: FC = () => {
	return (
		<Container>
			<Link href={ROUTES.Home}>
				<a>KWENTA</a>
			</Link>
		</Container>
	);
};

const Container = styled.span`
	a {
		color: ${(props) => props.theme.colors.white};
	}
`;

export default Logo;
