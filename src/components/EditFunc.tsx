import React, { useState, useEffect, FormEvent } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    IconButton,
    Tooltip,
    Button,
    Typography,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { TenantFuncionamento } from '@/types/TenantFuncionamento';

type Props = {
    data: TenantFuncionamento;
    onEditFunc: (event: FormEvent<HTMLFormElement>) => void;
};

const EditFunc = ({ data, onEditFunc }: Props) => {
    const [horarios, setHorarios] = useState([
        { dia: 'Segunda-feira', abertura: data.segOpen, encerramento: data.segClose },
        { dia: 'Terça-feira', abertura: data.terOpen, encerramento: data.terClose },
        { dia: 'Quarta-feira', abertura: data.quarOpen, encerramento: data.quarClose },
        { dia: 'Quinta-feira', abertura: data.quinOpen, encerramento: data.quinClose },
        { dia: 'Sexta-feira', abertura: data.sexOpen, encerramento: data.sexClose },
        { dia: 'Sábado', abertura: data.sabOpen, encerramento: data.sabClose },
        { dia: 'Domingo', abertura: data.domOpen, encerramento: data.domClose },
    ]);

    const [editando, setEditando] = useState(false);
    const [horariosEditados, setHorariosEditados] = useState([...horarios]);

    // Função para formatar os horários no formato "HH:mm"
    const formatHorario = (hora: string) => `${hora.slice(0, 2)}:${hora.slice(2, 4)}`;

    // Atualiza os horários formatados com base nos dados iniciais
    useEffect(() => {
        const novosHorarios = [
            { dia: 'Segunda-feira', abertura: formatHorario(data.segOpen), encerramento: formatHorario(data.segClose) },
            { dia: 'Terça-feira', abertura: formatHorario(data.terOpen), encerramento: formatHorario(data.terClose) },
            { dia: 'Quarta-feira', abertura: formatHorario(data.quarOpen), encerramento: formatHorario(data.quarClose) },
            { dia: 'Quinta-feira', abertura: formatHorario(data.quinOpen), encerramento: formatHorario(data.quinClose) },
            { dia: 'Sexta-feira', abertura: formatHorario(data.sexOpen), encerramento: formatHorario(data.sexClose) },
            { dia: 'Sábado', abertura: formatHorario(data.sabOpen), encerramento: formatHorario(data.sabClose) },
            { dia: 'Domingo', abertura: formatHorario(data.domOpen), encerramento: formatHorario(data.domClose) },
        ];
        setHorarios(novosHorarios);
        setHorariosEditados(novosHorarios);
    }, [data]);

    const toggleEdicao = () => {
        if (editando) {
            setHorarios([...horariosEditados]); // Salva alterações
        }
        setEditando(!editando); // Alterna o estado
    };

    const handleHorarioChange = (index: number, campo: 'abertura' | 'encerramento', valor: string) => {
        const novosHorarios = [...horariosEditados];
        novosHorarios[index][campo] = valor;
        setHorariosEditados(novosHorarios);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Criação do FormData a partir do formulário
        const form = new FormData(event.currentTarget);

        // Define os nomes dos campos correspondentes
        const fieldNames = [
            { abertura: 'segOpen', encerramento: 'segClose' },
            { abertura: 'terOpen', encerramento: 'terClose' },
            { abertura: 'quarOpen', encerramento: 'quarClose' },
            { abertura: 'quinOpen', encerramento: 'quinClose' },
            { abertura: 'sexOpen', encerramento: 'sexClose' },
            { abertura: 'sabOpen', encerramento: 'sabClose' },
            { abertura: 'domOpen', encerramento: 'domClose' },
        ];

        // Mapeia os horários editados e adiciona ao FormData
        horariosEditados.forEach((horario, index) => {
            form.append(fieldNames[index].abertura, horario.abertura.replace(':', ''));
            form.append(fieldNames[index].encerramento, horario.encerramento.replace(':', ''));
        });

        // Simula a anexação ao evento (ou passa diretamente o FormData)
        const customEvent = {
            ...event,
            formData: form,
        };

        // Chama a função de edição com o evento modificado
        onEditFunc(customEvent as FormEvent<HTMLFormElement>);
        setEditando(false)
    };

    return (
        <Box
            sx={{
                padding: 3,
                backgroundColor: '#f9f9f9',
                borderRadius: 2,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Horários de Funcionamento
                </Typography>
                <Tooltip title={editando ? 'Salvar alterações' : 'Editar horários'}>
                    <IconButton color="primary" onClick={toggleEdicao}>
                        <Edit />
                    </IconButton>
                </Tooltip>
            </Box>

            <form onSubmit={handleSubmit}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>Dia</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Abertura</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Encerramento</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {horarios.map((horario, index) => (
                                <TableRow key={index}>
                                    <TableCell>{horario.dia}</TableCell>
                                    <TableCell>
                                        {editando ? (
                                            <TextField
                                                size="small"
                                                type="time"
                                                value={horariosEditados[index].abertura}
                                                onChange={(e) =>
                                                    handleHorarioChange(index, 'abertura', e.target.value)
                                                }
                                            />
                                        ) : (
                                            horario.abertura
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editando ? (
                                            <TextField
                                                size="small"
                                                type="time"
                                                value={horariosEditados[index].encerramento}
                                                onChange={(e) =>
                                                    handleHorarioChange(index, 'encerramento', e.target.value)
                                                }
                                            />
                                        ) : (
                                            horario.encerramento
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {editando && (
                    <Box sx={{ marginTop: 2, textAlign: 'right' }}>
                        <Button type="submit" variant="contained" color="success">
                            Salvar Alterações
                        </Button>
                    </Box>
                )}
            </form>
        </Box>
    );
};

export default EditFunc;
