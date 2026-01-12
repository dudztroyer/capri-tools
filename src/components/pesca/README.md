# Componentes da Página de Pesca 🎣

## Visão Geral

Este módulo implementa a página **"Possibilidade de Pesca"** que fornece uma análise visual das condições climáticas para navegação e pesca, baseada em dados meteorológicos de três pontos geográficos ao longo de uma rota típica de saída para pesca.

A previsão exibe os **próximos 14 dias** a partir de hoje.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PescaPage                                   │
│  ┌──────────────────────────────┐  ┌─────────────────────────────┐  │
│  │    TodayDetailedView         │  │     ForecastDayCard[]       │  │
│  │  ┌────────────────────────┐  │  │     (14 dias de previsão)   │  │
│  │  │ BayPointsVisualization │  │  │                             │  │
│  │  │   (Timeline + Points)  │  │  │                             │  │
│  │  └────────────────────────┘  │  │                             │  │
│  └──────────────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Pontos Geográficos

A previsão monitora 3 pontos ao longo da rota de navegação:

| Ponto | Nome           | Coordenadas            | Multiplicador de Vento | Ventusky                                                    |
| ----- | -------------- | ---------------------- | ---------------------- | ----------------------------------------------------------- |
| A     | **Capri**      | -26.193933, -48.581463 | 0.7x (mais calmo)      | [🔗 Ver](https://www.ventusky.com/pt/-26.193933;-48.581463) |
| B     | **Ilhas**      | -26.171567, -48.483303 | 1.0x (referência)      | [🔗 Ver](https://www.ventusky.com/pt/-26.171567;-48.483303) |
| C     | **Mar Aberto** | -26.120270, -48.287171 | 1.4x (mais exposto)    | [🔗 Ver](https://www.ventusky.com/pt/-26.120270;-48.287171) |

Cada ponto no card de visualização possui um link direto para o Ventusky com as coordenadas correspondentes.

## Componentes

### 1. `BayPointsVisualization.tsx`

Componente principal que visualiza as condições de navegação entre os três pontos.

**Funcionalidades:**

- **Timeline interativa** com seletor de horário (5h-19h)
- **Indicadores visuais** de chuva (🌧️) e mudança de vento (🔄)
- **Cards de cada ponto** com vento, rajadas, precipitação e condição
- **Setas SVG conectoras** entre os pontos
- **Seletor de referência** para alternar a escala entre "Mar Aberto" (padrão) e "Ilhas"
- **Legenda de condições** com cores semáforo

**Props:**

```typescript
interface BayPointsVisualizationProps {
  points: BayPointWeather[];       // Dados dos 3 pontos
  selectedHour: number;            // Hora selecionada (5-19)
  onHourChange: (hour: number) => void;
  hourlyData: Array<{...}>;        // Dados agregados por hora
  windChangeHour: number;          // Hora da mudança de vento
  isActuallyToday: boolean;        // Se é o dia atual
}
```

---

### 2. `TodayDetailedView.tsx`

Card expandido com visualização detalhada do dia selecionado.

**Funcionalidades:**

- **Header colorido** baseado na condição geral do dia
- **Emoji indicador** da condição (🎣 excelente → 🚫 perigoso)
- **Janelas de tempo** (melhor saída, retorno sugerido, mudança do vento)
- **Alerta de perigo** quando há períodos de risco
- **Resumo estatístico** (vento máx, rajadas, manhã calma, chuva total)

**Props:**

```typescript
interface TodayDetailedViewProps {
  forecast: DayForecast; // Previsão do dia selecionado
}
```

---

### 3. `ForecastDayCard.tsx`

Card compacto para visualização rápida de cada dia (lista de 14 dias).

**Funcionalidades:**

- **Indicador visual** de condição (ícone + emoji)
- **Vento manhã/tarde** com direção
- **Tags de janelas** (saída recomendada, perigo)
- **Badge de condição** colorido
- **Destaque visual** quando selecionado

**Props:**

```typescript
interface ForecastDayCardProps {
  forecast: DayForecast;
  onClick?: () => void;
  isSelected?: boolean;
}
```

---

## Sistema de Condições

### Classificação (Semáforo)

| Score          | Cor       | Label     | Critérios                            |
| -------------- | --------- | --------- | ------------------------------------ |
| 🟢 `excellent` | `#1890ff` | Excelente | Vento < 5 km/h, sem chuva            |
| 🟢 `good`      | `#52c41a` | Bom       | Vento 5-10 km/h, sem chuva           |
| 🟡 `moderate`  | `#faad14` | Moderado  | Vento 10-15 km/h ou chuva leve       |
| 🟠 `poor`      | `#fa8c16` | Ruim      | Vento 15-20 km/h ou chuva com vento  |
| 🔴 `dangerous` | `#ff4d4f` | Perigoso  | Vento > 20 km/h ou rajadas > 25 km/h |

### Limites de Segurança

- **Vento máximo ideal**: 15 km/h
- **Rajadas perigosas**: > 20 km/h
- **Precipitação**: 0 mm = bom, qualquer quantidade = considerado
- **Período de previsão**: Máximo 14 dias a partir de hoje

---

## Padrão de Vento (Mock)

O gerador de dados simula o padrão típico da região:

| Período | Direção      | Velocidade | Descrição             |
| ------- | ------------ | ---------- | --------------------- |
| 00h-06h | Variável     | 0-3 km/h   | Muito calmo           |
| 06h-08h | Oeste (270°) | 2-6 km/h   | Brisa matinal         |
| 08h-13h | Oeste→Leste  | 6-12 km/h  | Vento constante       |
| 13h-14h | Transição    | 8-12 km/h  | Vento muda de direção |
| 14h-19h | Leste (90°)  | 8-25 km/h  | Vento crescente       |

---

## Janelas de Tempo

### Melhor Saída (🟢 MELHOR SAÍDA)

- **Horário**: 06:00 - 08:00
- **Condição**: Quando há >= 1 hora de manhã calma

### Retorno Sugerido (🔵 VOLTAR ATÉ)

- **Horário**: 11:00 - 13:00
- **Motivo**: Antes da mudança do vento

### Mudança do Vento (🔄 VENTO MUDA)

- **Horário**: ~13:00
- **Descrição**: Quando o vento muda de W→E para E→W

### Período de Risco (🔴 PERIGO)

- **Horário**: 15:00 - 18:00
- **Condição**: Quando vento máximo > 20 km/h

---

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                    fishingWeatherService.ts                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  getFishingForecast(startDate, days)                     │    │
│  │    → generateDayForecast() x 14                          │    │
│  │      → generateWindForTime() (a cada 15min)              │    │
│  │      → evaluateCondition()                               │    │
│  │      → calculateTimeWindows()                            │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    useFishingForecast.ts                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  useQuery({                                              │    │
│  │    queryKey: ["fishingForecast", startDate, days],       │    │
│  │    queryFn: () => getFishingForecast(startDate, days),   │    │
│  │    refetchInterval: 5 * 60 * 1000                        │    │
│  │  })                                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PescaPage                                 │
│                           │                                      │
│              ┌────────────┴────────────┐                        │
│              ▼                         ▼                        │
│       TodayDetailedView        ForecastDayCard[]                │
│              │                   (14 cards)                     │
│              ▼                                                  │
│    BayPointsVisualization                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Tipos

```typescript
// Dados de vento
interface WindData {
  direction: number; // 0-360° (0=N, 90=E, 180=S, 270=W)
  speed: number; // km/h
  gusts: number; // km/h (rajadas)
}

// Ponto de dados (a cada 15min)
interface WeatherDataPoint {
  timestamp: Date;
  wind: WindData;
  precipitation: number; // mm
  temperature: number; // °C
}

// Dados de um ponto geográfico
interface BayPointWeather {
  pointId: "A" | "B" | "C";
  pointName: string; // "Capri" | "Ilhas" | "Mar Aberto"
  description: string;
  coordinates: { lat: number; lng: number };
  data: WeatherDataPoint[];
}

// Previsão completa de um dia
interface DayForecast {
  date: Date;
  overallCondition: FishingCondition;
  bestDepartureWindow: TimeWindow | null;
  suggestedReturnWindow: TimeWindow | null;
  dangerWindows: TimeWindow[];
  windChangeTime: Date | null;
  points: BayPointWeather[];
  summary: {
    maxWindSpeed: number;
    maxGusts: number;
    totalPrecipitation: number;
    calmMorningHours: number;
  };
}
```

---

## Observações Técnicas

### Serialização de Datas

Os objetos `Date` são serializados como strings pelo React Query. Todos os componentes e funções utilitárias aceitam `Date | string` e fazem a conversão quando necessário.

### Responsividade

- Desktop: Layout em duas colunas (60%/40%)
- Mobile: Layout em coluna única (cards empilhados)
- Lista de 14 dias com scroll quando necessário

### Performance

- Dados agregados por hora são calculados com `useMemo`
- Timeline usa renderização condicional para ícones
- Cards usam `hoverable` do Ant Design para feedback visual

---

## Dependências

- **Ant Design**: Card, Typography, Tag, Segmented, Alert, Tooltip, Spin
- **@ant-design/icons**: Ícones de navegação e status
- **TanStack Query**: Gerenciamento de estado e cache de dados
- **React**: Hooks (useState, useMemo)

---

## Arquivos Relacionados

```
src/
├── app/pesca/page.tsx                    # Página principal
├── components/pesca/
│   ├── BayPointsVisualization.tsx        # Visualização dos pontos
│   ├── TodayDetailedView.tsx             # Card detalhado do dia
│   ├── ForecastDayCard.tsx               # Card compacto do dia
│   └── README.md                         # Esta documentação
├── hooks/
│   └── useFishingForecast.ts             # Hook de dados
├── services/
│   └── fishingWeatherService.ts          # Serviço de dados mock
└── config/
    └── routes.ts                         # Rota "/pesca" configurada
```
