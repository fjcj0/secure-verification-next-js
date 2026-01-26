"use client";
import { createContext, ReactNode, useContext, useEffect } from "react";
import axios from 'axios';
axios.defaults.withCredentials = true;
const MainContext = createContext<undefined>(undefined);
export function MainProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        (async () => {
            try {
                await axios.get('http://localhost:4320/api/csrf-token');
            } catch (error) {
                console.log("CSRF token fetch failed: ",error);
            }
        })();
    }, []);
    return (
        <MainContext.Provider value={undefined}>
            {children}
        </MainContext.Provider>
    );
}
export const useMainContext = () => useContext(MainContext);