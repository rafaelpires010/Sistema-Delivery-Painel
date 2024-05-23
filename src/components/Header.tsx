import { Menu } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeaderDrawer } from "./HeaderDrawer";
import { useState } from "react";

export const Header = () => {
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const pageTitle = "Painel delivery"

    const handleLogout = () => {
        router.push('/login');
    }
    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    }

    return (
        <>
            <AppBar component="nav" position="relative" sx={{ displayPrint: 'none' }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        sx={{ display: { sm: 'none' } }}
                        onClick={handleDrawerToggle}
                    >
                        <Menu />
                    </IconButton>
                    <Typography
                        component="div"
                        variant="h6"
                        sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                    >
                        <Link style={{ color: '#FFF', textDecoration: 'none' }} href="/">{pageTitle}</Link>
                    </Typography>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Link href="/pedidos" style={{ textDecoration: 'none' }}>
                            <Button sx={{ color: '#FFF' }}>Pedidos</Button>
                        </Link>
                        <Link href="/produtos" style={{ textDecoration: 'none' }}>
                            <Button sx={{ color: '#FFF' }}>Produtos</Button>
                        </Link>
                        <Link href="/categorias" style={{ textDecoration: 'none' }}>
                            <Button sx={{ color: '#FFF' }}>Categorias</Button>
                        </Link>
                        <Button onClick={handleLogout} sx={{ color: '#FFF' }}>Sair</Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="nav">
                <HeaderDrawer
                    open={drawerOpen}
                    onClose={handleDrawerToggle}
                    title={pageTitle}
                    onLogout={handleLogout}
                />
            </Box>
        </>
    );
}