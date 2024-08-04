import { Categoria } from "@/types/Categoria";
import { Delete, Edit } from "@mui/icons-material";
import { Button, TableCell, TableRow, Typography } from "@mui/material";

type Props = {
    item: Categoria;
    onEdit: (item: Categoria) => void;
    onDelete: (item: Categoria) => void;
    disabled?: boolean
}
export const CategoryTableItem = ({ item, onEdit, onDelete, disabled }: Props) => {
    return (
        <TableRow hover>
            <TableCell sx={{ width: 50, display: { xs: 'none', md: 'table-cell' } }}>{item.id}</TableCell>
            <TableCell>
                <Typography component="strong">{item.nome}</Typography>
            </TableCell>

            <TableCell sx={{ width: { xs: 50, md: 130 } }}>
                <Button onClick={() => onEdit(item)} size="small"><Edit /></Button>
                <Button disabled={disabled} onClick={() => onDelete(item)} size="small"><Delete /></Button>
            </TableCell>
        </TableRow>
    );
}