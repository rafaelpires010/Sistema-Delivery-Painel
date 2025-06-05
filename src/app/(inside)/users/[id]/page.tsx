'use client';

import { useEffect, useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Checkbox, FormControlLabel, Tabs, Tab, CircularProgress, Grid, Divider, Avatar, Chip, Switch } from '@mui/material';
import { ArrowBack, Save, Store, ShoppingCart, LocalShipping, People, Settings, Dashboard, Campaign, Edit, Person, VpnKey, History, Lock, AttachMoney, Category } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { api } from '@/libs/api';
import { UserTenant } from '@/types/User';

// Adicione no início do arquivo, após as importações
const DEFAULT_IMAGE = "https://source.unsplash.com/800x600/?restaurant";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            {...other}
            sx={{ mt: 3 }}
        >
            {value === index && children}
        </Box>
    );
}
// Primeiro defina as interfaces
interface Role {
    id: string;
    codigo: string;
    descricao: string;
}

interface Claim {
    id: string;
    codigo: string;
    descricao: string;
}

// Adicione no início do arquivo, junto com as outras interfaces
interface Estabelecimento {
    id: number;
    nome: string;
    slug: string;
    ativo: boolean;
    img: string;
}

const UserDetailsPage = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const token = getCookie('token');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [userData, setUserData] = useState<UserTenant | null>(null);
    const [selectedEstabelecimentos, setSelectedEstabelecimentos] = useState<number[]>([]);
    const [viewingEstabelecimento, setViewingEstabelecimento] = useState<number | null>(null);
    const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const response = await api.getUserById(token as string, Number(params.id));
            setUserData(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            alert('Erro ao carregar dados do usuário');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, [params.id]);

    useEffect(() => {
        const loadEstabelecimentos = async () => {
            const response = await api.getTenantsByLoggedUser(token as string);
            setEstabelecimentos(response);
        };
        loadEstabelecimentos();
    }, [token]);

    useEffect(() => {
        const loadRolesAndClaims = async () => {
            try {
                const [rolesResponse, claimsResponse] = await Promise.all([
                    api.getRoles(token as string),
                    api.getClaims(token as string)
                ]);

                console.log('Roles Response:', rolesResponse);
                console.log('Claims Response:', claimsResponse);

                // Verifica se a resposta tem a estrutura esperada
                if (rolesResponse && typeof rolesResponse === 'object') {
                    const rolesData = rolesResponse.data || rolesResponse;
                    setRoles(Array.isArray(rolesData) ? rolesData : []);
                }

                if (claimsResponse && typeof claimsResponse === 'object') {
                    const claimsData = claimsResponse.data || claimsResponse;
                    setClaims(Array.isArray(claimsData) ? claimsData : []);
                }

            } catch (error) {
                console.error('Erro ao carregar roles e claims:', error);
                setRoles([]);
                setClaims([]);
            }
        };

        if (token) {
            loadRolesAndClaims();
        }
    }, [token]);

    const handleSave = async () => {
        if (!userData) return;

        try {
            setSaving(true);
            //await api.updateUser(token as string, userData.id, userData);
            alert('Usuário atualizado com sucesso!');
            router.push('/users');
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            alert('Erro ao salvar alterações');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePermissions = async (tenantId: number, screenId: string, permissions: string[]) => {
        if (!userData) return;

        try {
            const updatedTenants = userData.tenants.map(tenant => {
                if (tenant.id === tenantId) {
                    return {
                        ...tenant,
                        claims: [...tenant.claims, ...permissions]
                    };
                }
                return tenant;
            });

            setUserData({
                ...userData,
                tenants: updatedTenants
            });
        } catch (error) {
            console.error('Erro ao atualizar permissões:', error);
        }
    };

    const hasPermission = (tenantId: number, permission: string) => {
        const tenant = userData?.tenants.find(t => t.id === tenantId);
        return tenant?.claims.includes(permission) || false;
    };

    const isAdmin = (tenantId: number) => {
        const tenant = userData?.tenants.find(t => t.id === tenantId);
        return tenant?.cargo === 'admin';
    };

    const handleUpdateRole = async (tenantId: number, roleId: string, hasRole: boolean) => {
        if (!userData) return;
        const updatedTenants = userData.tenants.map(tenant => {
            if (tenant.id === tenantId) {
                return {
                    ...tenant,
                    roles: hasRole
                        ? [...tenant.roles, roleId]
                        : tenant.roles.filter(r => r !== roleId)
                };
            }
            return tenant;
        });
        setUserData({ ...userData, tenants: updatedTenants });
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push('/users')}
                >
                    Voltar
                </Button>
                <Typography variant="h5" sx={{ fontWeight: 'bold', flex: 1 }}>
                    {userData?.nome}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={editing ? (saving ? <CircularProgress size={20} /> : <Save />) : <Edit />}
                    onClick={async () => {
                        if (editing) {
                            // Se estiver editando, tenta salvar
                            try {
                                setSaving(true);
                                //await api.updateUser(token as string, userData?.id as number, userData);
                                alert('Usuário atualizado com sucesso!');
                                setEditing(false);
                            } catch (error) {
                                console.error('Erro ao atualizar usuário:', error);
                                alert('Erro ao salvar alterações');
                            } finally {
                                setSaving(false);
                            }
                        } else {
                            // Se não estiver editando, habilita edição
                            setEditing(true);
                        }
                    }}
                    disabled={saving}
                >
                    {editing ? (saving ? 'Salvando...' : 'Salvar Alterações') : 'Editar'}
                </Button>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        icon={<Person sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label="Informações"
                    />
                    <Tab
                        icon={<VpnKey sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label="Permissões"
                    />
                    <Tab
                        icon={<Lock sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label="Alterar Senha"
                    />
                    <Tab
                        icon={<History sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label="Histórico"
                    />
                </Tabs>
            </Paper>

            <TabPanel value={tabValue} index={0}>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: 'grey.900',
                                    fontSize: '2.5rem',
                                    color: 'white',
                                    filter: 'grayscale(100%)'
                                }}
                            >
                                {userData?.nome?.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 'bold',
                                        mb: 0.5,
                                        color: 'text.primary'
                                    }}
                                >
                                    {userData?.nome}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        mb: 2,
                                        color: 'text.secondary'
                                    }}
                                >
                                    {userData?.email}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip
                                        label={userData?.tenants[0]?.cargo === 'admin' ? 'Administrador' : 'Funcionário'}
                                        color={userData?.tenants[0]?.cargo === 'admin' ? 'primary' : 'default'}
                                        size="small"
                                    />
                                    <Chip
                                        label={userData?.tenants[0]?.active ? 'Ativo' : 'Inativo'}
                                        color={userData?.tenants[0]?.active ? 'success' : 'error'}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Acesso aos Estabelecimentos
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {estabelecimentos.map((estabelecimento) => (
                            <Paper
                                key={estabelecimento.id}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    backgroundColor: 'background.default',
                                    borderRadius: 2
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        component="img"
                                        src={estabelecimento.img || DEFAULT_IMAGE}
                                        alt={estabelecimento.nome}
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 2,
                                            objectFit: 'cover',
                                            bgcolor: 'background.paper'
                                        }}
                                        onError={(e: any) => {
                                            e.target.src = DEFAULT_IMAGE;
                                        }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={userData?.tenants.some(t => t.id === estabelecimento.id)}
                                                    onChange={(e) => {
                                                        if (!userData) return;
                                                        const newTenants = e.target.checked
                                                            ? [...userData.tenants, {
                                                                id: estabelecimento.id,
                                                                nome: estabelecimento.nome,
                                                                slug: estabelecimento.slug,
                                                                cargo: 'user',
                                                                active: true,
                                                                ultimo_login: new Date().toISOString(),
                                                                roles: [],
                                                                claims: [],
                                                                img: estabelecimento.img || DEFAULT_IMAGE
                                                            }]
                                                            : userData.tenants.filter(t => t.id !== estabelecimento.id);

                                                        setUserData({
                                                            ...userData,
                                                            tenants: newTenants
                                                        });
                                                    }}
                                                    disabled={!editing}
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Store sx={{ color: estabelecimento.ativo ? 'success.main' : 'text.disabled' }} />
                                                    <Box>
                                                        <Typography variant="body1">
                                                            {estabelecimento.nome}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {userData?.tenants.some(t => t.id === estabelecimento.id) ? 'Incluído' : 'Não Incluído'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Paper sx={{ p: 3 }}>
                    {editing ? (
                        <>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom>
                                    Selecione os Estabelecimentos para Editar
                                </Typography>
                                <Grid container spacing={2}>
                                    {userData?.tenants.map((estabelecimento) => (
                                        <Grid item xs={12} sm={6} md={4} key={estabelecimento.id}>
                                            <Paper
                                                onClick={() => {
                                                    setSelectedEstabelecimentos(prev => {
                                                        if (prev.includes(estabelecimento.id)) {
                                                            return prev.filter(id => id !== estabelecimento.id);
                                                        } else {
                                                            return [...prev, estabelecimento.id];
                                                        }
                                                    });
                                                }}
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    border: selectedEstabelecimentos.includes(estabelecimento.id) ? 2 : 1,
                                                    borderColor: selectedEstabelecimentos.includes(estabelecimento.id) ? 'primary.main' : 'divider',
                                                    backgroundColor: selectedEstabelecimentos.includes(estabelecimento.id) ? 'primary.light' : 'background.paper',
                                                    '&:hover': {
                                                        backgroundColor: 'primary.light',
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: 3
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box
                                                        component="img"
                                                        src={estabelecimento.img || DEFAULT_IMAGE}
                                                        alt={estabelecimento.nome}
                                                        sx={{
                                                            width: 60,
                                                            height: 60,
                                                            borderRadius: 2,
                                                            objectFit: 'cover',
                                                            bgcolor: 'background.paper'
                                                        }}
                                                        onError={(e: any) => {
                                                            e.target.src = DEFAULT_IMAGE;
                                                        }}
                                                    />
                                                    <Typography variant="h6">{estabelecimento.nome}</Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            {selectedEstabelecimentos.length > 0 && (
                                <>
                                    <Divider sx={{ my: 4 }} />
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Permissões dos Estabelecimentos Selecionados ({selectedEstabelecimentos.length})
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            As alterações serão aplicadas a todos os estabelecimentos selecionados
                                        </Typography>
                                    </Box>

                                    {roles.map((role) => (
                                        <Box key={role.id} sx={{ mb: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {role.descricao}
                                                </Typography>
                                            </Box>

                                            <Grid container spacing={2}>
                                                {claims.map((claim) => (
                                                    <Grid item xs={12} sm={6} md={3} key={claim.id}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={userData?.tenants.some(t =>
                                                                        t.id === selectedEstabelecimentos[0] &&
                                                                        t.claims.includes(claim.id)
                                                                    )}
                                                                    onChange={(e) => {
                                                                        if (!userData) return;
                                                                        const updatedTenants = userData.tenants.map(t => {
                                                                            if (t.id === selectedEstabelecimentos[0]) {
                                                                                return {
                                                                                    ...t,
                                                                                    claims: e.target.checked
                                                                                        ? [...t.claims, claim.id]
                                                                                        : t.claims.filter(c => c !== claim.id)
                                                                                };
                                                                            }
                                                                            return t;
                                                                        });
                                                                        setUserData({ ...userData, tenants: updatedTenants });
                                                                    }}
                                                                    disabled={!editing}
                                                                />
                                                            }
                                                            label={claim.descricao}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                            <Divider sx={{ mt: 2 }} />
                                        </Box>
                                    ))}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom>
                                    Selecione um Estabelecimento para Visualizar
                                </Typography>
                                <Grid container spacing={2}>
                                    {userData?.tenants.map((estabelecimento) => (
                                        <Grid item xs={12} sm={6} md={4} key={estabelecimento.id}>
                                            <Paper
                                                onClick={() => setViewingEstabelecimento(estabelecimento.id)}
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    border: viewingEstabelecimento === estabelecimento.id ? 2 : 1,
                                                    borderColor: viewingEstabelecimento === estabelecimento.id ? 'primary.main' : 'divider',
                                                    backgroundColor: viewingEstabelecimento === estabelecimento.id ? 'primary.light' : 'background.paper',
                                                    '&:hover': {
                                                        backgroundColor: 'primary.light',
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: 3
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box
                                                        component="img"
                                                        src={estabelecimento.img || DEFAULT_IMAGE}
                                                        alt={estabelecimento.nome}
                                                        sx={{
                                                            width: 60,
                                                            height: 60,
                                                            borderRadius: 2,
                                                            objectFit: 'cover'
                                                        }}
                                                        onError={(e: any) => {
                                                            e.target.src = DEFAULT_IMAGE;
                                                        }}
                                                    />
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                                            {estabelecimento.nome}
                                                        </Typography>
                                                        <Chip
                                                            size="small"
                                                            label={estabelecimento.active ? 'Ativo' : 'Inativo'}
                                                            color={estabelecimento.active ? 'success' : 'default'}
                                                            sx={{ mt: 1 }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            {viewingEstabelecimento && (
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>Funções (Roles)</Typography>
                                    <Grid container spacing={2}>
                                        {roles.map((role) => (
                                            <Grid item xs={12} sm={6} key={role.id}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={userData?.tenants.find(t =>
                                                                t.id === viewingEstabelecimento
                                                            )?.roles.includes(role.codigo)}
                                                            onChange={(e) => {
                                                                if (!userData) return;
                                                                const updatedTenants = userData.tenants.map(t => {
                                                                    if (t.id === viewingEstabelecimento) {
                                                                        return {
                                                                            ...t,
                                                                            roles: e.target.checked
                                                                                ? [...t.roles, role.codigo]
                                                                                : t.roles.filter(r => r !== role.codigo)
                                                                        };
                                                                    }
                                                                    return t;
                                                                });
                                                                setUserData({ ...userData, tenants: updatedTenants });
                                                            }}
                                                            disabled={!editing}
                                                        />
                                                    }
                                                    label={
                                                        <Box>
                                                            <Typography variant="body1">{role.descricao}</Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {role.descricao}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Divider sx={{ my: 3 }} />

                                    <Typography variant="h6" gutterBottom>Permissões (Claims)</Typography>
                                    <Grid container spacing={2}>
                                        {claims.map((claim) => (
                                            <Grid item xs={12} sm={6} key={claim.id}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={userData?.tenants.find(t =>
                                                                t.id === viewingEstabelecimento
                                                            )?.claims.includes(claim.codigo)}
                                                            onChange={(e) => {
                                                                if (!userData) return;
                                                                const updatedTenants = userData.tenants.map(t => {
                                                                    if (t.id === viewingEstabelecimento) {
                                                                        return {
                                                                            ...t,
                                                                            claims: e.target.checked
                                                                                ? [...t.claims, claim.codigo]
                                                                                : t.claims.filter(c => c !== claim.codigo)
                                                                        };
                                                                    }
                                                                    return t;
                                                                });
                                                                setUserData({ ...userData, tenants: updatedTenants });
                                                            }}
                                                            disabled={!editing}
                                                        />
                                                    }
                                                    label={
                                                        <Box>
                                                            <Typography variant="body1">{claim.descricao}</Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {claim.descricao}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            )}
                        </>
                    )}
                </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        Alterar Senha
                    </Typography>
                    <Box sx={{ maxWidth: 400 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Nova Senha"
                                    type="password"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Confirmar Nova Senha"
                                    type="password"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    startIcon={<Save />}
                                    fullWidth
                                >
                                    Atualizar Senha
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Histórico de Atividades
                    </Typography>
                    <Typography color="textSecondary">
                        Último acesso: {new Date().toLocaleString()}
                    </Typography>
                </Paper>
            </TabPanel>
        </Box>
    );
};

export default UserDetailsPage; 