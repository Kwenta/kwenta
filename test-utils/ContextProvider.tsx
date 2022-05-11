import { FC } from 'react';
import { ThemeProvider } from 'styled-components';
import { themes } from 'styles/theme';
import { RecoilRoot } from 'recoil';

const ContextProvider: FC = ({ children }) => {
	return (
		<RecoilRoot>
			<ThemeProvider theme={themes.dark}>{children}</ThemeProvider>
		</RecoilRoot>
	);
};

export default ContextProvider;
