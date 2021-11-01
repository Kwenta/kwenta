import { FC } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from 'styles/theme';
import { RecoilRoot } from 'recoil';

const ContextProvider: FC = ({ children }) => {
	return (
		<RecoilRoot>
			<ThemeProvider theme={theme}>{children}</ThemeProvider>
		</RecoilRoot>
	);
};

export default ContextProvider;
