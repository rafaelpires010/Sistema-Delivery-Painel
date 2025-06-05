'use client'

import { CategoryEditDialog } from "@/components/CategoryEditDialog";
import { CategoryTableItem } from "@/components/CategoryTableItem";
import { CategoryTableSkeleton } from "@/components/CategoryTableSkeleton";
import { api } from "@/libs/api";
import { Category } from "@/types/Category";
import { Product } from "@/types/Product";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    TextField,
    InputAdornment,
    IconButton,
    TablePagination,
    useTheme,
    Chip,
    Switch
} from "@mui/material";
import { Add, Search, FilterList, Warning } from '@mui/icons-material';
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const Page = () => {
    const theme = useTheme();
    const router = useRouter();
    const token = getCookie('token');
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category>();
    const [loadingDelete, setLoadingDelete] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category>();
    const [loadingEditDialog, setLoadingEditDialog] = useState(false);

    useEffect(() => {
        getCategories();
    }, []);

    const getCategories = async () => {
        setLoading(true);
        setCategorias(await api.getCategories(token as string));
        setProducts(await api.getProducts(token as string));
        setLoading(false);
    };

    const isCategoryAssociated = (categoryId: number) => {
        return products.some(product => product.category.id === categoryId);
    };

    const handleDeleteCategory = (category: Category) => {
        setCategoryToDelete(category);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (categoryToDelete) {
            setLoadingDelete(true);
            await api.deleteCategory(token as string, categoryToDelete.id);
            setLoadingDelete(false);
            setShowDeleteDialog(false);
            getCategories();
        }
    };

    const handleNewCategory = () => {
        setCategoryToEdit(undefined);
        setEditDialogOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setCategoryToEdit(category);
        setEditDialogOpen(true);
    };

    const handleSaveEditDialog = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoadingEditDialog(true);
        let form = new FormData(event.currentTarget);

        if (categoryToEdit) {
            form.append('id', categoryToEdit.id.toString());
            await api.updateCategory(token as string, form);
        } else {
            await api.CreateCategory(token as string, form);
        }

        setLoadingEditDialog(false);
        setEditDialogOpen(false);
        getCategories();
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleToggleStatus = async (category: Category) => {
        try {
            setLoading(true);
            await api.toggleCategoryStatus(token as string, category.id);
            await getCategories(); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categorias.filter(category =>
        category.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ my: 3 }}>
            {/* Cabeçalho e Barra de Pesquisa */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 2
                }}
            >
                <Typography
                    component="h5"
                    variant="h5"
                    sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 'bold'
                    }}
                >
                    Categorias
                </Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'flex-end',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 2
                }}>
                    <Box sx={{ p: 3 }}>
                        {/* Filtros */}
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            mb: 3,
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}>
                            <TextField
                                size="small"
                                placeholder="Buscar categorias..."
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

                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleNewCategory}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    boxShadow: 'none'
                                }}
                            >
                                Nova Categoria
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Tabela */}
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Ativo</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: 50, display: { xs: 'none', md: 'table-cell' } }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Imagem</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', width: { xs: 50, md: 130 } }}>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                Array(3).fill(0).map((_, index) => (
                                    <CategoryTableSkeleton key={index} />
                                ))
                            ) : filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Warning sx={{ fontSize: 40, color: 'text.secondary' }} />
                                            <Typography color="text.secondary">
                                                Nenhuma categoria encontrada
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(item => (
                                        <CategoryTableItem
                                            key={item.id}
                                            item={item}
                                            onEdit={handleEditCategory}
                                            onDelete={handleDeleteCategory}
                                            onToggleStatus={handleToggleStatus}
                                            disabled={isCategoryAssociated(item.id)}
                                        />
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredCategories.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
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
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning color="warning" />
                        Confirmar Exclusão
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {categoryToDelete && isCategoryAssociated(categoryToDelete.id) ? (
                            "Esta categoria não pode ser excluída pois está associada a produtos."
                        ) : (
                            "Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
                        )}
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
                    {!categoryToDelete || !isCategoryAssociated(categoryToDelete.id) && (
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
                    )}
                </DialogActions>
            </Dialog>

            <CategoryEditDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveEditDialog}
                disabled={loadingEditDialog}
                category={categoryToEdit}
            />
        </Box>
    );
};

export default Page;
