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
