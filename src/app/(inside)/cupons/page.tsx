'use client';

import { CupomEditDialog } from "@/components/CupomEditDialog";
import { CupomTableItem } from "@/components/CupomTableItem";
import { useAuthContext } from "@/contexts/auth";
import { api } from "@/libs/api";
import { Cupom } from "@/types/Cupom";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
    TablePagination,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Skeleton,
    Switch
} from "@mui/material";
import { Add, Search, FilterList } from '@mui/icons-material';
import { getCookie } from "cookies-next";
import { FormEvent, useEffect, useState } from "react";

const CupomsPage = () => {
    const theme = useTheme();
    const token = getCookie('token');
    const [loading, setLoading] = useState(false);
    const [cupoms, setCupoms] = useState<Cupom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [CupomToDelete, setCupomToDelete] = useState<Cupom>();
    const [loadingDelete, setLoadingDelete] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [CupomToEdit, setCupomToEdit] = useState<Cupom>();
    const [loadingEditDialog, setLoadingEditDialog] = useState(false);

    const [activeStatus, setActiveStatus] = useState<boolean>(true);

    const [loadingToggle, setLoadingToggle] = useState(false);

    useEffect(() => {
        getCupoms();
    }, []);

    const getCupoms = async () => {
        setLoading(true);
        try {
            const cupomList = await api.getCupons(token as string);
            // Ordena os cupons por ID em ordem crescente
            const sortedCupons = cupomList.sort((a, b) => a.id - b.id);
            setCupoms(sortedCupons);
        } catch (error) {
            console.error('Erro ao buscar cupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = (cupomId: number) => {
        setCupoms(cupoms.map(cupom =>
            cupom.id === cupomId
                ? { ...cupom, ativo: !cupom.ativo }
                : cupom
        ));
    };

    const handleDeleteCupom = (cupom: Cupom) => {
        setCupomToDelete(cupom);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (CupomToDelete) {
            setLoadingDelete(true);
            try {
                await api.deleteCupom(token as string, CupomToDelete.id);
                setCupoms(cupoms.filter(cupom => cupom.id !== CupomToDelete.id));
                setShowDeleteDialog(false);
            } catch (error) {
                console.error('Erro ao deletar cupom:', error);
                alert('Erro ao deletar cupom. Tente novamente.');
            } finally {
                setLoadingDelete(false);
            }
        }
    };

    const handleNewCupom = () => {
        setCupomToEdit(undefined);
        setEditDialogOpen(true);
    };

    const handleEditCupom = (Cupom: Cupom) => {
        setCupomToEdit(Cupom);
        setEditDialogOpen(true);
    };

    const handleSaveEditDialog = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoadingEditDialog(true);

        try {
            const form = new FormData(event.currentTarget);

            if (CupomToEdit) {
                form.append('id', CupomToEdit.id.toString());
                await api.updateCupom(token as string, form);
            } else {
                await api.createCupom(token as string, form);
            }

            setEditDialogOpen(false);
            getCupoms(); // Recarrega a lista após salvar
        } catch (error) {
            console.error('Erro ao salvar cupom:', error);
        } finally {
            setLoadingEditDialog(false);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredCupoms = cupoms.filter(cupom =>
        cupom.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ my: 3 }}>
            {/* Cabeçalho */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 2
                }}
            >
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 2
                }}>
                    <Typography
                        component="h5"
                        variant="h5"
                        sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 'bold'
                        }}
                    >
                        Cupons
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleNewCupom}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: 'none'
                        }}
                    >
                        Novo Cupom
                    </Button>
                </Box>

                {/* Barra de Pesquisa */}
                <Box sx={{ mt: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Pesquisar cupons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton>
                                        <FilterList />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 }
                        }}
                    />
                </Box>
            </Paper>

            {/* Tabela */}
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Data de Início</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Validade</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Tipo</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Usados</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', lg: 'table-cell' } }}>Valor Mín.</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', lg: 'table-cell' } }}>Valor</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', lg: 'table-cell' } }}>Descrição</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton /></TableCell>
                                        <TableCell><Skeleton /></TableCell>
                                        <TableCell><Skeleton /></TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Skeleton /></TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Skeleton /></TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Skeleton /></TableCell>
                                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}><Skeleton /></TableCell>
                                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}><Skeleton /></TableCell>
                                        <TableCell><Skeleton /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                filteredCupoms
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(item => (
                                        <CupomTableItem
                                            key={item.id}
                                            item={item}
                                            onEdit={handleEditCupom}
                                            onDelete={handleDeleteCupom}
                                            onToggleStatus={handleToggleStatus}
                                        />
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredCupoms.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[100, 50, 25, 10]}
                    labelRowsPerPage="Itens por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>

            {/* Diálogo de Confirmação de Exclusão */}
            <Dialog
                open={showDeleteDialog}
                onClose={() => !loadingDelete ? setShowDeleteDialog(false) : null}
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        disabled={loadingDelete}
                        onClick={() => setShowDeleteDialog(false)}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        disabled={loadingDelete}
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2
                        }}
                    >
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>

            <CupomEditDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveEditDialog}
                cupom={CupomToEdit}
                disabled={loadingEditDialog}
            />
        </Box>
    );
};

export default CupomsPage;
