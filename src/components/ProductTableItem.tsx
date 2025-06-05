import { Product } from "@/types/Product";
import { Delete, Edit, PowerSettingsNew } from "@mui/icons-material";
import { Box, Button, Switch, TableCell, TableRow, Typography } from "@mui/material";

// Função para formatar o preço como "R$ 00,00"
const formatCurrencyBRL = (value: number): string => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

type Props = {
    item: Product;
    onEdit: (item: Product) => void;
    onDelete: (item: Product) => void;
    onToggleStatus?: (item: Product) => void;
}

export const ProductTableItem = ({ item, onEdit, onDelete, onToggleStatus }: Props) => {
    return (
        <TableRow
            hover
            sx={{
                height: 100,
                opacity: item.ativo ? 1 : 0.6
            }}
        >
            <TableCell padding="checkbox">
                <Switch
                    size="small"
                    checked={item.ativo}
                    onChange={() => onToggleStatus?.(item)}
                    color="success"
                />
            </TableCell>
            <TableCell sx={{ width: 50, display: { xs: 'none', md: 'table-cell' } }}>{item.id}</TableCell>
            <TableCell sx={{ width: { xs: 50, md: 100 } }}>
                <img src={item.img} alt="" width="70%" />
            </TableCell>
            <TableCell>
                <Typography component="strong">{item.nome}</Typography>
                <Box sx={{ display: { md: 'none' } }}>
                    {formatCurrencyBRL(item.preco)}
                </Box>
            </TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                {formatCurrencyBRL(item.preco)}
            </TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{item.category.nome}</TableCell>
            <TableCell sx={{ width: { xs: 50, md: 130 } }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={() => onEdit(item)} size="small"><Edit /></Button>
                    <Button onClick={() => onDelete(item)} size="small"><Delete /></Button>
                </Box>
            </TableCell>
        </TableRow>
    );
}
