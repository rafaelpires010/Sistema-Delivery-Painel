import { Categoria } from "@/types/Categoria";
import { Box, Button, Dialog, DialogContent, DialogTitle, Input, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { FormEvent } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (event: FormEvent<HTMLFormElement>) => void;
    category?: Categoria;
    disabled?: boolean;
}
export const CategoryEditDialog = ({ open, onClose, onSave, category, disabled }: Props) => {
    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSave(event);
    }

    return (

        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleFormSubmit}>
                    <Box sx={{ mb: 2 }}>
                        <InputLabel variant="standard" htmlFor="nameField">Nome</InputLabel>
                        <TextField
                            id="nameField"
                            variant="standard"
                            name="name"
                            defaultValue={category?.nome}
                            required
                            fullWidth
                            disabled={disabled}
                        />
                    </Box>



                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button disabled={disabled} onClick={onClose}>Cancelar</Button>
                        <Button disabled={disabled} type="submit">{category ? 'Editar Categoria' : 'Adicionar'}</Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}