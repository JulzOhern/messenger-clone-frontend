import React, { useMemo } from 'react'
import { useUserContext } from './userProvider'
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectRoutesProps {
    children: React.ReactNode
}

export function ProtectRoutes({ children }: ProtectRoutesProps) {
    const { user, isLoading } = useUserContext();
    const pathname = useLocation().pathname;

    const authPath = useMemo(() => ['/auth/login', '/auth/register'], []);

    if (isLoading) {
        return null;
    }

    if (user && authPath.includes(pathname)) {
        return <Navigate to="/" replace />
    }

    if (!user && !authPath.includes(pathname)) {
        return <Navigate to="/auth/login" replace />
    }

    return (
        <>{children}</>
    )
}
