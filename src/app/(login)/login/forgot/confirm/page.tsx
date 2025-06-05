'use client'

import { api } from "@/libs/api";
import { Box, Button, TextField, Typography, Link as MuiLink, Alert } from "@mui/material";
import Link from "next/link";
import { useState, FormEvent } from "react";

const Page = () => {
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordField, setPasswordFild] = useState('');
    const [passwordField2, setPasswordFild2] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!passwordField || !passwordField2) {
            setError('Insira a nova senha');
            return;
        }

        if (passwordField !== passwordField2) {
            setError('As senhas não batem')
            return;
        }

        setError('');
        setInfo('');
        setLoading(true);
        const result = await api.redefinePassword(passwordField, '123');
        setLoading(false);

        if (result.error) {
            setError(result.error)
        } else {
            setInfo('Senha redefinida, agora vovê pode fazer o login.')
            setPasswordFild('');
            setPasswordFild2('');
        }
    }

    return (
        <>
            <Typography component="p" sx={{ textAlign: 'center', mt: 2, color: '#555' }}>
                Olá **usuario**, defina sua nova senha abaixo.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                    label="Digite sua nova senha"
                    name="password"
                    type="password"
                    required
                    fullWidth
                    autoFocus
                    sx={{ mb: 2 }}
                    onChange={e => setPasswordFild(e.target.value)}
                    value={passwordField}
                    disabled={loading}
                />
                <TextField
                    label="Confirme sua nova senha"
                    name="password2"
                    type="password"
                    required
                    fullWidth
                    autoFocus
                    sx={{ mb: 2 }}
                    onChange={e => setPasswordFild2(e.target.value)}
                    value={passwordField2}
                    disabled={loading}
                />
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mb: 3 }}
                    disabled={loading}
                >{loading ? 'Carregando...' : 'Definir nova senha'}
                </Button>

                {error &&
                    <Alert variant="filled" severity="error">{error}</Alert>
                }
                {info &&
                    <Alert variant="filled" severity="success">{info}</Alert>
                }
            </Box>
        </>
    );
}

export default Page;