'use client'

import { api } from "@/libs/api";
import { Box, Button, TextField, Typography, Link as MuiLink, Alert } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, use, useEffect } from "react";
import { useAuthContext } from '../../../contexts/auth';

const Page = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailField, setEmailFild] = useState('');
    const [passwordField, setPasswordFild] = useState('');
    const { user, setToken, setUser } = useAuthContext();

    const router = useRouter();



    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!emailField || !passwordField) {
            setError('Preencha email e senha.');
            return;
        }

        setError('');
        setLoading(true);
        const result = await api.login(emailField, passwordField);
        setLoading(false);

        if (result.error) {
            setError(result.error)
        } else if (result.token && result.user) {
            setToken(result.token);
            setUser(result.user);
            router.replace('/home')
        }
    }

    useEffect(() => {
        if (user) {
            console.log(user); // Mostra o usuário atualizado
        }
    }, [user, router]); // Dependências: user e router

    return (
        <>
            <Typography component="p" sx={{ textAlign: 'center', mt: 2, color: '#555' }}>
                Digite seus dados para entrar no painel administrativo do estabelecimento e gerenciar produtos/pedidos.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                    label="Digite seu e-mail"
                    name="email"
                    required
                    fullWidth
                    autoFocus
                    sx={{ mb: 2 }}
                    onChange={e => setEmailFild(e.target.value)}
                    value={emailField}
                    disabled={loading}
                />
                <TextField
                    label="Digite sua senha"
                    name="password"
                    type="password"
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                    onChange={e => setPasswordFild(e.target.value)}
                    value={passwordField}
                    disabled={loading}
                />
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mb: 3 }}
                    disabled={loading}
                >{loading ? 'Carregando...' : 'Entrar'}
                </Button>

                {error &&
                    <Alert variant="filled" severity="error">{error}</Alert>
                }

                <Box sx={{ mt: 3 }}>
                    <MuiLink href="/login/forgot" variant="body2" component={Link}>Esqueceu sua senha?</MuiLink>
                </Box>
            </Box>
        </>
    );
}

export default Page;

