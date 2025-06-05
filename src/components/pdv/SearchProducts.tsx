'use client';

import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { KeyboardEvent, useEffect, useRef } from 'react';

interface SearchProductsProps {
    value: string;
    onChange: (value: string) => void;
    onCodeEnter: (code: string) => void;
    onDelete?: () => void;
    onFinalize?: () => void;
    disabled?: boolean;
}

export const SearchProducts = ({
    value,
    onChange,
    onCodeEnter,
    onDelete,
    onFinalize,
    disabled = false
}: SearchProductsProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isTypingRef = useRef(false);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (disabled) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.key === 'Delete' && onDelete) {
                e.preventDefault();
                onDelete();
                return;
            }

            if (e.key === 'Enter' && !isTypingRef.current && onFinalize) {
                e.preventDefault();
                onFinalize();
                return;
            }

            if (isTypingRef.current || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
                return;
            }

            e.preventDefault();

            if (inputRef.current) {
                inputRef.current.focus();
                onChange(e.key);
            }
        };

        window.addEventListener('keydown', handleKeyPress as any);
        return () => window.removeEventListener('keydown', handleKeyPress as any);
    }, [onChange, onDelete, onFinalize, disabled]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        isTypingRef.current = true;
        if (e.key === 'Enter') {
            e.preventDefault();
            onCodeEnter(value);
            onChange('');
            inputRef.current?.blur();
            isTypingRef.current = false;
        }
        e.stopPropagation();
    };

    const handleBlur = () => {
        isTypingRef.current = false;
    };

    return (
        <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            placeholder="Buscar produtos..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={disabled}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search />
                    </InputAdornment>
                ),
            }}
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                opacity: disabled ? 0.7 : 1,
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                        borderColor: 'transparent',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                    },
                },
            }}
        />
    );
}; 