'use client'

import { OrderItem } from "@/components/OrderItem";
import { ProdctEditdialog } from "@/components/ProductEditDialog";
import { ProductTableItem } from "@/components/ProductTableItem";
import { ProductTableSkeleton } from "@/components/ProductTableSkeleton";
import { api } from "@/libs/api";
import { dateFormat } from "@/libs/dateFormat";
import { Categoria } from "@/types/Categoria";
import { Order } from "@/types/Order";
import { OrderStatus } from "@/types/Ordersatus";
import { Product } from "@/types/Product";
import { Refresh, Search } from "@mui/icons-material";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, InputAdornment, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";

const Page = () => {

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [productTodelete, setProductTodelete] = useState<Product>();
    const [loadingDelete, setLoadingDelete] = useState(false)

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product>();
    const [loadingEditDialog, setLoadingEditDialog] = useState(false);


    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        setLoading(true);

        setProducts(await api.getProducts());
        setCategorias(await api.getCategories());

        setLoading(false);
    }

    //deletar produto

    const handleDeleteProduct = (product: Product) => {
        setProductTodelete(product)
        setShowDeleteDialog(true);
    }

    const handleConfirmDelete = async () => {
        if (productTodelete) {
            setLoadingDelete(true)
            await api.deleteProduct(productTodelete.id)
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
            await api.updateProduct(form);
        } else {
            await api.createProduct(form)
        }
        setLoadingEditDialog(false);
        setEditDialogOpen(false);

        getProducts();
    }

    return (
        <>
            <Box sx={{ my: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography component="h5" variant="h5" sx={{ color: '#555', mr: 2 }}>Produtos</Typography>
                    <Button onClick={handleNewProduct}>Novo Produto</Button>
                </Box>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 50, display: { xs: 'none', md: 'table-cell' } }}>ID</TableCell>
                            <TableCell>Imagem</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Preço</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Categoria</TableCell>
                            <TableCell sx={{ width: { xs: 50, md: 130 } }}>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading &&
                            <>
                                <ProductTableSkeleton />
                                <ProductTableSkeleton />
                                <ProductTableSkeleton />
                            </>
                        }
                        {!loading && products.map(item => (
                            <ProductTableItem
                                key={item.id}
                                item={item}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteProduct}
                            />
                        ))}
                    </TableBody>
                </Table>

                <Dialog open={showDeleteDialog} onClose={() => !loadingDelete ? setShowDeleteDialog(false) : null}>
                    <DialogTitle>Temm certeza qe deseja deletar esse Produto?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            O produto será excluido permanentemente após essa ação.
                        </DialogContentText>
                        <DialogActions>
                            <Button disabled={loadingDelete} onClick={() => setShowDeleteDialog(false)}>Não</Button>
                            <Button disabled={loadingDelete} onClick={handleConfirmDelete}>Sim</Button>
                        </DialogActions>
                    </DialogContent>
                </Dialog>

                <ProdctEditdialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    onSave={handleSaveEditDialog}
                    disabled={loadingEditDialog}
                    product={productToEdit}
                    categories={categorias}
                />
            </Box >
        </>
    );
}

export default Page;