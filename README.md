# 🎰 Sistema de Sorteio de Gorjetas

Sistema completo de sorteio de gorjetas desenvolvido com **React + TypeScript + Firebase**, ideal para uso em lives e streams.

## ✨ Funcionalidades

### 🔓 Área Pública
- Formulário de cadastro com validação completa
- **Validação de CPF** (formato e dígitos verificadores)
- **Proteção contra CPF duplicado** (validação frontend + backend)
- Feedback visual em tempo real
- Contador de participantes
- Interface moderna e responsiva

### 🔒 Área Administrativa
- Login protegido por senha
- Painel completo de controle
- **Roleta animada** estilo Crazy Time
- Lista de participantes
- Controles de sorteio:
  - Criar novo sorteio
  - Abrir sorteio para cadastros
  - Executar sorteio
  - Encerrar sorteio
  - Resetar e criar novo
- Exibição do vencedor

## 🛡️ Proteção de CPF Único

O sistema implementa proteção em múltiplas camadas:

1. **Frontend**: Validação antes de enviar
2. **Backend**: Verificação no Firestore antes de salvar
3. **Estrutura**: CPF usado como ID do documento (garantia de unicidade)

## 🚀 Como Usar

### 1. Instalação

```bash
npm install
```

### 2. Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o **Firestore Database**
3. Copie as credenciais do projeto
4. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id

VITE_ADMIN_PASSWORD=senha_admin_aqui
```

### 3. Configuração do Firestore

Crie as seguintes coleções no Firestore:

- `sorteios` - Armazena os sorteios
- `participantes` - Armazena os participantes (CPF como ID do documento)

**Regras de Segurança Recomendadas:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Participantes - leitura pública, escrita apenas quando sorteio aberto
    match /participantes/{cpf} {
      allow read: if true;
      allow create: if request.auth != null || 
                       (exists(/databases/$(database)/documents/sorteios/$(getSorteioAtivoId())) &&
                        get(/databases/$(database)/documents/sorteios/$(getSorteioAtivoId())).data.status == 'aberto');
      allow update, delete: if request.auth != null;
    }
    
    // Sorteios - leitura pública, escrita apenas para admin
    match /sorteios/{sorteioId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Executar o Projeto

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

### 5. Acessar Área Administrativa

Acesse `http://localhost:5173/admin` e use a senha configurada no `.env`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── FormularioCadastro.tsx
│   ├── PainelAdmin.tsx
│   └── RoletaAnimada.tsx
├── config/             # Configurações
│   └── firebase.ts
├── contexts/           # Context API
│   └── SorteioContext.tsx
├── pages/             # Páginas
│   ├── Publica.tsx
│   └── Admin.tsx
├── services/          # Serviços Firebase
│   ├── participanteService.ts
│   └── sorteioService.ts
├── types/             # Tipos TypeScript
│   └── index.ts
└── utils/             # Utilitários
    └── cpfValidator.ts
```

## 🎨 Design

- **Tema**: Azul e branco
- **Interface**: Moderna, limpa e responsiva
- **Animações**: Roleta estilo Crazy Time com efeitos visuais
- **UX**: Otimizado para uso em live/stream

## 🔄 Fluxo de Uso

1. **Admin cria sorteio** → Status: Fechado
2. **Admin abre sorteio** → Status: Aberto (permite cadastros)
3. **Usuários se cadastram** → Validação de CPF único
4. **Admin executa sorteio** → Status: Sorteado (exibe vencedor)
5. **Admin encerra/reseta** → Remove participantes e cria novo

## 🛠️ Tecnologias

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Firebase Firestore** - Banco de dados
- **React Router** - Navegação
- **Vite** - Build tool

## 📝 Notas Importantes

- ⚠️ O sistema usa **CPF como ID do documento** para garantir unicidade
- ⚠️ Ao encerrar ou resetar sorteio, **todos os participantes são removidos**
- ⚠️ Apenas **1 sorteio ativo** por vez
- ⚠️ Em produção, considere usar **Firebase Auth** ao invés de senha simples

## 🚀 Deploy

Para fazer deploy:

```bash
npm run build
```

Os arquivos estarão em `dist/`. Você pode fazer deploy no:
- Firebase Hosting
- Vercel
- Netlify
- Qualquer serviço de hospedagem estática

## 📄 Licença

Este projeto foi desenvolvido para uso em sistemas de sorteio de gorjetas.

---

Desenvolvido com ❤️ para lives e streams
# gorjetankain
