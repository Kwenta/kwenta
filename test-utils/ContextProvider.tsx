import { FC } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from 'styles/theme';

const ContextProvider: FC = ({ children }) => {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default ContextProvider;
