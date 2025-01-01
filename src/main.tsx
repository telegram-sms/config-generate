import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
// import App from './App';
import CarbonCopy from "./CarbonCopy";
import ConfigQrcode from "./ConfigQrcode";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfigQrcode/>
    </ThemeProvider>
  </React.StrictMode>,
);
