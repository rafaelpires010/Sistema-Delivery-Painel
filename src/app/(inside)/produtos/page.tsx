'use client'

import { ProdctEditdialog } from "@/components/ProductEditDialog";
import { ProductTableItem } from "@/components/ProductTableItem";
import { ProductTableSkeleton } from "@/components/ProductTableSkeleton";
import { useAuthContext } from "@/contexts/auth";
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
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { Add, Search, FilterList, Warning } from '@mui/icons-material';
import { getCookie } from "cookies-next";
import { FormEvent, useEffect, useState, useMemo } from "react";

const Page = () => {
    const theme = useTheme();
    const token = getCookie('token');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [categorias, setCategorias] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [productTodelete, setProductTodelete] = useState<Product>();
    const [loadingDelete, setLoadingDelete] = useState(false)

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product>();
    const [loadingEditDialog, setLoadingEditDialog] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        getProducts();
        loadCategories();
    }, []);

    const getProducts = async () => {
        setLoading(true);

        setProducts(await api.getProducts(token as string));
        setCategorias(await api.getCategories(token as string));

        setLoading(false);
    }

    const loadCategories = async () => {
        try {
            const categoriesData = await api.getCategories(token as string);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    };

    //deletar produto

    const handleDeleteProduct = (product: Product) => {
        setProductTodelete(product)
        setShowDeleteDialog(true);
    }

    const handleConfirmDelete = async () => {
        if (productTodelete) {
            setLoadingDelete(true)
            await api.deleteProduct(token as string, productTodelete.id)
            setLoadingDelete(false)
            setShowDeleteDialog(false);
            getProducts();
        }
    }

    //new/edit Product

    const handleNewProduct = () => {
        setProductToEdit(undefined);
        setEditDialogOpen(true);
    }

    const handleEditProduct = (product: Product) => {
        setProductToEdit(product);
        setEditDialogOpen(true)
    }
    const handleSaveEditDialog = async (event: FormEvent<HTMLFormElement>) => {
        let form = new FormData(event.currentTarget);

        setLoadingEditDialog(true);
        if (productToEdit) {
            form.append('id', productToEdit.id.toString());
            await api.updateProduct(token as string, form);
        } else {
            await api.createProduct(token as string, form)
        }
        setLoadingEditDialog(false);
        setEditDialogOpen(false);

        getProducts();
        console.log(form);
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filtra produtos baseado na categoria selecionada
    const filteredProducts = useMemo(() => {
        let filtered = selectedCategory === 'all'
            ? products
            : products.filter(product => product.category.id === Number(selectedCategory));

        // Ordena por ID
        return filtered.sort((a, b) => a.id - b.id);
    }, [products, selectedCategory]);

    const handleToggleStatus = async (product: Product) => {
        try {
            setLoading(true);
            // Implementar chamada à API
            await api.toggleProductStatus(token as string, product.id);
            await getProducts(); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        } finally {
            setLoading(false);
        }
    };

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
                    Produtos
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
                            {/* Campo de busca existente */}
                            <TextField
                                size="small"
                                placeholder="Buscar produtos..."
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

                            {/* Filtro de Categoria */}
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    label="Categoria"
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <MenuItem value="all">Todas as Categorias</MenuItem>
                                    {categories.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Botão de adicionar existente */}
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleNewProduct}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    boxShadow: 'none'
                                }}
                            >
                                Novo Produto
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
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Preço</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Categoria</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', width: { xs: 50, md: 130 } }}>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                Array(3).fill(0).map((_, index) => (
                                    <ProductTableSkeleton key={index} />
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Warning sx={{ fontSize: 40, color: 'text.secondary' }} />
                                            <Typography color="text.secondary">
                                                Nenhum produto encontrado
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(item => (
                                        <ProductTableItem
                                            key={item.id}
                                            item={item}
                                            onEdit={handleEditProduct}
                                            onDelete={handleDeleteProduct}
                                            onToggleStatus={handleToggleStatus}
                                        />
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredProducts.length}
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
                        Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
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

            <ProdctEditdialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveEditDialog}
                disabled={loadingEditDialog}
                product={productToEdit}
                categories={categorias}
            />
        </Box>
    );
}

export default Page;