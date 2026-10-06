# Padrão de Desenvolvimento — ChatGPT + Plugins + Preview

## Status
Este documento define o método operacional padrão para os projetos de desenvolvimento do Tiago a partir de outubro de 2026.

## Princípio central
Depois que um projeto estiver estruturado com repositório Git, integração de hospedagem e backend/serviços conectados, o desenvolvimento deve ocorrer prioritariamente dentro do chat de planejamento/desenvolvimento, usando os plugins/conectores disponíveis diretamente no ChatGPT.

O Work deixa de ser o ambiente padrão de implementação. Ele passa a ser exceção, utilizado somente quando uma tarefa realmente exigir capacidade que não esteja disponível no chat atual ou nos plugins conectados.

## Ciclo padrão de desenvolvimento
1. Planejar e aprovar a mudança no chat.
2. Quando houver requisito visual, aprovar primeiro o design/mockup/referência visual.
3. Implementar diretamente no repositório pelo plugin GitHub, em branch de desenvolvimento ou branch da tarefa.
4. Deixar a integração com Vercel gerar automaticamente um Preview dessa branch/commit.
5. Validar o Preview tecnicamente e visualmente.
6. Enviar o link do Preview para homologação do Tiago.
7. Somente depois da aprovação explícita, promover/mesclar/publicar em produção.
8. Produção nunca deve ser alterada como atalho para testar mudanças.

## Fonte de verdade
- Código: GitHub.
- Preview e produção: Vercel ou plataforma equivalente conectada ao repositório.
- Dados/backend: Supabase ou serviço equivalente, usando plugin/conector próprio quando disponível.
- O chat coordena o processo; não deve depender de um ambiente Work temporário como fonte única do projeto.

## Regra Plugin First
Antes de enviar o usuário para Work, terminal, CLI ou procedimento manual:
1. verificar se existe plugin/conector adequado já conectado;
2. usar o plugin diretamente quando ele tiver capacidade suficiente;
3. evitar transferir o projeto para outro ambiente sem necessidade;
4. evitar ciclos manuais de autenticação e infraestrutura quando o conector já resolve a operação.

## Verificação obrigatória de conectores
Antes de sugerir Work, Codex, terminal ou qualquer ambiente externo, verificar primeiro os conectores disponíveis na conversa.

Para projetos já estruturados:
- GitHub conectado com escrita = implementar pelo GitHub.
- Vercel conectado = usar Preview/deploy pelo Vercel.
- Supabase conectado = operar backend pelo Supabase quando necessário.
- A falta de terminal local não significa falta de capacidade de implementação.
- Se o usuário disser “pode implementar”, seguir direto para a execução por plugins depois que o entendimento já estiver confirmado.
- Só mudar para outro ambiente quando uma limitação concreta do conector tiver sido verificada.
- Não oferecer prompt copiável quando a própria conversa consegue executar a tarefa.

## Protocolo de confirmação e execução
Quando Tiago pedir uma correção ou evolução dentro de um projeto que já esteja integrado aos plugins:
1. explicar em linguagem humana o que foi entendido, incluindo causa provável, resultado esperado e qualquer decisão relevante;
2. aguardar apenas a confirmação quando houver ambiguidade material ou quando Tiago pedir explicitamente essa confirmação;
3. depois da confirmação, definir internamente o plano técnico e executar diretamente pelos plugins/conectores adequados;
4. não entregar prompt, comando copiável ou “texto exato da correção” quando a própria conversa já possui capacidade de implementação;
5. prompts para Work/Codex ou outro ambiente só devem ser produzidos quando a execução realmente precisar ser transferida para outro ambiente;
6. após implementar, gerar/validar o Preview e informar objetivamente o que mudou e o que deve ser homologado.

Em resumo: ENTENDER -> EXPLICAR EM LINGUAGEM HUMANA -> CONFIRMAR QUANDO NECESSÁRIO -> IMPLEMENTAR DIRETAMENTE -> PREVIEW -> HOMOLOGAR.
## Quando Work pode ser usado
Work é exceção. Só deve ser recomendado quando pelo menos uma destas condições ocorrer:
- a operação exige manipulação local pesada ou ferramenta não exposta pelos plugins;
- é necessário executar uma tarefa longa/multietapa que o chat atual não consegue concluir diretamente;
- o repositório/serviço ainda não está estruturado e é necessário um bootstrap inicial;
- o plugin necessário está indisponível ou não oferece a ação exigida.

Antes de encaminhar para Work, explicar claramente por que o fluxo normal por plugins não é suficiente.

## Bootstrap de novos projetos
Para novos aplicativos/projetos, preparar uma única vez a infraestrutura de trabalho:
1. criar/organizar o repositório GitHub;
2. conectar o projeto à Vercel/plataforma de hospedagem;
3. configurar Preview automático por branch/commit;
4. conectar Supabase/backend quando necessário;
5. configurar variáveis de ambiente de forma segura;
6. validar que GitHub -> Preview funciona;
7. a partir daí adotar o ciclo Plugin First como padrão.

## Regra de design
Projetos com interface visual seguem Design First:
- primeiro discutir e aprovar UX, layout e mockup;
- só depois implementar;
- implementação ocorre pelo mesmo ciclo GitHub -> Preview -> homologação -> produção.

## Adaptação por projeto
### Super Cell
Fluxo padrão: chat -> GitHub plugin -> Vercel Preview automático -> homologação -> produção.
Supabase é operado pelo plugin quando houver mudança de dados, Storage, Auth ou migration.

### MonMon.App
Manter Design First como regra obrigatória. Após aprovação visual: implementar pelo repositório conectado -> gerar Preview -> homologar -> produção. Não voltar ao Work como padrão apenas por se tratar de outro aplicativo.

### Painel de Gestão DataCrazy
Mesmo ciclo Plugin First. Alterações envolvendo Supabase, API DataCrazy, cron/SLA ou autenticação devem ser isoladas e validadas em Preview/teste antes de produção. Não executar mudanças destrutivas ou operacionais diretamente em produção sem homologação.

### Projetos futuros
Repetir o mesmo modelo: estruturar repositório + hospedagem + backend/conectores uma vez; depois desenvolver diretamente pelo chat usando plugins e Preview automático.

## Segurança operacional
- Não alterar produção sem aprovação explícita.
- Não usar produção para experimentar UI ou lógica.
- Não misturar desenvolvimento com investigação ampla de infraestrutura sem necessidade.
- Se um conector falhar, fazer uma verificação objetiva; não entrar em loops repetitivos de autenticação/CLI.
- Preservar um checkpoint versionado no GitHub antes de mudanças relevantes.
- Mudanças de banco devem ser versionadas por migration quando aplicável.
- Segredos nunca devem ser solicitados ou expostos no chat se puderem ser manipulados pelo serviço conectado.

## Regra de continuidade
Ao retomar qualquer projeto existente, antes de propor um novo ambiente de execução:
1. identificar o repositório e a branch atual;
2. verificar os plugins/conectores disponíveis;
3. verificar a integração de Preview;
4. continuar pelo fluxo Plugin First se a infraestrutura já estiver pronta.

Não presumir que é necessário voltar para Work só porque o projeto foi originalmente desenvolvido lá.

## Exceção e escalonamento
Se o método Plugin First não puder ser usado, a exceção deve ser explícita, justificada e temporária. Assim que a infraestrutura estiver novamente disponível, retornar ao ciclo padrão.

## Resumo operacional
PLANEJAR/DESIGN -> IMPLEMENTAR VIA PLUGIN NO GITHUB -> PREVIEW AUTOMÁTICO -> HOMOLOGAR -> PRODUÇÃO.

Este é o método padrão para Super Cell, MonMon.App, Painel de Gestão DataCrazy e projetos futuros, adaptando apenas as particularidades de cada produto.
