import { Order } from "@/types/Order";
import {
    Modal, Box, Typography, IconButton, Divider, Button,
    Table, TableBody, TableCell, TableRow
} from "@mui/material";
import { Close, Edit, Person, LocalShipping, Payment, AccessTime } from "@mui/icons-material";
import { dateFormat } from "@/libs/dateFormat";

interface OrderDetailsModalProps {
    order: Order;
    open: boolean;
    onClose: () => void;
    onEdit: (order: Order) => void;
}

export const OrderDetailsModal = ({ order, open, onClose, onEdit }: OrderDetailsModalProps) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: '80%', md: '60%' },
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                overflow: 'auto'
            }}>
                {/* Cabeçalho */}
                <Box sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                }}>
                    <Typography variant="h6">Detalhes do Pedido #{order.id}</Typography>
                    <IconButton onClick={onClose} sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </Box>

                <Box sx={{ p: 3 }}>
                    {/* Informações Básicas */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime color="action" />
                                <Typography>{dateFormat(order.data_order)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person color="action" />
                                <Typography>{order.user.nome}</Typography>
                                <Typography>{order.user.telefone}</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Endereço */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShipping /> Endereço de Entrega
                        </Typography>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Endereço</TableCell>
                                    <TableCell>
                                        {order.address.rua}, {order.address.numero}
                                        {order.address.complemento && ` - ${order.address.complemento}`}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Bairro</TableCell>
                                    <TableCell>{order.address.bairro}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Cidade/Estado</TableCell>
                                    <TableCell>{order.address.cidade} - {order.address.estado}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>CEP</TableCell>
                                    <TableCell>{order.address.cep}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Itens do Pedido */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Itens do Pedido</Typography>
                        <Table>
                            <TableBody>
                                {order.products.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.quantidade}x</TableCell>
                                        <TableCell>{item.nome_produto}</TableCell>
                                        <TableCell align="right">
                                            R$ {(item.preco * item.quantidade).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Pagamento */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Payment /> Pagamento
                        </Typography>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Forma de Pagamento</TableCell>
                                    <TableCell>{order.metodo_pagamento === 'card' ? 'Cartão' : 'Dinheiro'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Subtotal</TableCell>
                                    <TableCell>R$ {order.subtotal.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Taxa de Entrega</TableCell>
                                    <TableCell>R$ {order.shippingPrice.toFixed(2)}</TableCell>
                                </TableRow>
                                {order.cupomDiscount && (
                                    <TableRow>
                                        <TableCell>Desconto</TableCell>
                                        <TableCell>-R$ {order.cupomDiscount.toFixed(2)}</TableCell>
                                    </TableRow>
                                )}
                                {order.troco && order.troco > 0 && (
                                    <TableRow>
                                        <TableCell>Troco para</TableCell>
                                        <TableCell>R$ {order.troco.toFixed(2)}</TableCell>
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>R$ {order.preco.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Botões de Ação */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={() => onEdit(order)}
                        >
                            Editar Pedido
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}; 