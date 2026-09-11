# Checkout — Plano ENEM 70 Dias

Projeto do checkout do Plano ENEM 70 Dias, desenvolvido com React, TypeScript, Tailwind CSS e componentes reutilizáveis.

## O que já está funcionando

- Layout responsivo em preto e roxo;
- Formulário de identificação;
- Seleção entre PIX, cartão e boleto;
- Campos específicos do cartão;
- Oferta adicional do Kit Redação ENEM 900+;
- Atualização automática do total;
- Animações e microinterações;
- Respeito à configuração de redução de movimento do dispositivo.

> Este projeto ainda é um protótipo visual. Os botões não realizam cobranças reais.

## Requisitos

- Node.js 22.13 ou superior;
- VS Code;
- Conexão com a internet para instalar as dependências na primeira execução.

## Como abrir no VS Code

1. Extraia o arquivo ZIP.
2. Abra a pasta `Plano-ENEM-70-Dias-Checkout` no VS Code.
3. No menu do VS Code, escolha **Terminal → Novo Terminal**.
4. Instale as dependências:

```bash
npm install
```

5. Inicie o projeto:

```bash
npm run dev
```

6. Abra no navegador o endereço exibido pelo terminal, normalmente:

```text
http://localhost:5173
```

Para encerrar o projeto, volte ao terminal e pressione `Ctrl + C`.

## Principais arquivos

- `app/page.tsx`: conteúdo, formas de pagamento, oferta adicional e interações;
- `app/globals.css`: cores, tema e animações;
- `app/layout.tsx`: título e informações da página;
- `public/favicon.svg`: ícone exibido na aba do navegador.

## Comandos úteis

```bash
npm run dev
npm run build
```

- `npm run dev`: inicia o projeto para desenvolvimento;
- `npm run build`: verifica se o projeto está pronto para produção.

## Próxima etapa

Conectar o checkout a um gateway de pagamento e criar o fluxo de confirmação e entrega do produto digital.
