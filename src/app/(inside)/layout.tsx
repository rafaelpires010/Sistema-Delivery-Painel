'use client'
import { Header } from '@/components/Header';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Container, Box } from '@mui/material';
import { Provider as AuthContextProvider } from '../../contexts/auth'
import { TenantProvider } from '@/contexts/tenantContext/TenantContext';

type Props = {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0 }}>
        <TenantProvider>
          <AuthContextProvider>
            <Box>
              {/* Header e Menu - ocultos na impressão */}
              <Box sx={{ '@media print': { display: 'none' } }}>
                <Header />
              </Box>

              {/* Conteúdo principal */}
              <Box sx={{
                flex: 1,
                '@media print': {
                  margin: 0,
                  padding: 0
                }
              }}>
                <Container
                  component="section"
                  maxWidth="lg"
                  sx={{
                    maxWidth: '1400px !important'
                  }}
                >
                  {children}
                </Container>
              </Box>
            </Box>
          </AuthContextProvider>
        </TenantProvider>
      </body>
    </html>
  );
}

export default Layout;