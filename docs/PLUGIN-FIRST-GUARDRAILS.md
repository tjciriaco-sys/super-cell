# Plugin First — Guardrails de Execução

Este arquivo complementa docs/DEVELOPMENT-WORKFLOW.md e reforça o padrão operacional dos projetos de desenvolvimento.

## Fluxo padrão
ENTENDER -> EXPLICAR EM LINGUAGEM HUMANA -> CONFIRMAR QUANDO NECESSÁRIO -> IMPLEMENTAR VIA PLUGINS -> PREVIEW -> HOMOLOGAR -> PRODUÇÃO.

## Regra operacional
Quando um projeto já possui GitHub, Vercel e/ou Supabase conectados, a implementação deve continuar no próprio chat usando esses conectores.

Antes de sugerir Work, terminal, CLI ou outro ambiente:
1. verificar os conectores disponíveis;
2. identificar repositório, projeto e branch;
3. confirmar se o conector oferece a ação necessária;
4. executar diretamente pelo conector quando houver capacidade.

A inexistência de um ambiente local não significa ausência de capacidade de implementação. Alterações feitas pelo GitHub connector e validadas pela Vercel são o fluxo normal.

## Depois da confirmação do Tiago
Quando Tiago disser "pode implementar", "pode seguir" ou equivalente:
- definir internamente o plano técnico;
- editar pelo GitHub connector;
- deixar a Vercel gerar o Preview;
- validar o Preview;
- devolver apenas o resultado e o que precisa ser homologado.

Não enviar prompt copiável ou comando para outro ambiente quando o próprio chat possui capacidade para executar.

## Handoff externo
Só transferir a execução quando:
- Tiago pedir explicitamente um prompt/comando;
- o conector necessário estiver indisponível após verificação;
- a ação necessária não for suportada pelo conector;
- existir uma necessidade técnica concreta fora da capacidade dos conectores.

Nesses casos, explicar qual capacidade está faltando.

## Regra de continuidade
Se Tiago corrigir o fluxo e reforçar que a execução deve ocorrer pelos plugins, essa orientação passa a valer imediatamente. Não repetir a transferência da mesma classe de tarefa sem uma mudança objetiva de capacidade.

## Regra de autenticação dos conectores
Não presumir que uma autorização de GitHub, Vercel, Supabase ou outro conector expirou apenas porque passou tempo, houve troca de mensagem ou começou uma nova etapa.

Antes de pedir a Tiago para autorizar/ativar novamente:
1. fazer uma chamada real de leitura ao conector;
2. distinguir falha de autenticação de falha de permissão, recurso ou operação;
3. só solicitar nova autorização quando a própria ferramenta retornar erro de autenticação/conexão ou quando o conector estiver objetivamente ausente.

Se o conector responder normalmente, continuar a execução sem pedir nova autorização.

## Aplicação
Este padrão vale para Super Cell, MonMon.App, Painel DataCrazy e projetos futuros.
