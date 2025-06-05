"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Modal, Backdrop } from "@mui/material";
import { getCookie } from "cookies-next";
import { TenantItem } from "@/components/TenantItem";
import { api } from "@/libs/api";
import { Tenant } from "@/types/Tenant";
import { useRouter } from "next/navigation";

const Page = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Estado para indicar carregamento
    const token = getCookie("token") as string;
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            // Redirecionar para login apenas no cliente
            router.replace("/login");
            return;
        }

        const fetchTenants = async () => {
            try {
                const response = await api.getTenants(token);
                console.log(response)
                setTenants(response);
            } catch (error) {
                console.error("Erro ao buscar tenants:", error);
            } finally {
                setIsLoading(false); // Finaliza o carregamento
            }
        };

        fetchTenants();
    }, [token, router]);

    // Exibir um carregamento enquanto busca os tenants
    if (isLoading) {
        return null;
    }

    return (
        <Modal
            open={true} // Modal sempre aberto
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
                sx: { backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(5px)" },
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90%",
                    maxWidth: 600,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 3,
                    overflowY: "auto",
                    maxHeight: "80vh",
                }}
            >
                <Typography variant="h6" component="h2" gutterBottom>
                    Estabelecimentos
                </Typography>

                {/* Renderização dos tenants */}
                {tenants.length > 0 ? (
                    tenants.map((tenant) => <TenantItem key={tenant.id} item={tenant} />)
                ) : (
                    <Typography>Não há estabelecimentos cadastrados.</Typography>
                )}
            </Box>
        </Modal>
    );
};

export default Page;
