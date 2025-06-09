import React from 'react';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Collapse,
    Avatar,
    Divider,
    ListItemAvatar,
    Menu,
    MenuItem,
    Container,
} from "@mui/material";
import {
    Menu as MenuIcon,
    Store,
    ShoppingCart,
    Category,
    Assessment,
    CardGiftcard,
    People,
    Campaign,
    Payment,
    Storefront,
    Inventory,
    Person,
    Settings,
    Group,
    CreditCard,
    Logout,
    Dashboard,
    Restaurant,
    LocalShipping,
    Discount,
    MenuBook,
    Receipt,
    KeyboardArrowDown,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/libs/api";
import { useAuthContext } from "@/contexts/auth";
import { getCookie, deleteCookie } from "cookies-next";
import { useTenant } from "@/contexts/tenantContext/TenantContext";
import { User } from '@/types/User';

interface MenuItem {
    icon: JSX.Element;
    label: string;
    path?: string;
    submenu?: { label: string; path: string; }[];
}

const menuItems: { title: string; items: MenuItem[]; }[] = [
    {
        title: 'Principal',
        items: [
            //{ icon: <Dashboard />, label: 'Dashboard', path: '/' },
            { icon: <Receipt />, label: 'Pedidos', path: '/pedidos' },
        ]
    },
    {
        title: 'Cardápio',
        items: [
            { icon: <Category />, label: 'Categorias', path: '/categorias' },
            { icon: <MenuBook />, label: 'Produtos', path: '/produtos' },
            //{ icon: <Discount />, label: 'Cupons', path: '/cupons' },
        ]
    },
    {
        title: 'Gestão',
        items: [
            { icon: <Store />, label: 'Estabelecimento', path: '/estabelecimento' },
            { icon: <Payment />, label: 'Métodos de Pagamento', path: '/pagamentos' },
            //{ icon: <LocalShipping />, label: 'Entregas', path: '/entregas' },
            { icon: <People />, label: 'Clientes', path: '/clientes' },
            { icon: <Group />, label: 'Usuários', path: '/users' },
            /*{
                icon: <Inventory />,
                label: 'Estoque',
                submenu: [
                    { label: 'Produtos em Estoque', path: '/estoque/produtos' },
                    { label: 'Movimentações', path: '/estoque/movimentacoes' },
                    { label: 'Ajustes de Estoque', path: '/estoque/ajustes' },
                ]
            },*/
            {
                icon: <Campaign />,
                label: 'Marketing',
                submenu: [
                    { label: 'Campanhas', path: '/marketing/campanhas' },
                    //{ label: 'Promoções', path: '/marketing/promocoes' },
                    { label: 'Cupons', path: '/marketing/cupons' },
                ]
            },
            {
                icon: <Assessment />,
                label: 'Relatórios',
                submenu: [
                    { label: 'Vendas', path: '/relatorios/vendas' },
                    { label: 'Produtos', path: '/relatorios/produtos' },
                    //{ label: 'Caixa', path: '/relatorios/caixa' },
                ]
            },
            /*{
                icon: <CreditCard />,
                label: 'PDV',
                submenu: [
                    { label: 'PDV Online', path: '/pdv' },
                    { label: 'Configuração de Caixa', path: '/pdv/configuracao' },
                ]
            },*/
        ]
    },
    {
        title: 'Sistema',
        items: [
            { icon: <Storefront />, label: 'Estabeleciomentos', path: '/home' },
        ]
    }
];

export const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { img, tenantSlug, nome, onClose, setOnClose } = useTenant();
    const drawerWidth = 250;
    const token = getCookie('token') as string;
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [openRelatorios, setOpenRelatorios] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState(-1);

    // Gerenciar o estado da tela e drawer
    useEffect(() => {
        const handleResize = () => {
            const isLarge = window.innerWidth >= 1500;
            setIsLargeScreen(isLarge);
            setMobileOpen(isLarge);
        };

        // Verificar tamanho inicial
        handleResize();

        // Adicionar listener para mudanças de tamanho
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            if (token) {
                try {
                    const user = await api.authorizeToken(token as string);
                    if (user) {
                        setUserData(user);
                    }
                } catch (error) {
                    console.error('Erro ao carregar dados do usuário:', error);
                }
            }
        };

        loadUserData();
    }, [token]);

    const handleDrawerToggle = () => {
        if (!isLargeScreen) {
            setMobileOpen(!mobileOpen);
        }
    };

    const handleToggleStore = () => {
        setConfirmDialogOpen(true);
    };

    const confirmCloseStore = async () => {
        await api.updateOpenClose(token)
        setOnClose(!onClose); // Aqui você deve implementar a lógica para fechar/abrir a loja
        setConfirmDialogOpen(false);
    };

    const cancelCloseStore = () => {
        setConfirmDialogOpen(false);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        deleteCookie('token');
        deleteCookie('tenantSlug');
        router.push('/login');
    };

    const handleSettings = () => {
        router.push('/settings');
        handleClose();
    };

    // Criar um componente para o conteúdo do menu para evitar duplicação
    const MenuContent = ({ onClose }: { onClose?: () => void }) => (
        <>
            <Toolbar />
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}>
                <Box sx={{ overflow: "auto", flexGrow: 1 }}>
                    <List sx={{ marginTop: 2 }}>
                        {!showSettings ? (
                            <>
                                {/* Relatórios */}
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => {
                                            setOpenRelatorios(!openRelatorios);
                                            if (onClose) onClose();
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Assessment />
                                        </ListItemIcon>
                                        <ListItemText primary="Relatórios" />
                                    </ListItemButton>
                                </ListItem>
                                <Collapse in={openRelatorios} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => {
                                                    router.push('/relatorios/vendas');
                                                    if (onClose) onClose();
                                                }}
                                            >
                                                <ListItemText inset primary="Relatório de Vendas" />
                                            </ListItemButton>
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => {
                                                    router.push('/relatorios/produtos');
                                                    if (onClose) onClose();
                                                }}
                                            >
                                                <ListItemText inset primary="Relatório de Produtos" />
                                            </ListItemButton>
                                        </ListItem>
                                    </List>
                                </Collapse>

                                {/* Outros itens do menu... */}
                                {[
                                    { text: 'Cupons', icon: <CardGiftcard />, path: '/cupons' },
                                    { text: 'Clientes', icon: <People />, path: '/clientes' },
                                    { text: 'Campanhas', icon: <Campaign />, path: '/campanhas' },
                                    { text: 'Estabelecimento', icon: <Storefront />, path: '/estabelecimento' },
                                    { text: 'Pagamentos', icon: <Payment />, path: '/pagamentos' },
                                    { text: 'Produtos', icon: <Store />, path: '/produtos' },
                                    { text: 'Pedidos', icon: <ShoppingCart />, path: '/pedidos' },
                                    {
                                        text: 'Frente de Caixa',
                                        icon: <ShoppingCart />,
                                        path: '/pdv',
                                        openInNewTab: true
                                    },
                                    { text: 'Categorias', icon: <Category />, path: '/categorias' },
                                    { text: 'Estoque', icon: <Inventory />, path: '/estoque' },
                                    { text: 'Usuarios', icon: <Group />, path: '/users' },
                                    { text: 'Assinatura', icon: <CreditCard />, path: '/assinatura' },
                                ].map((item) => (
                                    <ListItem key={item.text} disablePadding>
                                        <ListItemButton
                                            onClick={() => {
                                                if (item.openInNewTab) {
                                                    window.open(item.path || '#', '_blank');
                                                } else {
                                                    router.push(item.path || '/');
                                                }
                                                if (onClose) onClose();
                                            }}
                                        >
                                            <ListItemIcon>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.text} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </>
                        ) : (
                            <>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => router.push('/settings')}>
                                        <ListItemIcon>
                                            <Person />
                                        </ListItemIcon>
                                        <ListItemText primary="Configurações" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={handleLogout}>
                                        <ListItemIcon>
                                            <Logout />
                                        </ListItemIcon>
                                        <ListItemText primary="Sair" />
                                    </ListItemButton>
                                </ListItem>
                            </>
                        )}
                    </List>
                </Box>

                <Divider />
                <List>
                    <ListItem
                        secondaryAction={
                            <IconButton edge="end" onClick={() => setShowSettings(!showSettings)}>
                                {showSettings ? <MenuIcon /> : <Settings />}
                            </IconButton>
                        }
                    >
                        <ListItemAvatar>
                            <Avatar>
                                <Person />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={userData?.nome || 'Usuário'}
                            secondary={userData?.email || 'Não logado'}
                            primaryTypographyProps={{
                                variant: 'subtitle2',
                                noWrap: true
                            }}
                            secondaryTypographyProps={{
                                variant: 'caption',
                                noWrap: true
                            }}
                        />
                    </ListItem>
                </List>
            </Box>
        </>
    );

    return (
        <Box sx={{ '@media print': { display: 'none' } }}>
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                {/* Header */}
                <AppBar component="nav" position="fixed" sx={{ zIndex: 1201 }}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="abrir menu"
                            edge="start"
                            onClick={() => setMenuOpen(true)}
                            sx={{
                                mr: 2,
                                display: isLargeScreen ? 'none' : 'block'
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <img
                                src="/logo2.png"
                                alt="DeliveryApp Logo"
                                style={{
                                    height: 80,
                                    marginRight: 10
                                }}
                            />
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: 24 }}>
                                Bevon Delivery
                            </Typography>
                        </Box>

                        <Box
                            onClick={handleToggleStore}
                            sx={{
                                paddingLeft: 2,
                                borderLeft: "2px solid #6c31a2",
                                position: "relative", // Necessário para posicionar o texto de hover
                                "&:hover": {
                                    backgroundColor: "#dec8ff", // Cor de fundo ao passar o mouse
                                    cursor: "pointer",
                                },
                                "&:hover .hoverText": {
                                    opacity: 1, // Exibe o texto ao passar o mouse
                                },
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", margin: 0.5 }}>
                                {/* Imagem estilizada */}
                                <img
                                    src={img || "/public/notImage.jpg"}
                                    alt={tenantSlug || "Logo"}
                                    style={{
                                        height: 50,
                                        width: 50,
                                        borderRadius: "10%", // Arredondamento das bordas
                                        border: "2px solid #ccc", // Borda cinza
                                        marginRight: 16,
                                        objectFit: "cover", // Garante que a imagem não fique distorcida
                                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Sombra para destaque
                                    }}
                                />
                                {/* Nome da loja e status */}
                                <Box>
                                    <Typography sx={{ fontWeight: "400", fontSize: 11 }}>
                                        Loja
                                    </Typography>
                                    <Typography sx={{ fontWeight: "500", fontSize: 16 }}>
                                        {nome || "Nome do Estabelecimento"}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            padding: "2px",
                                            marginTop: "4px",
                                            borderRadius: "5px",
                                            display: "flex",
                                            justifyContent: "center",
                                            color: onClose ? "green" : "red",
                                            fontWeight: "600",
                                            backgroundColor: "white",
                                        }}
                                    >
                                        <Storefront /> {onClose ? "Aberto" : "Fechado"}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Texto de hover */}
                            <Box
                                className="hoverText"
                                sx={{
                                    position: "absolute",
                                    top: "100%", // Posicionado abaixo do box
                                    left: 0,
                                    right: 0,
                                    backgroundColor: "#6c31a2",
                                    color: "white",
                                    textAlign: "center",
                                    borderRadius: "5px",
                                    padding: "4px",
                                    fontSize: "12px",
                                    opacity: 0, // Invisível por padrão
                                    transition: "opacity 0.3s ease-in-out",
                                }}
                            >
                                <Box>
                                    <Typography sx={{ fontWeight: "400", fontSize: 11 }}>
                                        Loja
                                    </Typography>
                                    <Typography sx={{ fontWeight: "500", fontSize: 16 }}>
                                        {nome || "Nome do Estabelecimento"}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            marginTop: "4px",
                                            borderRadius: "5px",
                                            display: "flex",
                                            justifyContent: "center",
                                            color: onClose ? "red" : "green",
                                            fontWeight: "600",
                                            backgroundColor: "white",
                                        }}
                                    >
                                        <Storefront /> {onClose ? "Fechar Loja" : "Abrir Loja"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                    </Toolbar>
                </AppBar>

                {/* Menu Lateral Responsivo */}
                <Drawer
                    variant={isLargeScreen ? "permanent" : "temporary"}
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            border: isLargeScreen ? 'none' : undefined
                        },
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        <img
                            src={img || "/public/notImage.jpg"}
                            alt={tenantSlug || "Logo"}
                            style={{
                                height: 50,
                                width: 50,
                                borderRadius: "10%",
                                marginBottom: 20,
                            }}
                        />
                    </Box>

                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {menuItems.map((section, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        px: 3,
                                        py: 1.5,
                                        color: 'text.secondary',
                                        fontWeight: 500
                                    }}
                                >
                                    {section.title}
                                </Typography>

                                <List>
                                    {section.items.map((item, i) => (
                                        <>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() => {
                                                        if ('submenu' in item) {
                                                            setOpenSubmenu(openSubmenu === i ? -1 : i);
                                                        } else if (item.path) {
                                                            router.push(item.path);
                                                            setMenuOpen(false);
                                                        }
                                                    }}
                                                    sx={{
                                                        py: 1.5,
                                                        px: 3,
                                                        '&:hover': {
                                                            bgcolor: 'action.hover',
                                                        },
                                                        '&.Mui-selected': {
                                                            bgcolor: 'primary.main',
                                                            color: 'primary.contrastText',
                                                            '&:hover': {
                                                                bgcolor: 'primary.dark',
                                                            },
                                                            '& .MuiListItemIcon-root': {
                                                                color: 'inherit'
                                                            }
                                                        }
                                                    }}
                                                    selected={!('submenu' in item) && pathname === item.path}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                                        {item.icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={item.label}
                                                        primaryTypographyProps={{
                                                            fontSize: '0.9rem'
                                                        }}
                                                    />
                                                    {'submenu' in item && (
                                                        <KeyboardArrowDown
                                                            sx={{
                                                                transform: openSubmenu === i ? 'rotate(-180deg)' : 'none',
                                                                transition: '0.3s'
                                                            }}
                                                        />
                                                    )}
                                                </ListItemButton>
                                            </ListItem>
                                            {'submenu' in item && (
                                                <Collapse in={openSubmenu === i}>
                                                    <List component="div" disablePadding>
                                                        {item.submenu?.map((subItem, subIndex) => (
                                                            <ListItemButton
                                                                key={subIndex}
                                                                onClick={() => {
                                                                    router.push(subItem.path);
                                                                    setMenuOpen(false);
                                                                }}
                                                                sx={{
                                                                    pl: 7,
                                                                    py: 1,
                                                                    '&.Mui-selected': {
                                                                        bgcolor: 'primary.main',
                                                                        color: 'primary.contrastText',
                                                                    }
                                                                }}
                                                                selected={pathname === subItem.path}
                                                            >
                                                                <ListItemText
                                                                    primary={subItem.label}
                                                                    primaryTypographyProps={{
                                                                        fontSize: '0.85rem'
                                                                    }}
                                                                />
                                                            </ListItemButton>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            )}
                                        </>
                                    ))}
                                </List>

                                {index < menuItems.length - 1 && (
                                    <Divider sx={{ my: 1 }} />
                                )}
                            </Box>
                        ))}
                    </Box>

                    {/* Perfil do Usuário */}
                    <Box sx={{ mt: 'auto', p: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <List>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <Person />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={userData?.nome || 'Usuário'}
                                    secondary={userData?.email || 'Não logado'}
                                    primaryTypographyProps={{
                                        variant: 'subtitle2',
                                        noWrap: true
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'caption',
                                        noWrap: true
                                    }}
                                />
                                <IconButton onClick={handleMenu}>
                                    <Settings fontSize="small" />
                                </IconButton>
                            </ListItem>
                        </List>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {/* <MenuItem onClick={() => {
                                router.push('/perfil');
                                handleClose();
                            }}>
                                <ListItemIcon>
                                    <Person fontSize="small" />
                                </ListItemIcon>
                                Perfil
                            </MenuItem>*/}
                            <MenuItem onClick={() => {
                                deleteCookie('token');
                                router.push('/login');
                                handleClose();
                            }}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Sair
                            </MenuItem>
                        </Menu>
                    </Box>
                </Drawer>

                {/* Dialog de Confirmação */}
                <Dialog
                    open={confirmDialogOpen}
                    onClose={cancelCloseStore}
                    PaperProps={{
                        sx: {
                            borderRadius: "15px", // Bordas arredondadas
                            padding: 2, // Espaçamento interno
                            maxWidth: "400px", // Largura máxima do diálogo
                            width: "90%", // Responsividade
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            textAlign: "center",
                            backgroundColor: "#6c31a2", // Cor de fundo do título
                            color: "white", // Cor do texto
                            borderTopLeftRadius: "15px", // Bordas superiores
                            borderTopRightRadius: "15px",
                            padding: 2,
                        }}
                    >
                        Confirmar Ação
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: "center", padding: "16px 24px" }}>
                        <DialogContentText
                            sx={{
                                fontSize: "1.1rem",
                                color: "#444",
                                marginBottom: 2,
                            }}
                        >
                            Você tem certeza que deseja{" "}
                            <strong style={{ color: onClose ? "red" : "green" }}>
                                {onClose ? "fechar" : "abrir"}
                            </strong>{" "}
                            o estabelecimento?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            justifyContent: "center", // Centraliza os botões
                            paddingBottom: 2,
                            paddingTop: 0,
                        }}
                    >
                        <Button
                            onClick={cancelCloseStore}
                            sx={{
                                color: "#fff",
                                backgroundColor: "#d9534f",
                                "&:hover": { backgroundColor: "#c9302c" },
                                textTransform: "none",
                                borderRadius: "20px",
                                padding: "6px 20px",
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmCloseStore}
                            sx={{
                                color: "#fff",
                                backgroundColor: "#5cb85c",
                                "&:hover": { backgroundColor: "#4cae4c" },
                                textTransform: "none",
                                borderRadius: "20px",
                                padding: "6px 20px",
                            }}
                        >
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Conteúdo Principal */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgcolor: "background.default",
                        p: 3,
                        mt: 8,
                        ml: {
                            xs: 0,
                            '@media (min-width: 1500px)': `${drawerWidth}px`
                        },
                    }}
                ></Box>
            </Box>
        </Box>
    );
};
