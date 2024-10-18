import React, { useState, useContext, useEffect } from 'react';
// import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Spotlight } from '@/components/ui/Spotlight';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import { baseURL } from '@/api/axiosClient';
import Loader from '@/reuablecomponents/Loader';


const Login: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { login } = useContext(AuthContext)!;

    const validatePhone = (phone: any) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone);
    };

    useEffect(() => {
        setIsValid(validatePhone(phone) && password.length > 0);
    }, [phone, password]);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            const response = await fetch(`${baseURL}auth/login`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${phone}:${password}`),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone, password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                setError(data?.msg || 'Login failed. Please try again.');
                return;
            }

            const data = await response.json();

            console.log(data.msg);
            login(phone, password);
            console.log('Login successful');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="h-screen w-full flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20"
                    fill="white"
                />
                {error && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 w-full max-w-md">
                        <Alert variant="destructive">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}
                <div className='h-screen w-full	flex justify-center items-center'>
                    <div>
                        <Card>
                            <CardHeader>
                            </CardHeader>
                            <CardContent className='flex flex-col gap-3'>
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Input type="number" id="phonenumber" placeholder="Phone No" value={phone}
                                        onChange={(e) => setPhone(e.target.value)} autoComplete="new-password" />
                                </div>
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Input type="password" id="password" placeholder="Password" value={password}
                                        onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                                </div>
                                <Button onClick={handleLogin} disabled={!isValid}>Login</Button>
                            </CardContent>
                            <CardFooter className='flex justify-center'>
                                <p className='text-x '>Don't have an account? <Link to='/signup' className="text-blue-400">Sign up</Link></p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
                <Loader isLoadingOpen={isLoading} />
            </div>
        </>
    );
};

export default Login;
