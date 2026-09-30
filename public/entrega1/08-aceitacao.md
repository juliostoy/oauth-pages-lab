# Termo de Aceitação — Laboratório OAuth em Cloudflare Pages

## Identificação

**Nome:** Julio Cesar dos Santos Ventura  
**RA:** 2026108358

## Checklist de aceitação

- [x] Site publicado em `pages.dev`.
- [x] Página estática e Functions utilizam a mesma origem.
- [x] Projeto integrado ao GitHub.
- [x] Implementação realizada sem Node, npm, npx ou Wrangler.
- [x] URLs de retorno dos provedores configuradas exatamente.
- [x] Requisições de autorização utilizam `code` e PKCE com `S256`.
- [x] A Function apresenta o Client Secret somente durante a troca do código por tokens.
- [x] O callback rejeita transações ausentes, expiradas, alteradas ou reutilizadas.
- [x] O `id_token` do Google somente gera sessão após validação criptográfica e semântica.
- [x] O token do GitHub é utilizado somente para consultar `/user` e o grant é revogado antes da criação da sessão.
- [x] O cookie de sessão é opaco e utiliza `Secure`, `HttpOnly`, `SameSite=Strict` e não possui `Domain`.
- [x] O D1 armazena o hash do cookie, e não o cookie bruto.
- [x] `/api/me` retorna somente o perfil mínimo necessário.
- [x] O logout verifica a `Origin`, remove a sessão do D1 e expira o cookie.
- [x] Um cookie de sessão revogado não pode ser reutilizado.
- [x] Tokens, secrets e códigos de autorização não são armazenados em HTML, URLs salvas, Web Storage ou logs.
- [x] A página estática permanece pública; a sessão protege somente as rotas dinâmicas.
- [x] Sessões administrativas utilizadas durante a configuração foram encerradas.

## Evidências de testes

Foram realizados e registrados os seguintes testes de falha:

1. Callback sem cookie temporário.
2. `state` alterado.
3. Reutilização da transação OAuth.
4. Sessão expirada.
5. Logout com `Origin` inválida.
6. Reutilização de cookie de sessão revogado.

## Declaração

Declaro que os itens acima foram verificados na implementação entregue.

**Integrante:** Julio Cesar dos Santos Ventura  
**RA:** 2026108358

**Assinatura:** ______________________________________

**Data:** ____/____/________
