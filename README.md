# Documentação da API
## Descrição

Esta é uma API de autenticação que fornece pontos de extremidade para registrar e autenticar usuários. Também permite que os usuários autorizados obtenham informações sobre um usuário específico.

## Instalação

1. Instale as dependências:

```bash
npm install express mongoose bcrypt jwt dotenv
```

## Uso

Inicie o servidor com:

```bash
node index.js
```

O servidor iniciará na porta 3000.

## Endpoints

### Público

- **GET** `/`
  - Descrição: Rota de boas-vindas.
  - Resposta de sucesso: 
    - **Status**: 200 
    - **Body**: 
    ```json
    { "msg": "Bem vindo a API!" }
    ```

### Privado

- **GET** `/user/:id`
  - Descrição: Recupera informações do usuário por ID, exceto senha.
  - Headers necessários: 
    - Authorization: Bearer {token}
  - Respostas:
    - **Usuário não encontrado**:
      - **Status**: 404
      - **Body**: `{ "msg": "Usuário não encontrado!" }`
    - **Sucesso**:
      - **Status**: 200
      - **Body**: `{ "user": { ... } }`

### Autenticação

- **POST** `/auth/register`
  - Descrição: Registra um novo usuário.
  - Body requerido:
    - name (String)
    - email (String)
    - password (String)
    - confirmpassword (String)
  - Respostas:
    - **Validação**:
      - **Status**: 422
      - **Body**: `{ "msg": "mensagem de erro" }`
    - **Sucesso**:
      - **Status**: 201
      - **Body**: `{ "msg": "Usuário criado com sucesso!" }`

- **POST** `/auth/login`
  - Descrição: Autentica um usuário e fornece um token JWT.
  - Body requerido:
    - email (String)
    - password (String)
  - Respostas:
    - **Validação / Erro**:
      - **Status**: 422/404/500
      - **Body**: `{ "msg": "mensagem de erro" }`
    - **Sucesso**:
      - **Status**: 200
      - **Body**: 
      ```json
      { 
        "msg": "Autenticação realizada com sucesso!", 
        "token": "token_jwt_aqui" 
      }
      ```

## Middlewares

- `checkToken`: Este middleware verifica a presença e validade do token JWT fornecido nas rotas protegidas.

## Conexão com o Banco de Dados

A API se conecta ao MongoDB através do Mongoose. As credenciais são armazenadas em variáveis de ambiente (`DB_USER` e `DB_PASS`).

---

Esta documentação fornece uma visão geral básica da API. Pode ser expandida e melhorada para incluir detalhes adicionais, como exemplos específicos de solicitação e resposta, informações sobre limites de taxa, etc.