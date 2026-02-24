# 🔧 Ajustes Realizados para Estrutura Firestore Existente

## ✅ Alterações Implementadas

### 1. **Coleção de Participantes**
- ✅ Alterado de `participantes` para `paricipantes` (usando a coleção existente)
- ✅ Ajustado para usar campos existentes:
  - `chave_pix` (ao invés de `chavePix`)
  - `id` (ao invés de `idUsuario`)
- ✅ Suporte para ambos os formatos (antigo e novo) na leitura

### 2. **Validação de CPF**
- ✅ Agora busca por campo `cpf` ao invés de usar CPF como ID do documento
- ✅ Permite múltiplos documentos (ID automático do Firestore)
- ✅ Garante unicidade verificando o campo `cpf` antes de cadastrar

### 3. **Sistema de Login Admin**
- ✅ Integrado com coleção `admin_users` existente
- ✅ Busca usuário e senha no Firestore
- ✅ Fallback para senha do `.env` se não encontrar no Firestore
- ✅ Suporta login com:
  - Usuário: `nokain`
  - Senha: `nokaingay`

### 4. **Estrutura de Dados**

#### Participantes (`paricipantes`)
```javascript
{
  nome: string,
  cpf: string,        // CPF limpo (sem formatação)
  email: string,
  chave_pix: string, // Nome do campo ajustado
  id: string,        // ID do usuário (nome do campo ajustado)
  dataCadastro: Timestamp
}
```

#### Admin Users (`admin_users`)
```javascript
{
  user: string,      // Ex: "nokain"
  password: string   // Ex: "nokaingay"
}
```

#### Sorteios (`sorteios`)
- ✅ Criada automaticamente quando necessário
- Estrutura mantida como original

## 🎯 Como Usar

### Login Admin
1. Acesse `/admin`
2. Use:
   - **Usuário**: `nokain` (opcional, pode deixar vazio)
   - **Senha**: `nokaingay`
   - Ou use a senha configurada no `.env` (VITE_ADMIN_PASSWORD)

### Cadastro de Participantes
- O sistema agora salva com os campos:
  - `chave_pix` (não `chavePix`)
  - `id` (não `idUsuario`)
- CPF é validado para evitar duplicatas
- ID do documento é gerado automaticamente pelo Firestore

## 📝 Notas Importantes

1. **CPF Único**: A validação verifica duplicatas pelo campo `cpf`, não pelo ID do documento
2. **Compatibilidade**: O sistema lê ambos os formatos (antigo e novo) para facilitar migração
3. **Coleção `sorteios`**: Será criada automaticamente na primeira execução
4. **Dados Existentes**: Os dados já cadastrados em `paricipantes` serão lidos corretamente

## 🔄 Próximos Passos (Opcional)

Se quiser padronizar os nomes dos campos:
1. Renomear `paricipantes` para `participantes` (corrigir typo)
2. Atualizar campos `chave_pix` → `chavePix` e `id` → `idUsuario`
3. Ou manter como está (o sistema já suporta ambos)

---

**Sistema ajustado e pronto para usar com sua estrutura Firestore existente!** ✅
