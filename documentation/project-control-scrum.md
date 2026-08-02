# Proyexa (project-control) — Scrum SaaS GraphQL

## Stack

- NestJS app: `apps/project-control`
- GraphQL resolvers under `apps/project-control/src/applications/graphql`
- Business: `libs/common/src/business/project-control`
- Repos: `libs/common/src/database/prisma/project-control`
- Prisma models prefijo `PC*`

## Tenancy

No hay `tenantId` en JWT. Aislamiento:

- `companyId` (ACCompanies) en cada entidad
- `userId` del creador
- Filtro con `ctx.req.user.getUserIdIsAdmin` (admin de app ve todo)

## Engines

### Planificación (`PCPlanningEngine`)

- Validación de grafo (ciclos + topológico)
- Ruta crítica ideal (ES/EF/LS/LF, holgura)
- Plan ajustado por capacidad: lista + topológico + sin solape por actor
- Ausencias simuladas (`actorUnavailability`) y carga por actor (`actorLoads`)

Limitación conocida: el plan ajustado es determinista (heurística), no optimización matemática global.

### Capacidad / escenarios (`PCCapacityBusiness`)

- `PCCapacityInsights`: horas, capacidad libre/día, semáforo OVERLOADED|BALANCED|AVAILABLE, sugerencias de aceleración
- `PCScenarioSimulate` (query, no persiste): ABSENCE | REMOVE_OR_REASSIGN | ADD_MEMBER_MONTH
- Ausencias solo simuladas (sin modelo Prisma de vacaciones)

### Costos (`PCCostEngine`)

- Estimado = horas × tarifa del miembro
- QA: HORAS_FIJAS | HORAS_POR_ACTOR | PORCENTAJE_HORAS_DESARROLLO | HORAS_POR_TAREA
- Contingencia = subtotal × %
- Real = suma `PCTimeEntries.calculatedCost`
- Proyección = real + pendiente + QA + contingencia

Montos en `Float` (convención del monorepo).

## Import Excel

- Lib: `exceljs`
- Flujo: plantilla → preview (base64) → confirm
- Columnas: codigo, tipo, titulo, descripcion, prioridad, estado, storyPoints, horasEstimadas, responsable, sprint, codigoPadre, dependeDe

## Operaciones GraphQL principales

Actores: `PCActorsByCompany`, `PCActorCreate`, `PCActorUpdate`, `PCActorActivate`, `PCActorDeactivate`

Proyectos: `PCProjectsByCompany`, `PCProjectCreate`, `PCProjectUpdate`, `PCProjectChangeStatus`, `PCProjectSummary`, miembros add/update/remove

Backlog / Sprints / Dependencias / Planning / Hours / Costs / Baselines / Import: ver resolvers `PC*`

## Sync BD

Sin carpeta `prisma/migrations`. Tras cambiar schema:

```bash
npx prisma generate
npx prisma db push   # cuando Postgres esté disponible
```
