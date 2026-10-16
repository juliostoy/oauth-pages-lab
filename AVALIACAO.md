# Avaliação: GitHub Actions com IA

**Repositório:** https://github.com/juliostoy/oauth-pages-lab

## Tarefa 1 — CI a cada commit

O workflow `ci.yml` automatiza as verificações do projeto nos eventos configurados. As execuções do CI foram verificadas no GitHub Actions.

- Execução com sucesso: **[INSERIR LINK DA EXECUÇÃO VERDE]**
- Execução com erro proposital e explicação: **[INSERIR LINK DA EXECUÇÃO VERMELHA]**

## Tarefa 2 — Proteção da branch main

A branch `main` foi protegida para exigir um Pull Request e a aprovação do status check do CI antes do merge. Foi verificado o bloqueio de alterações diretas e o fluxo de liberação por Pull Request.

- Pull Request de teste: **[INSERIR LINK DO PR DE TESTE]**
- Evidência da tentativa de push direto recusada: **[INSERIR LINK OU REGISTRO DA EVIDÊNCIA]**

## Tarefa 3 — Revisão de Pull Request por IA

Foi criado o workflow `revisao-ia.yml` para analisar as alterações dos Pull Requests e publicar comentários com sugestões de revisão. O workflow foi executado com sucesso.

- Pull Request com revisão por IA: https://github.com/juliostoy/oauth-pages-lab/pull/3
- Teste de falha de permissão: **[INSERIR LINK DA EXECUÇÃO COM ERRO DE PERMISSÃO]**

**Análise crítica da IA:**  
[REGISTRAR UMA AFIRMAÇÃO INCORRETA OU IRRELEVANTE FEITA PELA IA E EXPLICAR POR QUE ELA ESTÁ INCORRETA OU NÃO SE APLICA AO CÓDIGO.]

## Tarefa 4 — Migrações do Cloudflare D1

Foi criado o workflow `migrar-d1` para aplicar as migrações do banco D1 remotamente quando alterações relevantes são enviadas à branch `main`. Após a correção do processo de instalação do Wrangler, a execução do workflow ficou verde.

- Pull Request de criação do workflow: https://github.com/juliostoy/oauth-pages-lab/pull/4
- Pull Request de correção do workflow: **[INSERIR LINK DO PR DE CORREÇÃO]**
- Execução bem-sucedida da migração: **[INSERIR LINK DA EXECUÇÃO VERDE DE migrar-d1]**

## Perguntas

### 1. Por que o `ci.yml` roda duas vezes quando há um Pull Request aberto? Qual execução é considerada pelo status check da `main`?

Isso acontece porque o workflow está configurado para responder a dois eventos: `push` e `pull_request`. O envio de commits à branch dispara a execução de `push`, enquanto a atualização do Pull Request dispara a execução de `pull_request`. Para permitir o merge, o GitHub verifica o status check exigido pela regra de proteção da branch, associado ao Pull Request.

### 2. Por que um Pull Request vindo de um fork não consegue usar `secrets.COPILOT_PAT`? Qual ataque essa regra impede?

Por segurança, workflows disparados por Pull Requests de forks não recebem os secrets do repositório de destino. Essa regra ajuda a impedir que código malicioso enviado por alguém de fora do repositório roube tokens, senhas ou outros dados confidenciais.

### 3. Por que o workflow da Tarefa 3 declara `permissions` em vez de usar as permissões padrão do `GITHUB_TOKEN`?

A declaração explícita de `permissions` aplica o princípio do menor privilégio, concedendo somente as permissões necessárias para
