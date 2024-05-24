'use client'

import { CategoryEditDialog } from "@/components/CategoryEditDialog";
import { CategoryTableItem } from "@/components/CategoryTableItem";
import { CategoryTableSkeleton } from "@/components/CategoryTableSkeleton";
import { api } from "@/libs/api";
import { Categoria } from "@/types/Categoria";
import { Product } from "@/types/Product";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";

const Page = () => {

    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [products, setProducts] = useState<Product[]>([])

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [categoryTodelete, setCategoryTodelete] = useState<Categoria>();
    const [loadingDelete, setLoadingDelete] = useState(false)

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [CategoryToEdit, setCategoryToEdit] = useState<Categoria>();
    const [loadingEditDialog, setLoadingEditDialog] = useState(false);


    useEffect(() => {
        getCategorys();
    }, []);

    const getCategorys = async () => {
        setLoading(true);
        setCategorias(await api.getCategories());
        setProducts(await api.getProducts());
        setLoading(false);
    }

    // Check if category is associated with any product
    const isCategoryAssociated = (categoryId: number) => {
        return products.some(product => product.categoria.id === categoryId);
    }

    //deletar Category

    const handleDeleteCategory = (category: Categoria) => {
        setCategoryTodelete(category)
        setShowDeleteDialog(true);
    }

    const handleConfirmDelete = async () => {
        if (categoryTodelete) {
            setLoadingDelete(true)
            await api.deleteCategory(categoryTodelete.id)
            setLoadingDelete(false)
            setShowDeleteDialog(false);
            getCategorys();
        }
    }

    //new/edit Category

    const handleNewCategory = () => {
        setCategoryToEdit(undefined);
        setEditDialogOpen(true);
    }

    const handleEditCategory = (category: Categoria) => {
        setCategoryToEdit(category);
        setEditDialogOpen(true)
    }
    const handleSaveEditDialog = async (event: FormEvent<HTMLFormElement>) => {
        let form = new FormData(event.currentTarget);

        setLoadingEditDialog(true);
        if (CategoryToEdit) {
            form.append('id', CategoryToEdit.id.toString());
            await api.updateCategory(form);
        } else {
            await api.createCategory(form)
        }
        setLoadingEditDialog(false);
        setEditDialogOpen(false);

        getCategorys();
    }


    return (
        <>
            <Box sx={{ my: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography component="h5" variant="h5" sx={{ color: '#555', mr: 2 }}>Categorias</Typography>
                    <Button onClick={handleNewCategory}>Nova Categoria</Button>
                </Box>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 50 }}>ID</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell sx={{ width: { xs: 50, md: 130 } }}>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading &&
                            <>
                                <CategoryTableSkeleton />
                                <CategoryTableSkeleton />
                                <CategoryTableSkeleton />

                            </>
                        }
                        {!loading && categorias.map(item => (
                            <CategoryTableItem
                                key={item.id}
                                item={item}
                                onEdit={handleEditCategory}
                                onDelete={handleDeleteCategory}
                                disabled={isCategoryAssociated(item.id)}
                            />
                        ))}
                    </TableBody>
                </Table>

                <Dialog open={showDeleteDialog} onClose={() => !loadingDelete ? setShowDeleteDialog(false) : null}>
                    <DialogTitle>Temm certeza qe deseja deletar essa categoria?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            A categoria será excluida permanentemente após essa ação.
                        </DialogContentText>
                        <DialogActions>
                            <Button disabled={loadingDelete} onClick={() => setShowDeleteDialog(false)}>Não</Button>
                            <Button disabled={loadingDelete} onClick={handleConfirmDelete}>Sim</Button>
                        </DialogActions>
                    </DialogContent>
                </Dialog>

                <CategoryEditDialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    onSave={handleSaveEditDialog}
                    disabled={loadingEditDialog}
                    category={CategoryToEdit}
                />
            </Box >
        </>
    );
}

export default Page;