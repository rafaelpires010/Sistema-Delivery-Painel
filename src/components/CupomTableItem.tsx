import { dateFormat } from "@/libs/dateFormat";
import { formatCurrency } from "@/libs/formatCurrency";
import { Cupom } from "@/types/Cupom";
import { Delete, Edit } from "@mui/icons-material";
import { Button, Switch, TableCell, TableRow, Typography, Box } from "@mui/material";
import { useState } from "react";
import { getCookie } from "cookies-next";
import { api } from "@/libs/api";

interface CupomTableItemProps {
    item: Cupom;
    onEdit: (cupom: Cupom) => void;
    onDelete: (cupom: Cupom) => void;
    onToggleStatus: (id: number) => void;
}

export const CupomTableItem = ({ item, onEdit, onDelete, onToggleStatus }: CupomTableItemProps) => {
    const token = getCookie('token');
    const [loadingToggle, setLoadingToggle] = useState(false);

    const handleToggleStatus = async () => {
        try {
            setLoadingToggle(true);
            await api.toggleCupomStatus(token as string, item.id);
            onToggleStatus(item.id);
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        } finally {
            setLoadingToggle(false);
        }
    };

    const formatDesconto = (valor: number, tipo: 'PERCENTUAL' | 'VALOR') => {
        if (tipo === 'PERCENTUAL') {
            return `${valor}%`;
        } else {
            return formatCurrency(valor);
        }
    };

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return "n/c";
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            const localDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
            return dateFormat(localDate.toISOString());
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return "n/c";
        }
    };

    return (
        <TableRow hover sx={{ height: 100 }}>
            {/* Status ativo/desativado */}
            <TableCell sx={{ width: 50 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                        size="small"
                        checked={item.ativo}
                        onChange={handleToggleStatus}
                        disabled={loadingToggle}
                    />
                    <Typography
                        variant="caption"
                        color={item.ativo ? "success.main" : "text.secondary"}
                    >
                        {item.ativo ? 'Ativado' : 'Desativado'}
                    </Typography>
                </Box>
            </TableCell>

            {/* Código do cupom */}
            <TableCell>
                {item.codigo}
            </TableCell>

            {/* Data de início */}
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {formatDate(item.dataInicio)}
            </TableCell>

            {/* Validade */}
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {formatDate(item.validade)}
            </TableCell>

            {/* Tipo de desconto */}
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {item.tipoDesconto}
            </TableCell>

            {/* Usados */}
            <TableCell>
                {`${item.usosAtuais}/${item.limiteUso}`}
            </TableCell>

            {/* Valor mínimo */}
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {formatCurrency(item.valorMinimo || 0)}
            </TableCell>

            {/* Desconto */}
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                {formatDesconto(item.desconto, item.tipoDesconto)}
            </TableCell>

            {/* Descrição */}
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                {item.descricao}
            </TableCell>

            {/* Botões de ação */}
            <TableCell sx={{ width: { xs: 50, md: 130 } }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={() => onEdit(item)} size="small">
                        <Edit />
                    </Button>
                    <Button onClick={() => onDelete(item)} size="small">
                        <Delete />
                    </Button>
                </Box>
            </TableCell>
        </TableRow>
    );
};
