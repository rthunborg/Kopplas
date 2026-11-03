# Kopplas

Kopplas is a business operations platform being developed for electrical contractors. Its vision is to connect the work that happens before, during, and after a job: understanding the customer’s needs, preparing a calculation and quote, planning people and materials, carrying out the work, and keeping the documentation together.

The aim is to give office staff and field teams a shared view of the business, with connected workflows rather than information scattered across separate tools.

Kopplas is an independent product initiative by Rasmus Alestig Thunborg. It is under active development and is not yet a finished, generally released product. The capabilities below describe the intended product direction; delivery status is tracked in the repository’s implementation and planning documents.

## Product vision

The platform is intended to bring together:

- **Customers and commercial work:** customer records, calculations, quotes, versioned PDFs, and follow-up.
- **Jobs and projects:** the people, work orders, materials, costs, and progress associated with each job.
- **Planning and coordination:** scheduling, resource availability, team assignments, and time reporting.
- **Documents and field workflows:** files, photos, project records, self-inspections, and handover documentation.
- **Business administration:** company settings, pricing, permissions, billing information, and accounting integration.

These areas are designed to share information. A quote should provide a useful starting point for a job; a job should connect to its people, schedule, materials, and documents. Access should reflect the person’s role and company.

Longer-term plans include AI-assisted workflows. Those plans are separate from the deterministic business functionality currently being developed.

## Engineering approach

Kopplas uses Next.js, React, and TypeScript, with Supabase PostgreSQL, Auth, and Storage. The architecture emphasizes tenant isolation, role-based permissions, server-side validation, auditable changes, and consistent financial calculations.

The repository contains application code, database migrations, automated tests, CI workflows, architecture decisions, and development-process tooling. The product was previously called ElproSaas; historical names remain where needed for compatibility and traceability.

## Developing with coding agents

Kopplas is also the setting for my most extensive work on agentic software development.

I use the open-source [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) as a foundation. I originated the additional workflow requirements and adaptations around it, using coding agents to help implement the application and the supporting tooling.

That work includes:

- Task ownership and coordination between agents working in separate Git worktrees.
- Independent review, explicit acceptance criteria, and evidence required before work is counted as complete.
- Approval boundaries for consequential changes.
- Reasoning-effort allocation based on the task’s sensitivity and complexity.
- CI checks selected according to the changes being reviewed.
- Limits on repeated review and verification when they add overhead without resolving consequential issues.

An ongoing concern is how to make oversight both dependable and practical. More checks do not automatically produce a better result. The workflow has evolved in response to observed failures, unnecessary repetition, and the difference between reported success and verified completion.



## Explore the repository

- [Agent operating rules](AGENTS.md): scope, review expectations, and reasoning-effort policies.
- [Parallel development workflow](docs/process/parallel-auto-bmad.md): ownership, isolation, coordination, integration, and recovery.
- [Local development setup](docs/process/local-setup.md): environment and verification requirements.
- [Quality and CI documentation](docs/quality/ci.md).
- [Architecture and product decisions](docs/decisions/).
- [Planning and implementation artifacts](_bmad-output/).

For development, follow the local setup documentation and the versions pinned in the repository. Kopplas uses pnpm. Automated verification must use the isolated environments described in the project documentation.


