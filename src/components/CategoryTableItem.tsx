import { Category } from "@/types/Category";
import { Delete, Edit } from "@mui/icons-material";
import { Button, TableCell, TableRow, Typography, Switch } from "@mui/material";

interface Props {
    item: Category;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onToggleStatus: (category: Category) => Promise<void>;
    disabled: boolean;
}

export const CategoryTableItem = ({ item, onEdit, onDelete, onToggleStatus, disabled }: Props) => {
    return (
        <TableRow hover sx={{ height: 100 }}>
            <TableCell>
                <Switch
                    checked={item.ativo}
                    onChange={() => onToggleStatus(item)}
                    disabled={disabled}
                />
            </TableCell>
            <TableCell sx={{ width: 50, display: { xs: 'none', md: 'table-cell' } }}>{item.id}</TableCell>
            <TableCell sx={{ width: { xs: 50, md: 100 } }}>
                <img src={item.img} alt="" width="70%" />
            </TableCell>
            <TableCell>
                <Typography component="strong">{item.nome}</Typography>
            </TableCell>
            <TableCell align="right" sx={{ width: { xs: 50, md: 130 } }}>
                <Button onClick={() => onEdit(item)} size="small"><Edit /></Button>
                <Button disabled={disabled} onClick={() => onDelete(item)} size="small"><Delete /></Button>
            </TableCell>
        </TableRow>
    );
}