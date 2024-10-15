import React, { createContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
    phone: string | null;
    login: (phone: string, password: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [phone, setPhone] = useState<string | null>(localStorage.getItem('phone'));
    const navigate = useNavigate();

    const login = (phone: string, password: string) => {
        localStorage.setItem('phone', phone);
        localStorage.setItem('password', password);
        setPhone(phone);
        navigate('/chat');
    };

    const logout = () => {
        localStorage.removeItem('phone');
        localStorage.removeItem('password');
        setPhone(null);
        navigate('/login');
    };

    useEffect(() => {
        if (!phone) navigate('');
    }, [phone]);

    return (
        <AuthContext.Provider value={{ phone, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
