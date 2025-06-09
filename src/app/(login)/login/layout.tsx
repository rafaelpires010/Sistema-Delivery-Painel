'use client'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Box, Container, Typography } from '@mui/material';
import { Provider as AuthContextProvider } from '../../../contexts/auth'

type Props = {
    children: React.ReactNode;
}
const Layout = ({ children }: Props) => {
    return (
        <html lang="pt-br">
            <head>
                <link rel="icon" href="/logo2.png" type="image/png" />
            </head>
            <body>
                <AuthContextProvider>
                    <Container component={"main"} maxWidth="xs">
                        <Box sx={{
                            mt: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <img src="/logo.png" alt="Logo" width={280} />
                            <Typography component={"h5"} variant="h5">Painel do estabelecimento</Typography>

                            {children}
                        </Box>
                    </Container>
                </AuthContextProvider>
            </body>
        </html>
    );
}

export default Layout;