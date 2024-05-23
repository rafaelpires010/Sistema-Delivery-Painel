import { dateFormat } from "@/libs/dateFormat";
import { Order } from "@/types/Order";
import { OrderStatus } from "@/types/Ordersatus";
import { Box, Button, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";

type Props = {
    item: Order;
    onChangeStatus: (id: number, newStatus: OrderStatus) => void;
    onPrint: (order: Order) => void;
}

export const OrderItem = ({ item, onChangeStatus, onPrint }: Props) => {

    const getStatusBg = (status: OrderStatus) => {
        const statuses = {
            preparing: '#2787BA',
            sent: '#27BA3A',
            delivered: '#999999',
        }
        return statuses[status];
    }

    const handleStatusChange = (event: SelectChangeEvent) => {
        onChangeStatus(item.id, event.target.value as OrderStatus);
    }

    const handlePrintButton = () => {
        onPrint(item)
    }

    return (
        <Box sx={{ border: '1px solid #EEE,', color: '#FFF', borderRadius: 2, overflow: 'hidden', boxShadow: '0px 8px 40px rgba(0, 0, 0, 0.15)' }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                backgroundColor: getStatusBg(item.status)
            }}
            >
                <Box>
                    <Typography component="p">{dateFormat(item.orderDate)}</Typography>
                    <Typography component="p">{item.userName}</Typography>
                    <Button onClick={handlePrintButton} size="small" sx={{ color: '#FFF', p: 0 }}>Imprimir</Button>
                </Box>
                <Box>
                    <Typography component="p" sx={{ fontSize: 24 }}>#{item.id}</Typography>
                </Box>

            </Box>
            <Box sx={{ p: 1, backgroundColor: '#EEE' }}>
                <Select
                    variant="standard"
                    value={item.status}
                    fullWidth
                    onChange={handleStatusChange}
                >
                    <MenuItem value="preparing">Preparando</MenuItem>
                    <MenuItem value="sent">Enviado</MenuItem>
                    <MenuItem value="delivered">Entregue</MenuItem>
                </Select>
            </Box>
            <Box sx={{ p: 1, backgroundColor: '#FFF' }}>
                {item.products.map((productItem, index) => (
                    <Typography
                        key={index}
                        component="p"
                        sx={{
                            p: 1,
                            color: '#000',
                            fontWeight: 'bold',
                            borderBottom: '1px solid #CCC'
                        }}
                    >
                        {`${productItem.qt} x ${productItem.product.nome}`}
                    </Typography>
                ))}
            </Box>
        </Box>
    );
}