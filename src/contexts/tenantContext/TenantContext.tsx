import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setCookie, getCookie } from 'cookies-next';

// Definindo o tipo do contexto explicitamente
interface TenantContextType {
    tenantSlug: string | null;
    nome: string | null;
    img: string | null;
    onClose: boolean | null;
    setTenantSlug: React.Dispatch<React.SetStateAction<string | null>>;
    setImg: React.Dispatch<React.SetStateAction<string | null>>;
    setNome: React.Dispatch<React.SetStateAction<string | null>>;
    setOnClose: React.Dispatch<React.SetStateAction<boolean | null>>;
}

// Criando o contexto com o tipo explicitamente
const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
    children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
    const [tenantSlug, setTenantSlug] = useState<string | null>(null);
    const [img, setImg] = useState<string | null>(null);
    const [nome, setNome] = useState<string | null>(null);
    const [onClose, setOnClose] = useState<boolean | null>(null);

    // Carrega o valor de tenantSlug e onClose dos cookies ao montar o componente
    useEffect(() => {
        const storedTenantSlug = getCookie('tenantSlug');
        const storedOnClose = getCookie('onClose');
        const storedImg = getCookie('img');
        const storedNome = getCookie('nome');

        if (storedTenantSlug) {
            setTenantSlug(storedTenantSlug as string);  // Garantir que é do tipo string
        }
        if (storedImg) {
            setImg(storedImg as string);  // Garantir que é do tipo string
        }
        if (storedNome) {
            setNome(storedNome as string);  // Garantir que é do tipo string
        }
        if (storedOnClose !== undefined) {
            setOnClose(storedOnClose === 'true');  // Converte para booleano
        }
    }, []);

    // Salva os valores de tenantSlug e onClose nos cookies sempre que eles mudarem
    useEffect(() => {
        if (tenantSlug !== null) {
            setCookie('tenantSlug', tenantSlug, { path: '/' });
        }
        if (img !== null) {
            setCookie('img', img, { path: '/' });
        }
        if (nome !== null) {
            setCookie('nome', nome, { path: '/' });
        }
        if (onClose !== null) {
            setCookie('onClose', String(onClose), { path: '/' }); // Converte para string
        }
    }, [tenantSlug, onClose, img]);

    return (
        <TenantContext.Provider value={{ tenantSlug, img, onClose, nome, setNome, setTenantSlug, setOnClose, setImg }}>
            {children}
        </TenantContext.Provider>
    );
};

// Garantindo o tipo correto no retorno de 'useTenant'
export const useTenant = (): TenantContextType => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};
