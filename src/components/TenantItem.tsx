import { useTenant } from "@/contexts/tenantContext/TenantContext";
import { Tenant } from "@/types/Tenant";
import { Store } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation"; // Use o hook de roteamento
import { useEffect } from "react";

type Props = {
    item: Tenant;
};

export const TenantItem = ({ item }: Props) => {
    const router = useRouter();
    const { setTenantSlug, setOnClose, setImg, setNome } = useTenant();

    const handleSelect = () => {
        setTenantSlug(item.slug)
        setOnClose(item.OnClose)
        setImg(item.img)
        setNome(item.nome)
        router.push("/pedidos"); // Redireciona para a página de pedidos
    };;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #EEE",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0px 8px 40px rgba(0, 0, 0, 0.15)",
                mb: 2,
                backgroundColor: "#FFF", // Cor de fundo fixa
            }}
        >
            {/* Foto do Tenant */}
            <Box
                component="img"
                src={item.img}
                alt={item.nome}
                sx={{
                    width: 100,
                    objectFit: "cover",
                    borderRadius: "4px 0 0 4px",
                    marginRight: 2,
                }}
            />

            {/* Detalhes do Tenant */}
            <Box sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="h6" component="p" sx={{ fontWeight: "bold", color: "#333" }}>
                    {item.nome}
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1, // Espaçamento entre os elementos
                    }}
                >
                    <Store
                        sx={{
                            color: '#FFF',
                            fontSize: '1.5rem',
                            backgroundColor: item.OnClose ? "#2E7D32" : "#B71C1C",
                            borderRadius: '50%',
                            padding: '5px'
                        }}
                    />
                    <Typography
                        component="p"
                        sx={{
                            fontWeight: "bold",
                            color: item.OnClose ? "#2E7D32" : "#B71C1C", // Verde escuro para "Aberto", vermelho escuro para "Fechado"
                        }}
                    >
                        {item.OnClose ? "Aberto" : "Fechado"}
                    </Typography>
                </Box>
            </Box>

            {/* Botão Selecionar */}
            <Box sx={{ p: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSelect}>
                    Selecionar
                </Button>
            </Box>
        </Box>
    );
};
