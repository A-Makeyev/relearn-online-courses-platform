import { useContext } from 'react'
import { AuthContext } from '@/context/auth'
import { loginFormControls, registerFormControls } from '@/config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, GraduationCap, Layers, PlayCircle, Sparkles } from 'lucide-react'
import CommonForm from '@/components/common-form'


const AuthPage = () => {
    const {
        loginFormData,
        setLoginFormData,
        registerFormData,
        setRegisterFormData,
        handleRegister,
        handleLogin,
        activeTab,
        setActiveTab
    } = useContext(AuthContext)

    function isLoginValid() {
        return (
            loginFormData
            && loginFormData.email !== ''
            && loginFormData.password !== ''
        )
    }

    function isRegisterValid() {
        return (
            registerFormData
            && registerFormData.email !== ''
            && registerFormData.username !== ''
            && registerFormData.password !== ''
        )
    }

    const benefits = [
        { icon: Layers, title: 'Structured paths', copy: 'Clear, lecture-by-lecture curriculums that build real skills.' },
        { icon: PlayCircle, title: 'Learn by doing', copy: 'Practical lessons and projects you can add to your portfolio.' },
        { icon: CheckCircle2, title: 'Progress that sticks', copy: 'Automatic progress tracking so you always know where you left off.' }
    ]

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Brand panel */}
            <div className="relative hidden overflow-hidden bg-brand-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="absolute inset-0 bg-dot-grid opacity-20" />
                <div className="absolute -right-16 top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-fuchsia-300/10 blur-3xl" />

                <div className="relative">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                            <GraduationCap className="h-6 w-6" />
                        </span>
                        <div>
                            <p className="text-lg font-bold">Easy Programming</p>
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
                                Learn · Build · Grow
                            </p>
                        </div>
                    </div>

                    <h1 className="mt-16 max-w-lg text-balance text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
                        Skills that compound.
                        <br />
                        <span className="text-white/70">Lessons that stick.</span>
                    </h1>

                    <p className="mt-5 max-w-md text-base leading-7 text-white/70">
                        Join a learning platform built for people who want to build real things — not just watch
                        videos.
                    </p>

                    <div className="mt-10 space-y-5">
                        {benefits.map(benefit => (
                            <div key={benefit.title} className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                                    <benefit.icon className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">{benefit.title}</p>
                                    <p className="mt-0.5 text-sm leading-6 text-white/60">{benefit.copy}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative flex items-center gap-2 text-xs text-white/50">
                    <Sparkles className="h-3.5 w-3.5" />
                    Lifetime access on every course · Learn at your own pace
                </div>
            </div>

            {/* Form panel */}
            <div className="flex flex-col bg-background">
                <div className="flex items-center justify-between px-6 py-5 lg:px-10">
                    <div className="flex items-center gap-2.5 lg:hidden">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                        <span className="text-base font-bold">Easy Programming</span>
                    </div>
                    <p className="ml-auto text-xs text-muted-foreground">
                        New here? Use the <span className="font-semibold text-foreground">Sign Up</span> tab.
                    </p>
                </div>

                <div className="flex flex-1 items-center justify-center px-5 pb-14 sm:px-8">
                    <div className="w-full max-w-md">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
                            </h2>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                                {activeTab === 'login'
                                    ? 'Sign in to continue learning where you left off.'
                                    : 'Start learning in minutes. No credit card required to browse.'
                                }
                            </p>
                        </div>

                        <Tabs
                            value={activeTab}
                            defaultValue="login"
                            onValueChange={setActiveTab}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Sign In</TabsTrigger>
                                <TabsTrigger value="register">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <Card className="mt-4 shadow-soft">
                                    <CardContent className="p-6">
                                        <CommonForm
                                            buttonText="Sign in"
                                            formControls={loginFormControls}
                                            formData={loginFormData}
                                            setFormData={setLoginFormData}
                                            isButtonDisabled={!isLoginValid()}
                                            handleSubmit={handleLogin}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="register">
                                <Card className="mt-4 shadow-soft">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Student account</CardTitle>
                                        <CardDescription>
                                            Your progress, enrolled courses and reviews stay in one place.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-2">
                                        <CommonForm
                                            buttonText="Create account"
                                            formControls={registerFormControls}
                                            formData={registerFormData}
                                            setFormData={setRegisterFormData}
                                            isButtonDisabled={!isRegisterValid()}
                                            handleSubmit={handleRegister}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {import.meta.env.DEV && (
                            <div className="mt-5 rounded-lg border border-dashed bg-muted/40 p-4 text-xs text-muted-foreground">
                                <p className="font-semibold text-foreground">Demo accounts (seeded)</p>
                                <p className="mt-2">
                                    <span className="font-medium text-foreground">Instructor:</span> admin@email.com / admin
                                </p>
                                <p className="mt-1">
                                    <span className="font-medium text-foreground">Student:</span> oriello.jilo@jilo.oriello / 1
                                </p>
                            </div>
                        )}

                        <p className="mt-6 text-center text-xs text-muted-foreground">
                            By continuing you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPage
