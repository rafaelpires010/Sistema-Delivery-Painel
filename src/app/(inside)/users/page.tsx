'use client'
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    CircularProgress,
    Grid,
    FormControlLabel,
    Checkbox,
    Chip,
    Divider
} from '@mui/material';
import { Add, Search, Person, Store } from '@mui/icons-material';
import { getCookie } from 'cookies-next';
import { api } from '@/libs/api';
import { User, TenantUsers } from '@/types/User';
import { useRouter } from 'next/navigation';

const UsersPage = () => {
    const router = useRouter();
    const token = getCookie('token');
    const [tenantsUsers, setTenantsUsers] = useState<TenantUsers[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        tenants: [{ cargo: '', active: true }],
        senha: '',
        confirmarSenha: '',
        estabelecimentos: [] as number[]
    });
    const [selectedEstabelecimentos, setSelectedEstabelecimentos] = useState<number[]>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await api.getUsers(token as string);
            setTenantsUsers(data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: number) => {
        try {
            // Pega os IDs dos tenants do usuário
            const tenantIds = tenantsUsers
                .filter(t => t.users.some(u => u.id === userId))
                .map(t => t.id);

            // Envia no formato correto
            await api.toggleUserStatus(token as string, userId, { tenantIds });
            await loadUsers();
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };

    const handleSave = async () => {
        if (!formData.nome || !formData.email || !formData.tenants[0].cargo || formData.estabelecimentos.length === 0) {
            alert('Preencha todos os campos obrigatórios e selecione pelo menos um estabelecimento');
            return;
        }

        if (formData.senha !== formData.confirmarSenha) {
            alert('As senhas não coincidem');
            return;
        }

        setLoading(true);
        try {
            const userData = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone || '',
                senha: formData.senha,
                tenants: formData.estabelecimentos.map(estId => {
                    const tenant = tenantsUsers[estId - 1];
                    return {
                        tenantId: tenant.id,
                        cargo: formData.tenants[0].cargo
                    };
                })
            };

            console.log('Dados enviados:', userData);
            await api.createUser(token as string, userData);
            await loadUsers();
            setOpenDialog(false);
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                tenants: [{ cargo: '', active: true }],
                senha: '',
                confirmarSenha: '',
                estabelecimentos: []
            });
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            alert('Erro ao criar usuário');
        } finally {
            setLoading(false);
        }
    };

    const getUniqueUsers = (): User[] => {
        const usersMap = new Map();

        tenantsUsers.forEach(tenantUser => {
            tenantUser.users.forEach((user: TenantUsers['users'][0]) => {
                const existingUser = usersMap.get(user.id);
                if (existingUser) {
                    existingUser.tenants.push(tenantUser.tenant);
                } else {
                    usersMap.set(user.id, {
                        ...user,
                        tenants: [tenantUser.tenant]
                    });
                }
            });
        });

        return Array.from(usersMap.values());
    };

    const getEstabelecimentos = () => {
        return tenantsUsers.map((t, index) => ({
            id: index + 1,
            nome: t.tenant,
            img: t.img,
            ativo: true
        }));
    };

    const filteredUsers = getUniqueUsers().filter(user => {
        const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstabelecimento = selectedEstabelecimentos.length === 0 ||
            user.tenants.some(tenant =>
                selectedEstabelecimentos.includes(
                    getEstabelecimentos().find(e => e.nome === tenant)?.id || 0
                )
            );

        return matchesSearch && matchesEstabelecimento;
    });

    const formatCargo = (cargo: string) => {
        switch (cargo) {
            case 'admin':
                return 'Administrador';
            case 'gerente':
                return 'Gerente';
            case 'financeiro':
                return 'Financeiro';
            case 'operadorCaixa':
                return 'Operador de Caixa';
            case 'operadorDelivery':
                return 'Operador Delivery';
            default:
                return cargo;
        }
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
                mb: 3
            }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Usuários
                </Typography>
                <Button
                    fullWidth={false}
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                >
                    Novo Usuário
                </Button>
            </Box>

            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Estabelecimentos</InputLabel>
                            <Select
                                multiple
                                value={selectedEstabelecimentos}
                                label="Estabelecimentos"
                                onChange={(e) => {
                                    const value = e.target.value as number[];
                                    setSelectedEstabelecimentos(value);
                                }}
                                renderValue={(selected) => (
                                    <Box sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 0.5,
                                        maxWidth: '100%',
                                        overflow: 'hidden'
                                    }}>
                                        {selected.map((value) => {
                                            const est = getEstabelecimentos().find(e => e.id === value);
                                            return (
                                                <Chip
                                                    key={value}
                                                    size="small"
                                                    label={est?.nome}
                                                    onDelete={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedEstabelecimentos(prev =>
                                                            prev.filter(id => id !== value)
                                                        );
                                                    }}
                                                    sx={{ maxWidth: { xs: '150px', sm: '200px' } }}
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                <MenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const todosIds = tenantsUsers.map((_, index) => index + 1);
                                        setSelectedEstabelecimentos(prev =>
                                            prev.length === tenantsUsers.length ? [] : todosIds
                                        );
                                    }}
                                >
                                    <Checkbox
                                        checked={selectedEstabelecimentos.length === tenantsUsers.length}
                                        indeterminate={selectedEstabelecimentos.length > 0 &&
                                            selectedEstabelecimentos.length < tenantsUsers.length}
                                    />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography>Selecionar Todos</Typography>
                                    </Box>
                                </MenuItem>
                                <Divider />
                                {tenantsUsers.map((tenant, index) => (
                                    <MenuItem key={tenant.tenant} value={index + 1}>
                                        <Checkbox checked={selectedEstabelecimentos.includes(index + 1)} />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                component="img"
                                                src={tenant.img}
                                                alt={tenant.tenant}
                                                sx={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: 1,
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            {tenant.tenant}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            placeholder="Buscar usuário..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Usuário</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Estabelecimentos</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', lg: 'table-cell' } }}>Telefone</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.map((user) => (
                            <TableRow
                                key={user.id}
                                hover
                                onClick={() => router.push(`/users/${user.id}`)}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                }}
                            >
                                <TableCell
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Switch
                                            checked={user.active}
                                            onChange={() => handleToggleStatus(user.id)}
                                            disabled={loading}
                                        />
                                        <Typography variant="caption" color="textSecondary">
                                            {user.active ? 'Ativo' : 'Inativo'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Person />
                                        <Box>
                                            <Typography variant="body2">{user.nome}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {user.email}
                                            </Typography>
                                            <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 1 }}>
                                                <Chip
                                                    label={formatCargo(user.cargo)}
                                                    color={user.cargo === 'admin' ? 'primary' : 'default'}
                                                    size="small"
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 1,
                                        flexWrap: 'wrap',
                                        maxWidth: '100%'
                                    }}>
                                        {tenantsUsers
                                            .filter(t => t.users.some(u => u.id === user.id))
                                            .map((tenant, index) => {
                                                const userInTenant = tenant.users.find(u => u.id === user.id);
                                                return (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.5,
                                                            backgroundColor: 'background.default',
                                                            borderRadius: 1,
                                                            p: { xs: 0.5, sm: 1 },
                                                            flexDirection: { xs: 'row', sm: 'column' },
                                                            width: { xs: '100%', sm: 'auto' },
                                                            minWidth: { sm: '120px' }
                                                        }}
                                                    >
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            width: { xs: '100%', sm: 'auto' },
                                                            justifyContent: { xs: 'space-between', sm: 'center' }
                                                        }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Box
                                                                    component="img"
                                                                    src={tenant.img}
                                                                    alt={tenant.tenant}
                                                                    sx={{
                                                                        width: { xs: 20, sm: 24 },
                                                                        height: { xs: 20, sm: 24 },
                                                                        borderRadius: 0.5,
                                                                        objectFit: 'cover'
                                                                    }}
                                                                />
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        display: 'block',
                                                                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                                    }}
                                                                >
                                                                    {tenant.tenant}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Chip
                                                            label={formatCargo(userInTenant?.cargo || '')}
                                                            size="small"
                                                            color={userInTenant?.cargo === 'admin' ? 'primary' : 'default'}
                                                            sx={{
                                                                height: '20px',
                                                                minWidth: { xs: '80px', sm: 'auto' },
                                                                '& .MuiChip-label': {
                                                                    px: 1,
                                                                    fontSize: '0.7rem',
                                                                    whiteSpace: 'nowrap'
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                                    {user.telefone}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Novo Usuário</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Dados Pessoais
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Nome Completo"
                                        fullWidth
                                        required
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="E-mail"
                                        type="email"
                                        fullWidth
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Telefone"
                                        fullWidth
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Dados de Acesso
                            </Typography>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.tenants[0].active}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                tenants: [{ ...formData.tenants[0], active: e.target.checked }]
                                            })}
                                        />
                                    }
                                    label="Usuário Ativo"
                                />
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Cargo</InputLabel>
                                        <Select
                                            value={formData.tenants[0].cargo}
                                            label="Cargo"
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                tenants: [{ ...formData.tenants[0], cargo: e.target.value }]
                                            })}
                                        >
                                            <MenuItem value="admin">Administrador</MenuItem>
                                            <MenuItem value="gerente">Gerente</MenuItem>
                                            <MenuItem value="financeiro">Financeiro</MenuItem>
                                            <MenuItem value="operadorCaixa">Operador de Caixa</MenuItem>
                                            <MenuItem value="operadorDelivery">Operador Delivery</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Senha"
                                        type="password"
                                        fullWidth
                                        required
                                        value={formData.senha}
                                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Confirmar Senha"
                                        type="password"
                                        fullWidth
                                        required
                                        value={formData.confirmarSenha}
                                        onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Vincular Estabelecimentos
                            </Typography>
                            <Grid container spacing={2}>
                                {tenantsUsers.map((tenant) => (
                                    <Grid item xs={12} sm={6} key={tenant.tenant}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                backgroundColor: 'background.default',
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 2,
                                                height: 'auto',
                                                minHeight: 120,
                                                position: 'relative'
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={tenant.img}
                                                alt={tenant.tenant}
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    minWidth: 60,
                                                    borderRadius: 2,
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <Box sx={{
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 2,
                                                width: '100%'
                                            }}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 'medium',
                                                        wordBreak: 'break-word',
                                                        lineHeight: 1.2,
                                                        height: '40px'
                                                    }}
                                                >
                                                    {tenant.tenant}
                                                </Typography>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    mt: 'auto'
                                                }}>
                                                    <Typography
                                                        variant="caption"
                                                        color="textSecondary"
                                                    >
                                                        {tenant.users.length} usuário(s)
                                                    </Typography>
                                                    <Switch
                                                        checked={formData.estabelecimentos.includes(
                                                            getEstabelecimentos().find(e => e.nome === tenant.tenant)?.id || 0
                                                        )}
                                                        onChange={(e) => {
                                                            const estId = getEstabelecimentos().find(e => e.nome === tenant.tenant)?.id;
                                                            if (estId) {
                                                                const newEstabelecimentos = e.target.checked
                                                                    ? [...formData.estabelecimentos, estId]
                                                                    : formData.estabelecimentos.filter(id => id !== estId);
                                                                setFormData({ ...formData, estabelecimentos: newEstabelecimentos });
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        Criar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersPage; 