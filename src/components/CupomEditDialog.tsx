import { Category } from "@/types/Category";
import { Cupom } from "@/types/Cupom";
import { Box, Button, Dialog, DialogContent, DialogTitle, Input, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { FormEvent } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (event: FormEvent<HTMLFormElement>) => void;
    cupom?: Cupom;
    disabled?: boolean;
};

export const CupomEditDialog = ({ open, onClose, onSave, cupom, disabled }: Props) => {
    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Pega o formulário
        const form = event.currentTarget;
        const formData = new FormData(form);

        // Data de início às 00:00
        if (!formData.get('dataInicio')) {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            formData.set('dataInicio', hoje.toISOString().slice(0, 10));
        }

        // Data de validade às 23:59
        const validade = formData.get('validade');
        if (validade) {
            const dataValidade = new Date(validade as string);
            dataValidade.setHours(23, 59, 0, 0);
            formData.set('validade', dataValidade.toISOString());
        }

        onSave(event);
    };

    const convertCommaToDot = (value: string): string => {
        return value.replace('.', ',');
    };

    // Converte o desconto para string e aplica a função de conversão se não for undefined
    const formattedDesconto = cupom?.desconto !== undefined
        ? convertCommaToDot(cupom.desconto.toFixed(2))
        : '';

    // Formata a data de validade
    const formattedValidade = cupom?.validade
        ? new Date(cupom.validade).toISOString().slice(0, 16)
        : '';


    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle>{cupom ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    onSubmit={handleFormSubmit}
                    encType="multipart/form-data"
                    sx={{ mt: 2 }}
                >
                    {/* Campo ID oculto para edição */}
                    {cupom && <input type="hidden" name="id" value={cupom.id} />}

                    <Box sx={{ mb: 2 }}>
                        <InputLabel variant="standard" htmlFor="codigoField">Código*</InputLabel>
                        <TextField
                            id="codigoField"
                            variant="standard"
                            name="codigo"
                            defaultValue={cupom?.codigo}
                            required
                            fullWidth
                            disabled={disabled}
                            inputProps={{
                                style: { textTransform: 'uppercase' },
                                onInput: (e: React.ChangeEvent<HTMLInputElement>) => {
                                    e.target.value = e.target.value.toUpperCase();
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <InputLabel variant="standard" htmlFor="descontoField">
                            Desconto {cupom?.tipoDesconto === 'PERCENTUAL' ? '(%)' : '(R$)'}
                        </InputLabel>
                        <TextField
                            id="descontoField"
                            variant="standard"
                            name="desconto"
                            type="number"
                            defaultValue={cupom?.desconto || ''}
                            required
                            fullWidth
                            disabled={disabled}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <InputLabel variant="standard" htmlFor="tipoDescontoField">Tipo de Desconto*</InputLabel>
                        <Select
                            id="tipoDescontoField"
                            variant="standard"
                            name="tipoDesconto"
                            defaultValue={cupom?.tipoDesconto || "PERCENTUAL"}
                            required
                            fullWidth
                            disabled={disabled}
                        >
                            <MenuItem value="PERCENTUAL">Percentual</MenuItem>
                            <MenuItem value="VALOR">Valor</MenuItem>
                        </Select>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <InputLabel variant="standard" htmlFor="dataInicioField">Data de Início</InputLabel>
                        <TextField
                            id="dataInicioField"
                            variant="standard"
                            name="dataInicio"
                            type="date"
                            defaultValue={cupom?.dataInicio ? new Date(cupom.dataInicio).toISOString().slice(0, 10) : ''}
                            fullWidth
                            disabled={disabled}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <InputLabel variant="standard" htmlFor="validadeField">
                            Validade (deixe em branco para cupom sem expiração)
                        </InputLabel>
                        <TextField
                            id="validadeField"
                            variant="standard"
                            name="validade"
                            type="date"
                            defaultValue={cupom?.validade ? new Date(cupom.validade).toISOString().slice(0, 10) : ''}
                            fullWidth
                            disabled={disabled}
                            InputProps={{
                                sx: { cursor: 'pointer' }
                            }}
                            inputProps={{
                                onKeyDown: (e) => {
                                    if (e.key === 'Delete' || e.key === 'Backspace') {
                                        (e.target as HTMLInputElement).value = '';
                                    }
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <InputLabel variant="standard" htmlFor="limiteUsoField">Limite de Uso</InputLabel>
                        <TextField
                            id="limiteUsoField"
                            variant="standard"
                            name="limiteUso"
                            type="number"
                            defaultValue={cupom?.limiteUso}
                            fullWidth
                            disabled={disabled}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <InputLabel variant="standard" htmlFor="valorMinimoField">
                            Valor Mínimo (R$)
                        </InputLabel>
                        <TextField
                            id="valorMinimoField"
                            variant="standard"
                            name="valorMinimo"
                            type="number"
                            defaultValue={cupom?.valorMinimo || ''}
                            fullWidth
                            disabled={disabled}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <InputLabel variant="standard" htmlFor="descricaoField">Descrição</InputLabel>
                        <TextField
                            id="descricaoField"
                            variant="standard"
                            name="descricao"
                            defaultValue={cupom?.descricao}
                            multiline
                            rows={4}
                            fullWidth
                            disabled={disabled}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button disabled={disabled} onClick={onClose}>Cancelar</Button>
                        <Button disabled={disabled} type="submit" variant="contained">
                            {cupom ? 'Editar Cupom' : 'Adicionar'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
