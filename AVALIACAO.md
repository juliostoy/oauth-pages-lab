# Avaliação: GitHub Actions com IA

**Repositório:** https://github.com/juliostoy/oauth-pages-lab

## Tarefa 1 — CI a cada commit

O workflow `ci.yml` automatiza as verificações do projeto nos eventos configurados. As execuções do CI foram verificadas no GitHub Actions.

- Execução com sucesso: https://github.com/juliostoy/oauth-pages-lab/actions/runs/38657008815
- Execução com erro proposital e explicação: https://github.com/juliostoy/oauth-pages-lab/actions/runs/38656767786

## Tarefa 2 — Proteção da branch main

A branch `main` foi protegida para exigir um Pull Request e a aprovação do status check `verificar` antes do merge. O Pull Request abaixo foi utilizado para testar o fluxo de alterações na branch protegida.

- Pull Request de teste: https://github.com/juliostoy/oauth-pages-lab/pull/1
- Evidência da proteção da branch: configuração da regra de proteção da branch `main` e testes realizados no GitHub.

## Tarefa 3 — Revisão de Pull Request por IA

Foi criado o workflow `revisao-ia.yml` para analisar as alterações dos Pull Requests e publicar comentários com sugestões de revisão. O workflow foi executado com sucesso.

- Pull Request com revisão por IA: https://github.com/juliostoy/oauth-pages-lab/pull/3
- Teste de falha de permissão: https://github.com/juliostoy/oauth-pages-lab/actions/runs/38929565647

**Análise crítica da IA:**  
Durante a revisão, a IA apontou um possível risco relacionado à exposição do token COPILOT_PAT, disponibilizado como variável de ambiente no passo de revisão. Esse alerta é relevante como precaução de segurança, mas não comprova que ocorreu um vazamento. Após a análise, foram restringidas as ferramentas disponíveis para a IA, reduzindo a possibilidade de ações indevidas. Isso demonstra que as sugestões da IA precisam ser avaliadas criticamente e que a revisão automatizada não substitui as boas práticas de segurança.

## Tarefa 4 — Migrações do Cloudflare D1

Foi criado o workflow `migrar-d1` para aplicar as migrações do banco D1 remotamente quando alterações relevantes são enviadas à branch `main`. Após a correção do processo de instalação do Wrangler, a execução do workflow ficou verde.

- Pull Request de criação do workflow: https://github.com/juliostoy/oauth-pages-lab/pull/4
- Pull Request de correção do workflow: https://github.com/juliostoy/oauth-pages-lab/pull/5
- Execução bem-sucedida da migração: https://github.com/juliostoy/oauth-pages-lab/actions/runs/38953630889

## Perguntas

### 1. Por que o `ci.yml` roda duas vezes quando há um Pull Request aberto? Qual execução é considerada pelo status check da `main`?

Isso acontece porque o workflow está configurado para responder a dois eventos: `push` e `pull_request`. O envio de commits à branch dispara a execução de `push`, enquanto a atualização do Pull Request dispara a execução de `pull_request`. Para permitir o merge, o GitHub verifica o status check exigido pela regra de proteção da branch, associado ao Pull Request.

### 2. Por que um Pull Request vindo de um fork não consegue usar `secrets.COPILOT_PAT`? Qual ataque essa regra impede?

Por segurança, workflows disparados por Pull Requests de forks não recebem os secrets do repositório de destino. Essa regra ajuda a impedir que código malicioso enviado por alguém de fora do repositório roube tokens, senhas ou outros dados confidenciais.

### 3. Por que o workflow da Tarefa 3 declara `permissions` em vez de usar as permissões padrão do `GITHUB_TOKEN`?

A declaração explícita de `permissions` aplica o princípio do menor privilégio, concedendo somente as permissões necessárias para cada tarefa. Isso torna as permissões mais previsíveis e reduz os riscos de conceder acesso excessivo ao token.

### 4. A revisão da IA pode substituir o status check da Tarefa 2? Justifique.

Não. A revisão da IA serve como auxílio para identificar possíveis problemas no código, mas pode cometer erros ou deixar de encontrar falhas. O status check do CI executa verificações automatizadas exigidas pela proteção da branch. Por isso, a revisão da IA não deve substituir o status check obrigatório.

## Referências

- GitHub Actions — Workflow syntax: https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions
- GitHub Copilot CLI em GitHub Actions: https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/automate-with-actions
- Cloudflare D1 — Migrations: https://developers.cloudflare.com/d1/reference/migrations
