# AN7 BET — conectar API-Football com segurança

O arquivo `worker.js` é um proxy para não expor a chave da API no site público.

## Configuração (gratuita)

1. Entre em https://dash.cloudflare.com/ e crie uma conta, se ainda não tiver.
2. Abra **Workers & Pages** e escolha **Create** → **Worker**.
3. Dê o nome `an7-bet-api` e crie o Worker.
4. Abra **Edit code**, substitua o código pelo conteúdo do arquivo `worker.js` deste repositório e faça **Deploy**.
5. No Worker, abra **Settings** → **Variables and Secrets** (ou **Bindings** → **Secrets**, conforme a tela).
6. Crie um **Secret** com o nome exato `API_FOOTBALL_KEY` e cole sua chave da API-Football no campo de valor. Salve e faça deploy novamente, se solicitado.
7. Teste a URL do Worker adicionando `/fixtures?date=2026-10-23`, por exemplo: `https://SEU-WORKER.SEU-USUARIO.workers.dev/fixtures?date=2026-10-23`.

## Atenção

- **Não** coloque a chave da API em `index.html`, no GitHub ou em mensagens públicas. Qualquer pessoa conseguiria copiá-la e gastar sua cota.
- A chave foi compartilhada na conversa; por segurança, gere outra no painel da API-Football e use a nova como Secret.
- O Worker permite consultar `/fixtures`, `/odds`, `/leagues` e `/countries`, e usa cache por 5 minutos para reduzir chamadas repetidas.
- O site atual ainda precisa ser ligado à URL do Worker para mostrar partidas e odds reais. Criar este Worker no repositório não o publica automaticamente no Cloudflare.
