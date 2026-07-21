# Deep Stream — Agile Framework, Scrum & Kanban Roadmap

## 🎯 SDLC & Agile Methodology
The Deep Stream platform follows an iterative **Scrum-Ban** framework combining bi-weekly Scrum sprints with continuous Kanban telemetry delivery.

---

## 📋 Product Backlog & Epics

### Epic 1: High-Performance Real-Time Inference
- **User Story 1.1**: As a sports bettor, I want sub-2ms prediction scoring so that I can place live in-play wagers without lag.
  - **Acceptance Criteria**: Gherkin scenario in `tests/bdd/features/match_prediction.feature` passes; p99 latency < 2ms.
  - **Estimate**: 5 Story Points | **Priority**: High

- **User Story 1.2**: As a data engineer, I want automated XGBoost model retrain pipelines via GitHub Actions so that model weights update after every matchday.
  - **Acceptance Criteria**: Retrain CI workflow completes cleanly on StatsBomb push event.
  - **Estimate**: 3 Story Points | **Priority**: Medium

### Epic 2: Generative AI & Interactive 3D Stadium
- **User Story 2.1**: As a user on the match center dashboard, I want to ask an AI chatbot tactical questions so that I understand why expected goals (xG) shift.
  - **Acceptance Criteria**: `DeepAssistant` React component handles prompts and returns structured tactical insights via Flask.
  - **Estimate**: 5 Story Points | **Priority**: High

---

## 📊 Kanban Workflow Columns
1. **Backlog** → 2. **Refinement** → 3. **In Progress (WIP Limit: 3)** → 4. **Code Review & Security Audit** → 5. **CI/CD Testing** → 6. **Done**
