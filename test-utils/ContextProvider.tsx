import { FC } from 'react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from 'styled-components';

import { themes } from 'styles/theme';

const ContextProvider: FC = ({ children }) => {
	return (
		<RecoilRoot>
			<ThemeProvider theme={themes.dark}>{children}</ThemeProvider>
		</RecoilRoot>
	);
};

export default ContextProvider;
