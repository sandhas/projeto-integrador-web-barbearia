# BarberControl – Gestão Financeira para Barbearias

Web App SPA para barbearias controlarem suas receitas e despesas, construído com **Next.js 14**, **Prisma** e **SQLite**.

## ✨ Funcionalidades

- **Dashboard** – Visão geral do mês com KPIs (receitas, despesas, saldo, número de transações) e gráficos dos últimos 6 meses
- **Transações** – CRUD completo de receitas e despesas com busca, filtros por tipo/categoria/período
- **Relatórios** – Análise mensal com gráficos de barras e pizza, resumo por mês e breakdown por categoria
- **Categorias** – Gerencie categorias de receita e despesa com cores personalizadas

## 🛠 Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Banco de dados | [Prisma](https://www.prisma.io/) + SQLite (local) |
| UI | [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) |
| Gráficos | [Recharts](https://recharts.org/) |
| Lógica | Server Actions (sem API separada) |
| Deploy | [Vercel](https://vercel.com/) |

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/sandhas/projeto-integrador-web-barbearia.git
cd projeto-integrador-web-barbearia

# Instale as dependências (gera o Prisma Client automaticamente)
npm install

# Crie e aplique as migrações do banco de dados
npm run db:migrate

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## 📁 Estrutura do Projeto

```
├── app/                    # Rotas Next.js (App Router)
│   ├── page.tsx            # Dashboard
│   ├── transacoes/         # Gerenciamento de transações
│   ├── relatorios/         # Relatórios e análises
│   └── categorias/         # Gerenciamento de categorias
├── components/             # Componentes reutilizáveis
│   ├── Sidebar.tsx
│   ├── TransactionModal.tsx
│   ├── DeleteConfirmModal.tsx
│   ├── TransactionsClient.tsx
│   ├── CategoriesClient.tsx
│   ├── RelatoriosClient.tsx
│   └── charts/             # Gráficos (Recharts)
├── lib/
│   ├── prisma.ts           # Singleton do Prisma Client
│   ├── actions.ts          # Server Actions (toda a lógica de negócio)
│   └── seed.ts             # Seed de categorias padrão
└── prisma/
    ├── schema.prisma       # Schema do banco de dados
    └── migrations/         # Histórico de migrações
```

## 🗄 Schema do Banco de Dados

```prisma
model Transaction {
  id          Int      @id @default(autoincrement())
  description String
  amount      Float
  type        String   // "EXPENSE" | "REVENUE"
  category    String
  date        DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  type      String   // "EXPENSE" | "REVENUE"
  color     String   @default("#6366f1")
  createdAt DateTime @default(now())
}
```

## 📸 Screenshots

| Dashboard | Transações |
|-----------|------------|
| ![Dashboard](https://github.com/user-attachments/assets/51c4e8cd-5412-4284-a1bd-c77903d8ddfa) | ![Transações](https://github.com/user-attachments/assets/c710180b-023f-4309-99b6-8b505a336107) |

| Nova Transação | Relatórios |
|----------------|------------|
| ![Modal](https://github.com/user-attachments/assets/80c204db-0ba6-46bf-aaae-daf4837ff84e) | ![Relatórios](https://github.com/user-attachments/assets/e3c04d53-d391-4116-9417-c3fdab718fae) |

## 📜 Licença

MIT
