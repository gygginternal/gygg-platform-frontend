import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import theme from './theme';
import PropTypes from 'prop-types';

const ThemeProvider = ({ children }) => {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
