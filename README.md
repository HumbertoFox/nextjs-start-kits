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
| React + useActionState	    | Estados do formulário              |
| Prisma ORM                  |	Banco de dados                     |
| PostgreSQL / MySQL / SQLite |	Banco (compatível com qualquer um) |
| Zod	                        | Validação do formulário            |
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

git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO

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

### 📸 🧩 Validação de Imagens – /lib/handleimagechange.ts

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

Arquivo: /app/api/actions/createadmin.ts

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