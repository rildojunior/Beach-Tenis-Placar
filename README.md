# Beach Tennis Placar

Placar de beach tennis para celular, instalável como app (PWA).
Publicado em https://beachtennisplacar.rildo.dev

Feito com [Svelte 5](https://svelte.dev), TypeScript, [Tailwind CSS 4](https://tailwindcss.com) e [Vite](https://vite.dev).

## Comandos

```bash
npm install      # instala as dependências
npm run dev      # servidor local com recarga automática (http://localhost:5173)
npm run build    # gera a versão de produção em dist/
npm run preview  # serve a pasta dist/ para testar o build
npm run check    # verifica tipos e erros nos componentes
npm test         # roda os testes
npm run format   # formata o código com Prettier
```

## Estrutura

```
src/
├── main.ts              # ponto de entrada: monta o app e registra o service worker
├── App.svelte           # layout da tela principal
├── app.css              # tema (cores, fonte) e classes compartilhadas do Tailwind
├── components/
│   ├── AppHeader.svelte, GamesPanel.svelte, ScoreCard.svelte, PointButtons.svelte
│   ├── NewTeamForm.svelte, InstallPrompt.svelte
│   ├── modals/          # um arquivo por modal (configurações, times, histórico…)
│   └── ui/              # peças genéricas: Sheet, Alert, Toggle, Segmented, Stepper…
├── stores/              # estado reativo do app (placar, times, histórico, modais)
│   └── persist.svelte.ts  # salva tudo no localStorage automaticamente
└── lib/                 # lógica pura, sem interface
    ├── scoring.ts       # regras de pontuação (com testes)
    ├── storage.ts       # leitura do localStorage e migração de dados antigos (com testes)
    ├── palettes.ts      # cores dos times
    ├── spring.ts        # física de molas usada em todas as animações (com testes)
    ├── gesture.ts       # projeção de impulso, resistência e velocidade do dedo (com testes)
    ├── transitions.ts   # transições do Svelte com as mesmas molas
    ├── haptics.ts       # vibração no fim de game e de set
    ├── share-history.ts # gera a imagem do histórico para compartilhar
    └── device.ts        # tela sempre ligada, detecção de iPhone/app instalado
public/                  # arquivos copiados como estão (ícones, CNAME)
```

### Onde mexer

- **Regra de pontuação:** `src/lib/scoring.ts`, e rode `npm test`.
- **Visual de um pedaço da tela:** o componente correspondente em `src/components/`.
- **Cor ou fonte do tema:** bloco `@theme` em `src/app.css`.
- **Nova cor de time:** lista em `src/lib/palettes.ts`.

## Design

O visual segue as diretrizes de design da Apple para o modo escuro do iOS:

- **Molas em vez de durações fixas.** `src/lib/spring.ts` usa os parâmetros da Apple (`response` e `damping`). A mesma curva é usada nas animações em JavaScript e, via `linear()`, nas transições em CSS.
- **Folhas que se arrastam.** `src/components/ui/Sheet.svelte` segue o dedo, herda a velocidade ao soltar, projeta o impulso para decidir se fecha e resiste ao ser puxada para cima. A matemática está em `src/lib/gesture.ts`.
- **Materiais translúcidos** com desfoque, e a tela de trás recua quando uma folha abre.
- **Fonte do sistema** (SF Pro no iPhone) e números arredondados com largura fixa no placar.
- **Acessibilidade:** respeita "Reduzir movimento", "Reduzir transparência" e "Aumentar contraste".

## Deploy

Cada push na `main` roda o workflow `.github/workflows/deploy.yml`, que verifica, testa, gera o build e publica no GitHub Pages.
A versão exibida nas configurações é gerada automaticamente com a data do build e o commit.
O cache do app instalado é atualizado sozinho a cada deploy, sem precisar trocar versão manualmente.
