<div align="center">

  <a href="https://betofoxnet-info.vercel.app/"><img src="https://github.com/user-attachments/assets/8e37b052-5c84-4c25-bcb3-56f36e875326" width="150px"/></a>

# BetoFoxNet

  <a href="https://nextjs.org/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" width="130px" alt="Icon NextJs" /></a>

## Sobre NextJS
### Autenticação!

</div>

---

# 🚀 TUTORIAL COMPLETO — SISTEMA DE LOGIN / AUTENTICAÇÃO

### Next.js 16+ (App Router) + Server Actions + Prisma + JWT + Cookies HttpOnly

---

## 📌 1. COMO O SISTEMA FUNCIONA (Visão Geral)

Seu sistema possui um fluxo profissional de autenticação:

1. Usuário acessa /login<br>
   - → Preenche formulário<br>
   - → loginUser() (Server Action) valida e cria sessão<br>
   - → Redireciona para /dashboard

2. Sessão é salva via Cookie HttpOnly + JWT seguro
 
   -  Assinado com AUTH_SECRET

   - Expira e é renovado automaticamente

3. Middleware inteligente (proxy.ts) controla acesso

   - Bloqueia páginas privadas para quem não está logado

   - Bloqueia páginas de admin para usuários comuns

   - Redireciona usuários logados que tentam acessar /login

   - Protege tudo, tanto no client quanto no server

4. Dashboard tem rotas protegidas

   - /dashboard

   - /dashboard/admins

   - /dashboard/users

   - etc.

5. Página de /register (registro inicial do admin)

   - Só aparece se não existe nenhum admin

   - Caso exista, redireciona para o dashboard

   - Serve para criar o primeiro administrador do sistema

---

### ⚙️ 2. CONFIGURAÇÃO DO PROJETO

Clone o projeto:

```bash

git clone https://github.com/HumbertoFox/nextjs-start-kits
cd nextjs-start-kits

```

Instale dependências:

```bash

npm install

```

```ini

DATABASE_URL="sua URL do banco"
AUTH_SECRET="uma chave grande e segura"
NEXT_URL="http://localhost:3000"

```

Rode migrations:

```bash

npx prisma migrate dev

```

```bash

npm run dev

```

### 🗂️ 3. ESTRUTURA DO SISTEMA DE LOGIN

A estrutura geral:

```bash

/app
  /login
    page.tsx
    login-client.tsx
  /register
    page.tsx
    form-register-admin.tsx
  /dashboard
    ...
/app/api/actions
  loginuser.ts
  createadmin.ts
/lib
  prisma.ts
  session.ts
  proxy.ts
  definitions.ts
  dal.ts

```

Vamos explicar cada parte com detalhes.

### 🧱 4. DATABASE (Prisma)

Modelo de usuário comum no seu projeto:

```prisma

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      String   // ADMIN | USER
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}

```

### 📐 5. VALIDAÇÕES (ZOD) – /lib/definitions.ts

Exemplo real do login:

```ts

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

```

Isso evita:

SQL injection

Campos vazios

Login sem email válido

etc.

### 🍪 6. SESSÃO / AUTENTICAÇÃO – /lib/session.ts

O sistema usa:

<p>✔ JWT</p>
<p>✔ Cookie HttpOnly</p>
<p>✔ Expiração automática</p>
<p>✔ Renovação transparente</p>
<p>✔ Validação no servidor</p>

Função chave: createSession():

```ts

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(secretKey);

  cookies().set("sessionAuth", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/"
  });
}

```

A função verifySession() é usada pelo proxy e server components.

### 🎛️ 7. PROXY / MIDDLEWARE DE PROTEÇÃO – /lib/proxy.ts

É um dos pilares do sistema.
Ele controla TODA a navegação.

Regras implementadas:

🔹 Páginas públicas:

 - /login

 - /register (somente se não existe admin)

 - assets estáticos

Usuário já logado → redireciona para `/dashboard`

🔹 Páginas privadas:

Qualquer página dentro de:

/dashboard/*

```bash

/dashboard/*

```

Sem sessão → redirecionado para /login

🔹 Páginas exclusivas de ADMIN:

Ex.:

```bash

/dashboard/admins

```

Se role !== "ADMIN" → redirecionado para /dashboard

### 📝 8. SERVER ACTIONS — backend da autenticação

🔹 LOGIN — `/app/api/actions/loginuser.ts`

```ts

'use server';

export async function loginUser(state, formData) {
  const validated = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success)
    return { errors: validated.error.flatten().fieldErrors };

  const { email, password } = validated.data;

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null }
  });

  if (!user)
    return { warning: "E-mail ou senha inválidos" };

  const validPass = await compare(password, user.password);
  if (!validPass)
    return { warning: "E-mail ou senha inválidos" };

  await createSession(user.id, user.role);

  return { message: "Login bem-sucedido!" };
}

```

🔹 REGISTRO ADMIN — /app/api/actions/createadmin.ts

Criado apenas quando não existe nenhum admin:

```ts

const existsAdmin = await prisma.user.findFirst({
  where: { role: "ADMIN", deletedAt: null }
});

```

Se existe → redireciona para dashboard

Se não existe:

 - valida campos

 - hasheia senha

 - cria admin no banco

 - cria sessão

 - redireciona

### 💻 9. FRONT-END — LOGIN PAGE

`/app/login/page.tsx`

```tsx

export default function Page() {
  return (
    <Suspense fallback={<LoadingLoginSimple />}>
      <LoginClient />
    </Suspense>
  );
}

```

`/app/login/login-client.tsx`

Características:

<p>✔ Componente Client</p>
<p>✔ Form controlado</p>
<p>✔ Exibe mensagens de erro do backend</p>
<p>✔ Chama loginUser() via useActionState</p>
<p>✔ Alterna visibilidade da senha</p>
<p>✔ Mostra loading</p>
<p>✔ Redireciona automaticamente ao sucesso</p>

Exemplo:

```tsx

const [state, action, pending] = useActionState(loginUser, initialState);

<form action={action}>
  <input name="email" />
  <input type={show ? "text" : "password"} name="password" />
  <button disabled={pending}>Entrar</button>
</form>

{state.warning && <p>{state.warning}</p>}

```

### 🧑‍💼 10. FRONT-END — REGISTRO DO ADMIN

`/app/register/page.tsx`

1. Faz checagem no servidor:

- existe admin? → redireciona

2. Exibe formulário de criação

`/app/register/form-register-admin.tsx`

- Campos: nome, email, senha, confirmação

- Validação Zod + erros exibidos

- Chama server action createAdmin()

- Após criar → login automático

### 🔒 11. PROTEGENDO O DASHBOARD

Qualquer página dentro de `/dashboard` funciona assim:

Nos Server Components:

```ts

const user = await getUser();
if (!user) redirect("/login");

```

Automático via proxy (maior proteção)

Exemplo de listagem:

```bash

/dashboard/admins/page.tsx

```

- Lista admins

- Permite ativar/desativar (deletedAt)

- Acessível só para admin

### 🚪 12. LOGOUT (opcional, mas recomendado)

Crie um server action:

```ts

'use server';

export async function logout() {
  cookies().delete("sessionAuth");
  redirect("/login");
}

```

Crie um botão:

```tsx

<form action={logout}>
  <button>Sair</button>
</form>


```

### 🎨 13. UI / LAYOUTS

O projeto já inclui múltiplos layouts prontos:

- Auth Simple

- Auth Card

- Auth Split

- Dashboard com Sidebar

- Dashboard com Header

Você escolhe o layout apenas aplicando layout.tsx dentro da pasta desejada.

### 🔥 14. FLUXO FINAL DA AUTENTICAÇÃO

1️⃣ Usuário abre /login

<p> → Render client</p>
<p> → Preenche formulario</p>
<p> → Server Action loginUser</p>
<p> → Valida Zod</p>
<p> → Busca no banco</p>
<p> → Compara hash (bcrypt-ts)</p>
<p> → Cria sessão</p>
<p> → Redireciona para dashboard</p>

2️⃣ Proxy protege todas as rotas

`/login` é inacessível para usuários logados

`/dashboard` é inacessível para visitantes

`/dashboard/admins` é inacessível para não-admins

3️⃣ Dashboard usa sessão server-side

→ Acesso garantido mesmo se JavaScript do cliente estiver desligado


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