import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// A custom theme for this app
const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: '1em',
          backgroundColor: '#5D576B',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 268 268' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'%3E%3Ccircle cx='37' cy='37' r='36'/%3E%3Ccircle cx='171' cy='171' r='36'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundAttachment: 'fixed',
          // fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
        }
      }
    }
  }
});

export default theme;
