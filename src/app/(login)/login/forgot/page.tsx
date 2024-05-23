'use client'

import { api } from "@/libs/api";
import { Box, Button, TextField, Typography, Link as MuiLink, Alert } from "@mui/material";
import Link from "next/link";
import { useState, FormEvent } from "react";

const Page = () => {
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailField, setEmailFild] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!emailField) {
            setError('Preencha o seu email ');
            return;
        }

        setError('');
        setInfo('');
        setLoading(true);
        const result = await api.forgotPassword(emailField);
        setLoading(false);

        if (result.error) {
            setError(result.error)
        } else {
            setInfo('Enviamos um e-mail para recperação de sua senha.')
        }
    }

    return (
        <>
            <Typography component="p" sx={{ textAlign: 'center', mt: 2, color: '#555' }}>
                Deseja recuperar sua senha?
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
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mb: 3 }}
                    disabled={loading}
                >{loading ? 'Carregando...' : 'Recuperar a senha'}
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