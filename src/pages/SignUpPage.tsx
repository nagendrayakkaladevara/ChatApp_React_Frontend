import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
// import { Input } from "@/components/ui/inputAUI";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spotlight } from "@/components/ui/Spotlight";
import { baseURL } from "@/api/axiosClient";
import { Label } from "@/components/ui/labelAUI";
import { Input } from "@/components/ui/inputAUI";
import Loader from "@/reuablecomponents/Loader";

const SignUpPage: React.FC = () => {
    const [name, setName] = useState('');
    const [firstname, setfirstName] = useState('');
    const [secondname, setSecondName] = useState('');
    const [lastname, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState<any>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);


    const navigate = useNavigate();

    const validateForm = () => {
        if (!firstname.match(/^[a-zA-Z\s]+$/) || firstname.length > 15) {
            return "Fist Name must contain only letters and spaces, and be less than 15 characters";
        }
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || email.length > 50) {
            return "Email must be a valid format and less than 50 characters.";
        }
        if (!lastname.match(/^[a-zA-Z\s]+$/) || lastname.length > 15) {
            return "Last Name must contain only letters and spaces, and be less than 15 characters";
        }
        if (!phone.match(/^\d{10}$/)) {
            return "Phone number must be 10 digits";
        }
        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z]).{6,10}$/)) {
            return "Password must contain at least one uppercase, one lowercase letter, and be between 6 and 10 characters long";
        }
        if (password !== confirmPassword) {
            return "Passwords do not match";
        }
        if (!dateOfBirth) {
            return "Date of Birth is required";
        }
        return null;
    };

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            // setTimeout(() => {
            // setError(null);
                
            // }, 3000);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${baseURL}auth/register`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${phone}:${password}`),  // Basic Auth with phone and password
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstname,
                    secondName: secondname,
                    lastName: lastname,
                    email,
                    phone,
                    password,
                    dateOfBirth: format(dateOfBirth!, "yyyy-MM-dd") // Format the date to YYYY-MM-DD
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.msg || 'Registration failed');
            }

            const data = await response.json();
            console.log("🚀 ~ handleSignUp ~ (data.msg):", (data.msg))
            setIsSuccessDialogOpen(true);
            // navigate('/login');
        } catch (err: any) {
            setError(err.message || 'Server error');
        } finally {
            setIsSubmitting(false);
        }

    };

    // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     console.log("Form submitted");
    // };

    // const isFormValid = name && phone && password && confirmPassword && dateOfBirth && !validateForm();

    return (
        <>

            <div className="min-h-screen w-full flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20"
                    fill="white"
                />
                {error && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 w-full max-w-md ">
                        <Alert variant="destructive">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}

                <div style={{ display: "none" }}>
                    <Card>
                        <CardHeader>
                            <h2 className="text-center text-lg font-semibold">Sign Up</h2>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-3'>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input
                                    type="text"
                                    id="name"
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input
                                    type="number"
                                    id="phonenumber"
                                    placeholder="Phone No"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5 relative">
                                <Input
                                    type={!showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeClosedIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeOpenIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input
                                    type="password"
                                    id="confirm-password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal"
                                            )}
                                        >
                                            {dateOfBirth ? (
                                                format(dateOfBirth, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateOfBirth}  // Fix: Use undefined instead of null
                                            onSelect={(date) => setDateOfBirth(date ?? undefined)}  // Fix: Handle undefined
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button
                                // onClick={handleSignUp}
                                // disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                            </Button>
                        </CardContent>
                        <CardFooter className='flex justify-center'>
                            <p className='text-2xl'>Have an account? <Link to='/login' className="text-blue-400">Log in</Link></p>
                        </CardFooter>
                    </Card>
                </div>

                <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black my-7">
                    <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                        Welcome to PreviewMessenger
                    </h2>
                    {/* <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                        Login to aceternity if you can because we don&apos;t have a login flow
                        yet
                    </p> */}

                    <form className="my-8" onSubmit={handleSignUp}>
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                            <LabelInputContainer>
                                <Label htmlFor="firstname">First name</Label>
                                <Input
                                    id="firstname"
                                    placeholder="XXXX"
                                    type="text"
                                    value={firstname}
                                    onChange={(e) => setfirstName(e.target.value)} />
                            </LabelInputContainer>
                            <LabelInputContainer>
                                <Label htmlFor="lastname">Second name</Label>
                                <Input
                                    id="secondname"
                                    placeholder="XXXX"
                                    type="text"
                                    value={secondname}
                                    onChange={(e) => setSecondName(e.target.value)} />
                            </LabelInputContainer>
                        </div>
                        <LabelInputContainer className="mb-4">
                            <Label htmlFor="email">Last name</Label>
                            <Input
                                id="lastname"
                                placeholder="XXXX"
                                type="text"
                                value={lastname}
                                onChange={(e) => setLastName(e.target.value)} />
                        </LabelInputContainer>
                        <LabelInputContainer className="mb-4">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                placeholder="XXXXX@gmail.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} />
                        </LabelInputContainer>
                        <LabelInputContainer className="mb-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                placeholder="••••••••"
                                type={!showPassword ? "text" : "password"}
                                value={password}
                                autoComplete="new-password"
                                onChange={(e) => setPassword(e.target.value)} />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeClosedIcon className="h-5 w-5" />
                                ) : (
                                    <EyeOpenIcon className="h-5 w-5" />
                                )}
                            </button>
                        </LabelInputContainer>
                        <LabelInputContainer className="mb-4">
                            <Label htmlFor="password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                placeholder="••••••••"
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} />
                        </LabelInputContainer>
                        <LabelInputContainer className="mb-4">
                            <Label htmlFor="email">Phone No</Label>
                            <Input
                                id="phoneno"
                                placeholder="1234567890"
                                type="number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)} />
                        </LabelInputContainer>
                        <LabelInputContainer className="mb-4">
                            <Label htmlFor="email">Date of birth</Label>
                            <Input
                                id="dateofbirth"
                                placeholder=""
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)} />
                        </LabelInputContainer>


                        <button
                            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing Up...' : 'Sign Up'} &rarr;
                            <BottomGradient />
                        </button>

                        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

                        <p className='text-xl font-bold flex justify-center gap-3 text-black dark:text-white'>Have an account ? <Link to='/login' className="text-blue-400">Log in</Link></p>
                    </form>
                </div>

                <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle><p className="dark:text-white text-black">Account Created Successfully!</p></AlertDialogTitle>
                            <AlertDialogDescription>
                                <p className="dark:text-white text-black">You have successfully created your account. You can now log in.</p>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button onClick={() => navigate('/login')}>Go to Login</Button>
                            {/* <AlertDialogCancel onClick={() => setIsSuccessDialogOpen(false)}>Close</AlertDialogCancel> */}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Loader isLoadingOpen={isSubmitting} />
            </div>





            {/* </div> */}
        </>
    );
};

const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    );
};

export default SignUpPage;