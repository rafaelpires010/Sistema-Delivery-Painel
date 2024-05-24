import { Product } from "@/types/Product";
import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, TableCell, TableRow, Typography } from "@mui/material";

type Props = {
    item: Product;
    onEdit: (item: Product) => void;
    onDelete: (item: Product) => void;
}
export const ProductTableItem = ({ item, onEdit, onDelete }: Props) => {
    return (
        <TableRow hover>
            <TableCell sx={{ width: 50, display: { xs: 'none', md: 'table-cell' } }}>{item.id}</TableCell>
            <TableCell sx={{ width: { xs: 50, md: 100 } }}>
                <img src={item.image} alt="" width="100%" />
            </TableCell>
            <TableCell>
                <Typography component="strong">{item.nome}</Typography>
                <Box sx={{ display: { md: 'none' } }}>
                    R$ {item.preco.toFixed(2)}
                </Box>
            </TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                {item.preco.toFixed(2)}
            </TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{item.categoria.name}</TableCell>
            <TableCell sx={{ width: { xs: 50, md: 130 } }}>
                <Button onClick={() => onEdit(item)} size="small"><Edit /></Button>
                <Button onClick={() => onDelete(item)} size="small"><Delete /></Button>
            </TableCell>
        </TableRow>
    );
}