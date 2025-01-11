import { createTheme, styled } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Augment the palette to include config box and app background option
declare module '@mui/material/styles' {
  interface Palette {
    configBox: Palette['primary'];
  }

  interface PaletteOptions {
    configBox?: PaletteOptions['primary'];
  }
}

// Update the Box's color options to include an ochre option
declare module '@mui/material/Box' {
  interface BoxPropsColorOverrides {
    configBox: true;
  }
}

// A custom theme for this app
const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
  cssVariables: true,
  palette: {
    // mode: 'dark',
    primary: {
      main: '#423d4c'
    },
    secondary: {
      main: '#ffb049',
    },
    error: {
      main: red.A400,
    },
    configBox: {
      main: '#fff',
      dark: '#212121',
    },
  },
  components: {
    MuiCssBaseline:
        {
          styleOverrides: {
            body: {
              // backgroundColor: "#5D576B",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 268 268' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'%3E%3Ccircle cx='37' cy='37' r='36'/%3E%3Ccircle cx='171' cy='171' r='36'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundAttachment: 'fixed',
            }
          }
        },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: '#dcdcdc',
        },
      },
    },
  },
});

export default theme;
