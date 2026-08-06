# Blue Media

Sistema de gestão de totens de divulgação digital — produto do Grupo SAE.

Plataforma para cadastro de clientes, gerenciamento de totens físicos e distribuição de conteúdo em vídeo, com monitoramento de status e controle remoto via painel web.

## Stack

- **Backend**: NestJS
- **Web**: Angular (servido como estático pelo próprio Nest em produção)
- **Mobile (totem)**: Android nativo (Kotlin)
- **Banco de dados**: PostgreSQL

## Estrutura do repositório

```
/backend    → API Nest (núcleo do sistema)
/frontend   → Painel web Angular (CRUD, monitoramento)
/mobile     → App Android do totem (player + sincronização)
```

Monorepo simples, sem ferramenta de build unificado (Nx) no momento — pode ser adotado depois se a dor de CI justificar.

## Como funciona

- Cada **totem** pertence a um **cliente** e opera em um `content_mode`:
  - `shared`: conteúdo próprio + institucional + terceiros (exceto concorrentes da mesma categoria)
  - `exclusive`: conteúdo próprio + institucional
  - `exclusive_strict`: só conteúdo próprio
- A regra de concorrência é resolvida por categoria: dois clientes da mesma categoria nunca aparecem no mesmo totem.
- A playlist final é resolvida no backend (`TotemPlaylistResolver`) e entregue pronta via API — o app Android não implementa nenhuma regra de negócio, só reproduz.
- Comunicação totem ↔ backend é via **polling HTTP** (heartbeat a cada 5min), sem WebSocket/MQTT — status e comandos pendentes trafegam na mesma requisição.
- Autenticação do totem é feita por **token opaco** (device pareado via código de 6 dígitos no dashboard), diferente da autenticação de usuário do dashboard (JWT).

## Deploy

Build do Angular é copiado para dentro do Nest (`ServeStaticModule`), gerando um único artefato de deploy (backend + web). O app Android tem pipeline de build separado (Gradle).

## Status

Em desenvolvimento inicial — schema de banco e arquitetura definidos, frontend em prototipagem.