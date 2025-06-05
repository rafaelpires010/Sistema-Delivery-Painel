'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    Tabs,
    Tab,
} from '@mui/material';
import EditLayout from '@/components/EditLayout';
import EditInfos from '@/components/EditInfos';
import EditFunc from '@/components/EditFunc';
import EditEndereco from '@/components/EditEndereco';
import { api } from "@/libs/api";
import { Tenant } from '@/types/Tenant';
import { getCookie } from 'cookies-next';
import axios from 'axios';

const EditTenantPage = () => {
    const [abaAtiva, setAbaAtiva] = useState(0);
    const [tenant, setTenant] = useState<Tenant | null>(null); // Garantir que tenant possa ser null inicialmente
    const token = getCookie('token');

    const handleAbaChange = (event: React.SyntheticEvent, novaAba: number) => {
        setAbaAtiva(novaAba);
    };

    const handleEditImg = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            // Validar se o ID do tenant está presente
            if (!tenant?.id) {
                throw new Error("ID do tenant não foi definido.");
            }

            // Criar o FormData com os dados necessários
            const form = new FormData();
            form.append("id", tenant.id.toString());

            // Adicionar o arquivo ao FormData, se houver
            const { files } = event.target;
            if (files && files.length > 0) {
                Array.from(files).forEach((file) => form.append("img", file));
            }

            // Fazer a chamada da API para atualizar o layout do tenant
            const response = await api.updateLayoutTenant(token as string, form);

            // Exibir uma mensagem de sucesso
            console.log("Layout atualizado com sucesso:", response);
            getTenant();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "Erro ao atualizar Layout:",
                    error.response?.data || error.message
                );
            } else {
                console.error("Erro inesperado:", error);
            }
            throw error;
        }
    };

    const handleEditMainColor = async (color: string) => {
        try {
            // Validar se o ID do tenant está presente
            if (!tenant?.id) {
                throw new Error("ID do tenant não foi definido.");
            }

            // Criar o FormData com os dados necessários
            const form = new FormData();
            form.append("id", tenant.id.toString());

            // Adicionar o novo nome ao FormData
            const main_color = color
            if (main_color) {
                form.append("second_color", main_color);
            }

            // Fazer a chamada da API para atualizar o layout do tenant
            const response = await api.updateLayoutTenant(token as string, form);

            // Exibir uma mensagem de sucesso
            console.log("Cor Principal do tenant atualizado com sucesso:", response);
            getTenant();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "Erro ao atualizar nome do tenant:",
                    error.response?.data || error.message
                );
            } else {
                console.error("Erro inesperado:", error);
            }
            throw error;
        }
    };

    const handleEditSecondColor = async (color: string) => {
        try {
            // Validar se o ID do tenant está presente
            if (!tenant?.id) {
                throw new Error("ID do tenant não foi definido.");
            }

            // Criar o FormData com os dados necessários
            const form = new FormData();
            form.append("id", tenant.id.toString());

            // Adicionar o novo nome ao FormData
            const main_color = color
            if (main_color) {
                form.append("main_color", main_color);
            }

            // Fazer a chamada da API para atualizar o layout do tenant
            const response = await api.updateLayoutTenant(token as string, form);

            // Exibir uma mensagem de sucesso
            console.log("Cor Secundaria do tenant atualizado com sucesso:", response);
            getTenant();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "Erro ao atualizar nome do tenant:",
                    error.response?.data || error.message
                );
            } else {
                console.error("Erro inesperado:", error);
            }
            throw error;
        }
    };

    const handleEditNome = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            // Validar se o ID do tenant está presente
            if (!tenant?.id) {
                throw new Error("ID do tenant não foi definido.");
            }

            // Criar o FormData com os dados necessários
            const form = new FormData();
            form.append("id", tenant.id.toString());

            // Adicionar o novo nome ao FormData
            const nome = event.target.value; // Assume que o campo de nome é o próprio input
            if (nome) {
                form.append("nome", nome);
            }

            // Fazer a chamada da API para atualizar o layout do tenant
            const response = await api.updateLayoutTenant(token as string, form);

            // Exibir uma mensagem de sucesso
            console.log("Nome do tenant atualizado com sucesso:", response);
            getTenant();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "Erro ao atualizar nome do tenant:",
                    error.response?.data || error.message
                );
            } else {
                console.error("Erro inesperado:", error);
            }
            throw error;
        }
    };

    const handleEditInfos = async (event: FormEvent<HTMLFormElement>) => {
        if (!tenant?.id) {
            throw new Error("ID do tenant não foi definido.");
        }
        let form = new FormData(event.currentTarget);
        form.append("id", tenant.id.toString());
        await api.updateLayoutInfo(token as string, form);

    }
    const handleEditZones = async (event: FormEvent<HTMLFormElement>) => {
        if (!tenant?.id) {
            throw new Error("ID do tenant não foi definido.");
        }
        let form = new FormData(event.currentTarget);
        form.append("id", tenant.id.toString());
        await api.updateLayoutZones(token as string, form);
    }
    const handleEditFunc = async (event: FormEvent<HTMLFormElement>) => {
        if (!tenant?.id) {
            throw new Error("ID do tenant não foi definido.");
        }

        // Extrai o FormData do evento personalizado
        const form = (event as any).formData as FormData;

        // Adiciona o ID do tenant
        form.append("id", tenant.id.toString());

        // Verifica os dados no console (teste)
        const data = Object.fromEntries(form.entries());
        console.log(data);

        // Envia os dados para a API
        await api.updateLayoutFunc(token as string, form);
    };
    const handleEditEndereco = async (event: FormEvent<HTMLFormElement>) => {
        if (!tenant?.id) {
            throw new Error("ID do tenant não foi definido.");
        }
        let form = new FormData(event.currentTarget);
        form.append("id", tenant.id.toString());
        await api.updateLayoutEndereco(token as string, form);

    }

    // Função para obter os dados do tenant
    const getTenant = async () => {
        try {
            const response: Tenant = await api.getTenant(token as string);
            setTenant(response); // Atualiza o estado com os dados do tenant
        } catch (error) {
            console.error("Erro ao buscar o tenant:", error);
        }
    };

    useEffect(() => {
        getTenant(); // Chama a função para buscar os dados do tenant
    }, []);

    return (
        <Box sx={{
            padding: { xs: 2, sm: 3, md: 4 }, // Padding responsivo
            maxWidth: '100%',
            overflow: 'hidden'
        }}>
            {/* Cabeçalho */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                mb: 3
            }}>
                <Typography
                    component="h5"
                    variant="h5"
                    sx={{
                        color: '#555',
                        fontSize: { xs: '1.5rem', sm: '1.8rem' }
                    }}
                >
                    Estabelecimento
                </Typography>
            </Box>

            <Divider sx={{ marginBottom: { xs: 2, sm: 3, md: 4 } }} />

            {/* Menu Carrossel */}
            <Box sx={{
                mt: { xs: 2, sm: 3, md: 4 },
                width: '100%'
            }}>
                <Tabs
                    value={abaAtiva}
                    onChange={handleAbaChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        mb: 2,
                        '.MuiTabs-scrollButtons': {
                            '&.Mui-disabled': {
                                opacity: 0.3,
                            },
                        },
                        '.MuiTab-root': {
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            minWidth: { xs: 'auto', sm: 120 },
                            px: { xs: 2, sm: 3 },
                        }
                    }}
                >
                    <Tab
                        label="Layout"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    />
                    <Tab
                        label="Informações"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    />
                    <Tab
                        label="Funcionamento"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    />
                    <Tab
                        label="Endereço"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    />
                </Tabs>

                <Divider />

                <Box sx={{
                    padding: { xs: 1, sm: 2 },
                    '.MuiPaper-root': {
                        borderRadius: 2,
                    },
                    '.MuiTextField-root': {
                        mb: 2
                    },
                    '.MuiFormControl-root': {
                        width: '100%',
                        maxWidth: { sm: '500px', md: '600px' }
                    }
                }}>
                    {abaAtiva === 0 && tenant && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}>
                            <EditLayout
                                data={tenant}
                                onEditImg={handleEditImg}
                                onEditNome={handleEditNome}
                                onEditMainColor={handleEditMainColor}
                                onEditSecondColor={handleEditSecondColor}
                            />
                        </Box>
                    )}
                    {abaAtiva === 1 && tenant && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}>
                            <EditInfos
                                data={tenant}
                                onEditInfos={handleEditInfos}
                                onEditZones={handleEditZones}
                            />
                        </Box>
                    )}
                    {abaAtiva === 2 && tenant && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}>
                            <EditFunc
                                data={tenant.tenantFuncionamento}
                                onEditFunc={handleEditFunc}
                            />
                        </Box>
                    )}
                    {abaAtiva === 3 && tenant && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}>
                            <EditEndereco
                                data={tenant.tenantInfo}
                                onEditAddresses={handleEditEndereco}
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default EditTenantPage;
