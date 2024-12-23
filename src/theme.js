import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        background: {
            default: 'rgba(59, 30, 84, 0.03)',
        }
    },
    typography: {
        fontFamily: [
            'Inter',
            'Roboto',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Arial',
            'sans-serif'
        ].join(','),
        h1: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 700
        },
        h2: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 700
        },
        h3: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 600
        },
        h4: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 600
        },
        h5: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 600
        },
        h6: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 600
        },
        subtitle1: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500
        },
        subtitle2: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500
        },
        body1: {
            fontFamily: 'Inter, sans-serif'
        },
        body2: {
            fontFamily: 'Inter, sans-serif'
        },
        button: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            textTransform: 'none'
        }
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                @keyframes sparkle {
                    0% { opacity: 0.4; }
                    50% { opacity: 1; }
                    100% { opacity: 0.4; }
                }
            `
        }
    }
});export default theme;
