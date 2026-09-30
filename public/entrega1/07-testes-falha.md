# Testes de falha

## Teste 1 — Callback sem cookie temporário

**Preparação:**  
Iniciado um login com Google em uma janela normal e utilizada a URL de autorização em uma janela anônima, que não possuía o cookie temporário da transação OAuth.

**Pedido enviado:**  
Conclusão do fluxo de autorização do Google na janela anônima, sem o cookie `__Host-oauth-tx`.

**Resultado esperado:**  
O callback deve rejeitar a tentativa sem criar uma sessão.

**Resultado observado:**  
A aplicação respondeu `Transação OAuth ausente.`


## Teste 2 — state alterado

**Preparação:**  
Iniciado um login com Google e alterado um caractere do parâmetro `state` na URL de autorização antes da conclusão da autenticação.

**Pedido enviado:**  
Conclusão do fluxo de autorização do Google com o parâmetro `state` adulterado.

**Resultado esperado:**  
O callback deve rejeitar a tentativa antes da troca do código por tokens e não deve criar uma sessão.

**Resultado observado:**  
A aplicação respondeu `Transação OAuth ausente.`


## Teste 3 — Reutilização da transação OAuth

**Preparação:**  
Realizado um login válido com Google e identificada a URL do callback `/oauth/callback/google` no DevTools.

**Pedido enviado:**  
A mesma URL de callback utilizada no login bem-sucedido foi aberta novamente após a conclusão da primeira autenticação.

**Resultado esperado:**  
O callback deve rejeitar a reutilização da transação OAuth, pois a transação deve ser consumida e removida após o primeiro processamento.

**Resultado observado:**  
A aplicação respondeu `Transação OAuth ausente.`


## Teste 4 — Sessão expirada

**Preparação:**  
No Console do D1, a coluna `expires_at` das sessões foi definida como `0` por meio do comando `UPDATE sessions SET expires_at = 0;`.

**Pedido enviado:**  
Recarregamento da página da aplicação e consulta da rota `/api/me` utilizando o cookie de sessão existente.

**Resultado esperado:**  
A aplicação deve considerar a sessão expirada e responder com status HTTP `401`.

**Resultado observado:**  
A requisição para `/api/me` respondeu com `401 Unauthorized`.


## Teste 5 — Logout com Origin inválida

**Preparação:**  
Realizado um novo login com Google para estabelecer uma sessão válida. Em seguida, aberta uma página de outra origem para realizar a tentativa de logout.

**Pedido enviado:**  
Enviada uma requisição `POST` para `/oauth/logout` a partir de uma origem diferente da `PUBLIC_BASE_URL`, utilizando `credentials: "include"`.

**Resultado esperado:**  
A rota `/oauth/logout` deve rejeitar a requisição com Origin inválida e manter a sessão original.

**Resultado observado:**  
A requisição para `/oauth/logout` respondeu com `403 Forbidden` e, ao retornar à aplicação, a sessão continuou ativa, exibindo `Sessão de...`.


## Teste 6 — Reutilização de cookie de sessão revogado

**Preparação:**  
Com uma sessão válida, o valor do cookie `__Host-session` foi copiado localmente. Em seguida, foi realizado o logout normal da aplicação.

**Pedido enviado:**  
Após o logout, o valor anterior do cookie `__Host-session` foi restaurado no navegador e a rota `/api/me` foi consultada.

**Resultado esperado:**  
A aplicação deve rejeitar o cookie de uma sessão que já foi revogada e responder com status HTTP `401`.

**Resultado observado:**  
A requisição para `/api/me` respondeu com `401 Unauthorized`.
