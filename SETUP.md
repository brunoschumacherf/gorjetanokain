# 🚀 Guia Rápido de Configuração

## 1. Instalar Dependências

```bash
npm install
```

## 2. Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative o **Firestore Database** (modo de produção ou teste)
4. Vá em **Configurações do Projeto** → **Seus apps** → **Web**
5. Copie as credenciais

## 3. Criar Arquivo .env

Na raiz do projeto, crie um arquivo `.env`:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id

VITE_ADMIN_PASSWORD=senha_admin_123
```

## 4. Configurar Firestore

### Criar Coleções

O sistema criará automaticamente as coleções quando você usar pela primeira vez:

- `sorteios` - Armazena os sorteios
- `participantes` - Armazena os participantes (CPF como ID)

### Regras de Segurança (Opcional - para produção)

No Firestore, vá em **Regras** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /participantes/{cpf} {
      allow read: if true;
      allow create: if true; // Em produção, adicione validação
      allow update, delete: if false;
    }
    
    match /sorteios/{sorteioId} {
      allow read: if true;
      allow write: if false; // Em produção, use autenticação
    }
  }
}
```

**⚠️ IMPORTANTE**: As regras acima são para desenvolvimento. Em produção, configure autenticação adequada.

## 5. Executar o Projeto

```bash
npm run dev
```

Acesse:
- **Página Pública**: http://localhost:5173
- **Painel Admin**: http://localhost:5173/admin

## 6. Primeiro Uso

1. Acesse `/admin` com a senha configurada
2. Clique em **"Criar Novo Sorteio"**
3. Clique em **"Abrir Sorteio"**
4. Agora os usuários podem se cadastrar na página pública
5. Quando tiver participantes, clique em **"Executar Sorteio"** (ou use a roleta animada)
6. O vencedor será exibido automaticamente

## 🎯 Dicas

- **CPF único**: O sistema usa CPF como ID do documento, garantindo unicidade
- **Reset automático**: Ao encerrar ou criar novo sorteio, todos os participantes são removidos
- **Apenas 1 sorteio ativo**: O sistema permite apenas um sorteio aberto por vez
- **Roleta animada**: Use a roleta no painel admin para um sorteio visual impactante

## 🐛 Problemas Comuns

### Erro: "Firebase not initialized"
- Verifique se o arquivo `.env` está na raiz do projeto
- Verifique se todas as variáveis estão preenchidas
- Reinicie o servidor de desenvolvimento

### Erro: "Permission denied"
- Verifique as regras do Firestore
- Em desenvolvimento, use regras permissivas temporariamente

### CPF duplicado ainda aparece
- O sistema usa CPF como ID, então duplicados são impossíveis
- Se aparecer erro, pode ser cache do navegador

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos estarão em `dist/`. Faça deploy no Firebase Hosting, Vercel, Netlify, etc.

---

**Pronto para usar!** 🎉
