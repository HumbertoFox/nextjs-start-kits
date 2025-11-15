<div align="center">

  <a href="https://betofoxnet-info.vercel.app/"><img src="https://github.com/user-attachments/assets/8e37b052-5c84-4c25-bcb3-56f36e875326" width="150px"/></a>

# BetoFoxNet

  <a href="https://nextjs.org/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" width="130px" alt="Icon NextJs" /></a>

## Sobre NextJS
### Autenticação!

</div>

---

## 📘 Tutorial – Cadastro de Administradores (Next.js, Prisma, Upload com Vercel Blob)

Este projeto implementa um fluxo completo de <strong>cadastro de Administradores e Usuários</strong>, com verificação automática do primeiro administrador, upload de imagem com validação, autenticação e criação de sessão.
O sistema foi construído usando <strong>Next.js 16+ (App Router), Prisma, Zod, Vercel Blob, bcrypt-ts e React Server Actions</strong>.

### 🚀 Funcionalidades principais

<p>✔ Cadastro de Administrador/Usuário</p>
<p>✔ Upload de imagem com preview</p>
<p>✔ Validação de imagem (tipo, tamanho e dimensões)</p>
<p>✔ Processamento de imagem com Sharp</p>
<p>✔ Upload armazenado no Vercel Blob</p>
<p>✔ Hash de senha com bcrypt-ts</p>
<p>✔ Autenticação via Server Action + criação de sessão</p>
<p>✔ Escolha automática:</p>

- Se nenhum admin existe → cria ADMIN
- Se já existe → cria USER
<p>✔ Feedback de erros em tempo real</p>
<p>✔ Campos controlados e status loading</p>

### 🧱 Tecnologias Utilizadas

| Tecnologia                  |	Uso
|-----------------------------|------------------------------------|
| Next.js 16+ + App Router    |	UI + Server Actions                |
| React + useActionState	  | Estados do formulário              |
| Prisma ORM                  |	Banco de dados                     |
| PostgreSQL / MySQL / SQLite |	Banco (compatível com qualquer um) |
| Zod	                      | Validação do formulário            |
| bcrypt-ts                   |	Hash de senhas                     |
| Sharp                       |	Validação e leitura de imagens     |
| Vercel Blob                 |	Armazenamento de avatares          |
| TypeScript                  |	Tipagem                            |

### 📂 Estrutura resumida dos arquivos

```bash

/app
  /api/actions/createadmin.ts     ← Server Action (processamento)
  /register
      page.tsx                    ← Página que carrega o form
      form-register-admin.tsx     ← Formulário (client component)

 /lib
    prisma.ts                     ← Configuração Prisma
    session.ts                    ← Criação de sessão
    definitions.ts                ← Zod + Tipos

 /components
    ui/*                          ← Inputs, Label, Button...
    input-error.tsx               ← Componente de erro
    layouts/auth-layout.tsx       ← Layout da página

```

### 📦 Como rodar o projeto

1. Clone o repositório

```sh

git clone https://github.com/HumbertoFox/nextjs-start-kits.git
cd nextjs-start-kits

```

2. Instale as dependências

```sh

npm install

```

3. Configure variáveis de ambiente

Crie um arquivo .env:

```ini

DATABASE_URL="sua_url_do_prisma"
BLOB_READ_WRITE_TOKEN="token_do_vercel_blob"

```

4. Rode as migrações do Prisma

```sh

npx prisma migrate dev

```

5. Inicie o servidor

```sh

npm run dev

```

Pronto! O sistema estará rodando em:

👉 http://localhost:3000/register

### 🧑‍💻 Como funciona o cadastro

🔹 1. Preenchimento do formulário (Client Component)

O componente `form-register-admin.tsx` lida com:

- Campos controlados

- Preview da imagem

- Validação inicial da imagem com handleImageChange

- Exibição de erros

- Envio dos dados via Server Action

### 📷 Preview da imagem antes do envio

```tsx

const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { file, preview, error } = await handleImageChange(e);
    setImageFile(file);
    setImagePreview(preview);
    setImageError(error);
};

```

### 🧪 Envio do formulário

```tsx

const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    if (imageFile) formData.append('file', imageFile);

    startTransition(() => action(formData));
};

```

### 📸 🧩 Validação de Imagens – `/lib/handleimagechange.ts`

Este utilitário valida a imagem antes do upload, melhorando a experiência do usuário.

<p>✔ Valida tipo (JPEG, PNG, WebP)</p>

<p>✔ Valida tamanho (máx. 512 KB)</p>

<p>✔ Valida dimensões (máx. 512x512 px)</p>

<p>✔ Cria preview local</p>

<p>✔ Retorna erros formatados</p>

### 📁 Código completo:

```ts

export type HandleImageChangeResult = {
    file: File | null;
    preview: string | null;
    error: string | null;
};

export async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
): Promise<HandleImageChangeResult> {

    const file = e.target.files?.[0];
    if (!file) return { file: null, preview: null, error: null };

    // Tipos permitidos
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return {
            file: null,
            preview: null,
            error: 'Apenas imagens JPEG, PNG ou WebP são permitidas.',
        };
    }

    // Tamanho máximo (512 KB)
    if (file.size > 512 * 1024) {
        return {
            file: null,
            preview: null,
            error: 'A imagem não pode ultrapassar 512 KB.',
        };
    }

    // Verificar dimensões com createImageBitmap
    try {
        const imageBitmap = await createImageBitmap(file);
        const { width, height } = imageBitmap;

        if (width > 512 || height > 512) {
            return {
                file: null,
                preview: null,
                error: `A imagem não pode ter dimensões maiores que 512x512 pixels (atual: ${width}x${height}).`,
            };
        }
    } catch {
        return {
            file: null,
            preview: null,
            error: 'Falha ao ler as dimensões da imagem.',
        };
    }

    return {
        file,
        preview: URL.createObjectURL(file),
        error: null,
    };
}

```

### 🛠 2. Processamento do cadastro (Server Action)

Arquivo: `/app/api/actions/createadmin.ts`

A server action:

✔ Valida com Zod

```ts

const validatedFields = createAdminSchema.safeParse({...});

```

<p>✔ Revalida todos os campos com Zod</p>

<p>✔ Checa se o e-mail já existe</p>

<p>✔ Define role automaticamente (ADMIN ou USER)</p>

<p>✔ Valida imagem com Sharp</p>

<p>✔ Envia avatar para Vercel Blob</p>

<p>✔ Cria usuário no banco</p>

<p>✔ Cria sessão automaticamente</p>

### 🧾 3. Validações com Zod

createAdminSchema garante:

- Nome obrigatório

- Email válido

- Senha mínima de 8 caracteres

- Confirmação deve coincidir

```ts

.refine((data) => data.password === data.password_confirmation)

```

### 🎨 4. Determinação dinâmica do título da página

Arquivo: `/app/register/page.tsx`

```tsx

const isAdmin = await prisma.user.findFirst({
  where: { role: 'ADMIN' }
});

const Title = isAdmin ? 'Cadastrar Usuário' : 'Cadastrar Administrador';

```

### 🧩 Fluxo completo

1. Usuário acessa `/register`

2. App verifica se existe ADMIN

3. Formulário exibe título adequado

4. Usuário preenche dados

5. Imagem é validada no frontend

6. Dados enviados via Server Action

7. Backend valida tudo novamente

8. Upload no Vercel Blob

9. Usuário criado

10. Sessão iniciada

11. Redirecionamento para `/dashboard`

### ✅ Exemplo de mensagem final no fluxo

- Conta criada com sucesso

- Redirecionamento automático ao painel

---

### 🔐 Tutorial – Login de Usuários (Next.js, Prisma, Server Actions, Sessão)

Após o cadastro de Administradores e Usuários, o próximo passo é implementar o <strong>fluxo de Login</strong>, que permitirá autenticação segura e criação da sessão no servidor.

O Login foi construído com:

- Next.js 16+ (App Router)

- Server Actions

- Prisma

- Zod

- bcrypt-ts

- Session middleware

- Form com useActionState

- Feedback de erros em tempo real

### 🔑 1. Página de Login (`/app/login/page.tsx`)

A página usa:

- `<Suspense />` para aguardar carregamento

- Componente Client do login

- Metadata dinâmica

```tsx

import { Suspense } from 'react';
import LoginClient from './login-client';
import LoadingLoginSimple from '@/components/loadings/loading-login-simple';
import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: 'Conecte-se'
    };
};

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingLoginSimple />}>
            <LoginClient />
        </Suspense>
    );
}

```

### 🖥️ 2. Formulário de Login (`login-client.tsx`)

O formulário inclui:

<p>✔ Campos controlados</p>

<p>✔ Visibilidade da senha</p>

<p>✔ Redirecionamento automático para <strong>/dashboard</strong></p>

<p>✔ Foco automático em erros</p>

<p>✔ useActionState + startTransition</p>

<p>✔ Suporte a mensagens por query params (<strong>?status=...&email=...</strong>)</p>

```tsx

'use client';

import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/layouts/auth-layout';
import { Icon } from '@/components/ui/icon';
import { loginUser } from '@/app/api/actions/loginuser';
import { useRouter, useSearchParams } from 'next/navigation';

type LoginForm = {
    email: string;
    password: string;
};

export default function Login() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<string | boolean>(false);
    const canResetPassword = !status;
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [state, action, pending] = useActionState(loginUser, undefined);
    const [isVisibledPassword, setIsVisibledPassword] = useState<boolean>(false);
    const [data, setData] = useState<LoginForm>({ email: '', password: '' });

    const togglePasswordVisibility = () => setIsVisibledPassword(!isVisibledPassword);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData({ ...data, [id]: value });
    };
    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
    };

    useEffect(() => {
        const statusFromParams = searchParams.get('status');
        const emailFromParams = searchParams.get('email');

        if (emailFromParams) {
            setData((prevData) => ({ ...prevData, email: emailFromParams }));
            passwordRef?.current?.focus();
        };

        if (statusFromParams) {
            setStatus(statusFromParams);
            const timer = setTimeout(() => setStatus(true), 5000);
            return () => clearTimeout(timer);
        };
    }, [searchParams]);
    useEffect(() => {
        if (state?.message) {
            setData({ email: '', password: '' });
            router.push('/dashboard');
        };
        if (state?.warning && emailRef.current) {
            emailRef.current.focus();
        };
    }, [state]);

    return (
        <AuthLayout
            title="Entre na sua conta"
            description="Digite seu e-mail e senha abaixo para fazer login"
        >
            <form
                onSubmit={submit}
                className="flex flex-col gap-6"
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Endereço de email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            ref={emailRef}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="email@exemplo.com"
                        />
                        {state?.errors?.email?.[0] && <InputError message={state.errors.email[0]} />}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Senha</Label>
                            {canResetPassword && (
                                <TextLink href="/auth/forgot-password" className="ml-auto text-sm" tabIndex={5}>
                                    Esqueceu sua senha?
                                </TextLink>
                            )}
                        </div>

                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={isVisibledPassword ? "text" : "password"}
                                ref={passwordRef}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={handleChange}
                                placeholder="Senha"
                            />
                            <button
                                type="button"
                                title={isVisibledPassword ? "Ocultar senha" : "Mostrar senha"}
                                onClick={togglePasswordVisibility}
                                className="btn-icon-toggle"
                            >
                                {isVisibledPassword ? <Icon iconNode={Eye} /> : <Icon iconNode={EyeClosed} />}
                            </button>
                        </div>
                        {state?.errors?.password?.[0] && <InputError message={state.errors.password[0]} />}
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={3} disabled={pending}>
                        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Entrar
                    </Button>

                    <div className="text-muted-foreground text-center text-sm">
                        Não tem uma conta?&nbsp;&nbsp;
                        <TextLink href="/register" tabIndex={4}>
                            Cadastrar-se
                        </TextLink>
                    </div>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-blue-600">{status}</div>}
            {state?.message && <div className="mb-4 text-center text-sm font-medium text-blue-600">{state.message}</div>}
            {state?.warning && <div className="mb-4 text-center text-sm font-medium text-red-400">{state.warning}</div>}
        </AuthLayout>
    );
}

```

### 🔐 3. Server Action – Autenticação do Usuário (loginuser.ts)

Esta Server Action:

<p>✔ Valida e-mail e senha</p>

<p>✔ Busca usuário no banco</p>

<p>✔ Compara hash com <strong>bcrypt-ts</strong></p>

<p>✔ Cria sessão</p>

<p>✔ Retorna mensagens consistentes para UI</p>

```ts

'use server';

import prisma from '@/lib/prisma';
import { FormStateLoginUser, signInSchema } from '@/lib/definitions';
import { compare } from 'bcrypt-ts';
import { createSession } from '@/lib/session';
import z from 'zod';

export async function loginUser(state: FormStateLoginUser, formData: FormData): Promise<FormStateLoginUser> {
    const validatedFields = signInSchema.safeParse({
        email: (formData.get('email') as string)?.toLowerCase().trim(),
        password: formData.get('password') as string,
    });

    if (!validatedFields.success)
        return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email, password } = validatedFields.data;

    try {
        const user = await prisma.user.findFirst({
            where: {
                email,
                deletedAt: null
            }
        });

        if (!user) return { warning: 'E-mail ou senha inválidos' };

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) return { warning: 'E-mail ou senha inválidos' };

        await createSession(user.id, user.role);

        return { message: 'Autenticação bem-sucedida! Redirecionando para o Painel, aguarde...' };
    } catch (error) {
        console.error('Unknown error occurred:', error);
        return { warning: 'Algo deu errado. Tente novamente mais tarde.' };
    }
}

```

### 🔄 Fluxo Completo do Login

1. Usuário acessa `/login`

2. A página carrega o componente client

3. Usuário digita e-mail e senha

4. Formulário envia os dados via Server Action

5. Backend valida com Zod

6. Verifica o usuário no Prisma

7. Senha comparada com bcrypt-ts

8. Sessão criada

9. Retorno da mensagem

10. Redirecionamento automático para `/dashboard`

---

### Desenvolvido em:

---

<div>

  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg" width="30px"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="30px"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="30px"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" width="30px"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" width="30px"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" width="30px" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-line.svg" width="30px"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-plain.svg" width="30px"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="30px" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-plain.svg" width="30px"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg" width="30px"/>
  
</div>