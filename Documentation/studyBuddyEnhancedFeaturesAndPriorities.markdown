# Study Buddy Enhanced: Features and Priorities for Backlog

**Prepared for**: Software Design Project Group (COMS3011A/COMS3025A)  
**Date**: August 12, 2025  
**Prepared by**: Grok 3 (xAI) based on team lead input

## Overview

This document lists the features of **Study Buddy Enhanced**, a web-based platform extending the Campus Study Buddy project. Features include mutual buddy linking, resource sharing (PDFs with tags), discussion threads, course specification, similar course tagging, notifications, in-app chat, and progress tracking. Priorities are assigned based on the **Sprint 1 and Sprint 2 rubrics** (and extrapolated for Sprints 3–4) to ensure alignment with **Section 1.1 Key Requirements** and the **Exceeded Expectations (EE)** goal (80%–100%). Each feature is formatted as a user story or task for direct addition to the **GitHub Projects backlog**, with estimated effort (story points, 1–5 scale) and sprint allocation.

## Prioritization Criteria

- **Sprint 1 Rubric (Total 80%)**: Focus on setup, version control (10%), documentation site (10%), work planning (5%), development guides (5%), Git methodology (5%), project management methodology (15%), stakeholder interaction (10%), initial design/plan (15%), and implementation (15%, e.g., authentication).
- **Sprint 2 Rubric (Total 95%)**: Emphasizes core features (25%), automated testing (10%), stakeholder reviews (10%), API integration (15%), user feedback (10%), project management (10%), bug tracking (5%), database documentation (5%), third-party code documentation (5%), and testing documentation (5%).
- **Extrapolated Sprints 3–4**: Assume focus on feature completion, advanced testing, bug fixes, and polish (e.g., accessibility, offline support). Prioritize remaining features, integrations, and user feedback integration.
- **Key Requirements**: Version control (GitHub), authentication (Google Auth), persistent storage (PostgreSQL), responsive/accessible UI (React), external API (Google Calendar), testing (Vitest/Cypress), continuous improvement (Crystal Clear), collaboration (client/other groups).
- **Prioritization Logic**:
  - **High Priority**: Features critical to Sprint 1 (e.g., authentication, setup) or Sprint 2 core features (25% weight), tied to key requirements (e.g., API integration, security).
  - **Medium Priority**: Supporting features (e.g., notifications, threads) or later sprint tasks (e.g., advanced testing).
  - **Low Priority**: Stretch goals (e.g., cross-university tagging) or post-Sprint 4 tasks (e.g., monetization).

## Features and Priorities

Each feature is listed as a user story or task with:

- **Description**: What the feature does and why it’s needed.
- **Rubric Alignment**: Relevant Sprint 1–2 criteria (or extrapolated Sprints 3–4).
- **Key Requirements**: Which of the 8 requirements it supports.
- **Priority**: High, Medium, Low based on rubric weight and project needs.
- **Effort**: Story points (1–5, where 1 = simple, 5 = complex).
- **Sprint**: Target sprint for completion (1–4).

### 1. User Authentication and Security

- **Description**: As a user, I want to log in securely using Google Auth and protect my profile data (username, profile pic, progress) so that my information is safe.
- **Rubric Alignment**: Sprint 1 – Implementation (15%), Stakeholder Interaction (10% for hidden security needs); Sprint 2 – API Integration (15% for OAuth).
- **Key Requirements**: User Authentication & Security, Persistent Information.
- **Priority**: High (critical for Sprint 1 implementation, security requirement).
- **Effort**: 3 points (OAuth setup, basic security).
- **Sprint**: 1
- **Backlog Item**: Set up Google Auth for user login/registration; Implement access controls for profile data.

### 2. Course Specification

- **Description**: As a user, I want to select or add courses by code and name so that I can connect with relevant study buddies and share resources.
- **Rubric Alignment**: Sprint 2 – Core Features (25%), Database Documentation (5%); Sprint 1 – Initial Design (15% for schema).
- **Key Requirements**: Persistent Information, Responsive UI, Collaboration.
- **Priority**: High (core feature for buddy matching, resource sharing).
- **Effort**: 5 points (UI, API, database schema, validation).
- **Sprint**: 2
- **Backlog Item**: Develop course selection/addition UI and API; Store courses in PostgreSQL with code/name validation.

### 3. Buddy System (Matching and Linking)

- **Description**: As a user, I want to find and mutually link with buddies based on courses or interests so that I can share progress, resources, and groups.
- **Rubric Alignment**: Sprint 2 – Core Features (25%), API Integration (15% for matching API); Sprint 1 – Initial Design (15% for UI).
- **Key Requirements**: Persistent Information, Responsive UI, Integration (API).
- **Priority**: High (core feature, critical for collaboration).
- **Effort**: 5 points (search, mutual linking, privacy controls).
- **Sprint**: 2
- **Backlog Item**: Implement buddy search (by course/interests) and mutual linking; Add privacy settings for linked/unlinked views.

### 6. Similar Course Tagging

- **Description**: As a user, I want to tag courses as similar and vote for permanent tags so that I can connect with students from related courses.
- **Rubric Alignment**: Sprint 3 – Feature Completion (extrapolated); Sprint 2 – Core Features (25% if early implementation).
- **Key Requirements**: Persistent Information, Collaboration, Integration (future cross-university).
- **Priority**: Medium (important but secondary to core features).
- **Effort**: 4 points (tagging UI, voting logic, database).
- **Sprint**: 3
- **Backlog Item**: Implement course tagging/voting UI/API; Set threshold (e.g., 10 votes) for permanent tags.

### 7. Notifications

- **Description**: As a user, I want to receive in-app notifications for group sessions, new resources, and buddy activity so that I stay updated.
- **Rubric Alignment**: Sprint 2 – Core Features (25%), API Integration (15% for notification system); Sprint 3 – User Feedback (extrapolated).
- **Key Requirements**: Persistent Information, Integration, Responsive UI.
- **Priority**: Medium (enhances user experience but not foundational).
- **Effort**: 3 points (Firebase integration, triggers, UI).
- **Sprint**: 2–3
- **Backlog Item**: Set up in-app notifications (Firebase); Trigger for sessions/resources/buddy activity.

### 9. Progress Tracking

- **Description**: As a user, I want to track my group session and personal study time with charts/tables so that I can monitor my progress.
- **Rubric Alignment**: Sprint 2 – Core Features (25%); Sprint 3 – Feature Completion (extrapolated).
- **Key Requirements**: Persistent Information, Responsive UI.
- **Priority**: Medium (core Study Buddy feature but less urgent than new additions).
- **Effort**: 3 points (UI charts, API, database).
- **Sprint**: 3
- **Backlog Item**: Develop progress tracking UI (charts/tables); Log session/study time; Share with linked buddies.

### 10. External API Integration (Google Calendar/ Event Management)

- **Description**: As a user, I want to schedule study sessions and sync with my Google Calendar so that I can manage my time.
- **Rubric Alignment**: Sprint 2 – API Integration (15%); Sprint 1 – Implementation (15% for initial setup).
- **Key Requirements**: Integration, Persistent Information.
- **Priority**: High (critical for rubric and usability).
- **Effort**: 3 points (OAuth, calendar sync, API).
- **Sprint**: 2
- **Backlog Item**: Integrate Google Calendar API for session scheduling; Enable sync to user calendars.

### 17. Responsive and Accessible UI

- **Description**: As a user, I want a responsive, accessible UI (React, semantic HTML, ARIA) so that I can use the app on any device.
- **Rubric Alignment**: Sprint 2 – Core Features (25% for UI); Sprint 3 – Feature Completion (extrapolated).
- **Key Requirements**: Responsive UI, Collaboration.
- **Priority**: High (core usability requirement).
- **Effort**: 4 points (UI development, accessibility).
- **Sprint**: 2–3
- **Backlog Item**: Build responsive UI with React; Add semantic HTML, ARIA labels; Test with WAVE/axe.

### 11. Version Control and CI/CD

- **Description**: As a developer, I want a GitHub repo with CI/CD (GitHub Actions) and code quality tools (ESLint, Prettier, TypeScript) so that we maintain high code quality.
- **Rubric Alignment**: Sprint 1 – Version Control (10%), Git Methodology (5%); Sprint 2 – Third-Party Code Documentation (5%).
- **Key Requirements**: Version Control.
- **Priority**: High (Sprint 1 rubric requirement).
- **Effort**: 3 points (repo setup, CI/CD config).
- **Sprint**: 1
- **Backlog Item**: Set up GitHub repo with Gitflow; Configure ESLint, Prettier, TypeScript, GitHub Actions.

### 12. Documentation Site

- **Description**: As a stakeholder, I want a static documentation site (VitePress on Vercel) with architecture, API specs, and setup guides so that I can understand the project.
- **Rubric Alignment**: Sprint 1 – Documentation Site (10%); Sprint 2 – Database/Third-Party Documentation (10%).
- **Key Requirements**: Collaboration, Continuous Improvement.
- **Priority**: High (Sprint 1 rubric requirement).
- **Effort**: 3 points (site setup, content creation).
- **Sprint**: 1
- **Backlog Item**: Create VitePress site with architecture diagrams, API specs, setup walkthrough; Host on Vercel.

### 13. Development Guides

- **Description**: As a developer, I want guides for setting up frontend, backend, database, and testing so that I can replicate the environment.
- **Rubric Alignment**: Sprint 1 – Development Guides (5%); Sprint 2 – Testing Documentation (5%).
- **Key Requirements**: Collaboration, Testing.
- **Priority**: High (Sprint 1 rubric requirement).
- **Effort**: 2 points (guide writing).
- **Sprint**: 1
- **Backlog Item**: Write guides for React, Node/Express, PostgreSQL, Vitest/Cypress setup.

### 22. Group Report

- **Description**: As a team, we want a comprehensive report on development decisions to meet rubric requirements.
- **Rubric Alignment**: Sprint 4 – Group Report (extrapolated).
- **Key Requirements**: Collaboration, Continuous Improvement.
- **Priority**: High (required deliverable).
- **Effort**: 5 points (extensive documentation).
- **Sprint**: 4
- **Backlog Item**: Write group report with architecture, decisions, and API docs.

### 14. Project Management (Crystal Clear)

- **Description**: As a team, we want to follow Crystal Clear with a GitHub Projects board, planning, and retrospectives so that we deliver iteratively.
- **Rubric Alignment**: Sprint 1 – Project Management Methodology (15%), Work Planning (5%); Sprint 2 – Project Management (10%).
- **Key Requirements**: Continuous Improvement, Collaboration.
- **Priority**: High (Sprint 1 rubric requirement).
- **Effort**: 2 points (board setup, docs).
- **Sprint**: 1
- **Backlog Item**: Set up GitHub Projects board; Document Crystal Clear methodology and rationale.

### 16. Stakeholder Interaction and User Feedback

- **Description**: As a team, we want to meet clients weekly and collect user feedback (Google Forms, insider programs) so that we meet requirements.
- **Rubric Alignment**: Sprint 1 – Stakeholder Interaction (10%); Sprint 2 – Stakeholder Reviews (10%), User Feedback (10%).
- **Key Requirements**: Collaboration, Continuous Improvement.
- **Priority**: High (rubric requirement across sprints).
- **Effort**: 2 points (meetings, forms).
- **Sprint**: 1–4
- **Backlog Item**: Schedule Monday client meetings; Create Google Forms for user feedback; Plan insider program.

### 18. Bug Tracking

- **Description**: As a developer, I want to track bugs using GitHub Issues so that we can resolve issues systematically.
- **Rubric Alignment**: Sprint 2 – Bug Tracker (5%); Sprint 3–4 – Bug Fixes (extrapolated).
- **Key Requirements**: Testing, Continuous Improvement.
- **Priority**: Medium (supports quality but secondary).
- **Effort**: 2 points (issue setup, tracking).
- **Sprint**: 2–4
- **Backlog Item**: Set up GitHub Issues for bug tracking; Assign bugs during sprints.

### 15. Automated Testing

- **Description**: As a developer, I want automated tests (Vitest, Cypress) with 80%+ coverage (Codecov) so that the app is reliable.
- **Rubric Alignment**: Sprint 2 – Automated Testing (10%), Testing Documentation (5%); Sprint 3 – Advanced Testing (extrapolated).
- **Key Requirements**: Testing.
- **Priority**: High (Sprint 2 rubric requirement).
- **Effort**: 3 points (test writing, coverage setup).
- **Sprint**: 2
- **Backlog Item**: Write Vitest unit tests for APIs; Add Cypress for UI; Track coverage with Codecov.

### 4. Resource Sharing

- **Description**: As a user, I want to upload PDFs (lecture notes, code snippets) with tags so that others in my course or similar courses can access them.
- **Rubric Alignment**: Sprint 2 – Core Features (25%), API Integration (15% for resource API), Database Documentation (5%).
- **Key Requirements**: Persistent Information, Integration, Security (malware scans).
- **Priority**: High (core feature, new addition to Study Buddy).
- **Effort**: 4 points (upload, tagging, storage, duplicate checks).
- **Sprint**: 2
- **Backlog Item**: Create resource upload UI/API; Implement tag system and duplicate prevention (checksum/admin review).

### 5. Discussion Threads

- **Description**: As a user, I want to discuss resources in Reddit-style threads (text, code snippets, Markdown) so that I can collaborate with peers.
- **Rubric Alignment**: Sprint 2 – Core Features (25%), User Feedback (10% for moderation); Sprint 3 – Advanced Features (extrapolated).
- **Key Requirements**: Persistent Information, Responsive UI, Collaboration.
- **Priority**: Medium (supports resources but less critical than core setup).
- **Effort**: 4 points (thread UI, Markdown rendering, moderation).
- **Sprint**: 2–3
- **Backlog Item**: Develop thread UI/API with Markdown support; Add threshold-based moderation (e.g., 5 reports).

### 8. In-App Chat

- **Description**: As a user, I want to chat with linked buddies or group members in real-time so that I can communicate within the app.
- **Rubric Alignment**: Sprint 2 – Core Features (25%), API Integration (15% for Socket.IO); Sprint 3 – Advanced Features (extrapolated).
- **Key Requirements**: Persistent Information, Integration (Socket.IO), Responsive UI.
- **Priority**: Medium (key for collaboration but can be simplified).
- **Effort**: 5 points (real-time Socket.IO, UI, persistence).
- **Sprint**: 3
- **Backlog Item**: Implement real-time chat with Socket.IO; Restrict to linked buddies/groups; Text-only.

### 19. Offline Support (Stretch Goal)

- **Description**: As a user, I want basic offline access (e.g., cached resources) so that I can use the app without internet.
- **Rubric Alignment**: Sprint 4 – Polishing (extrapolated).
- **Key Requirements**: Responsive UI, Persistent Information.
- **Priority**: Low (stretch goal for Sprint 4).
- **Effort**: 3 points (PWA implementation).
- **Sprint**: 4
- **Backlog Item**: Implement basic PWA features (e.g., Service Worker for caching).

### 20. Cross-University Collaboration (Stretch Goal)

- **Description**: As a user, I want to connect with students from other institutions via similar course tags so that I can collaborate broadly.
- **Rubric Alignment**: Sprint 4 – Feature Completion (extrapolated).
- **Key Requirements**: Collaboration, Integration.
- **Priority**: Low (stretch goal for future).
- **Effort**: 4 points (tagging expansion, API).
- **Sprint**: 4 or post-project.
- **Backlog Item**: Extend course tagging for cross-university; Update API for broader access.

### 21. Monetization (Stretch Goal)

- **Description**: As a platform owner, I want premium features (e.g., exclusive groups) to monetize cross-university access.
- **Rubric Alignment**: Post-Sprint 4 (extrapolated, not in rubric).
- **Key Requirements**: Integration, Collaboration.
- **Priority**: Low (post-project goal).
- **Effort**: 5 points (complex feature set).
- **Sprint**: Post-project.
- **Backlog Item**: Design premium features (e.g., analytics, exclusive groups); Plan payment integration.

### 23. Individual Reports

- **Description**: As a team member, I want to document my contributions and learnings to meet rubric requirements.
- **Rubric Alignment**: Sprint 4 – Individual Report (extrapolated).
- **Key Requirements**: Collaboration.
- **Priority**: Medium (individual task).
- **Effort**: 3 points per member.
- **Sprint**: 4
- **Backlog Item**: Each member writes individual report on contributions/challenges.

### 24. Presentation

- **Description**: As a team, we want to present the app with slides and a demo to showcase our work.
- **Rubric Alignment**: Sprint 4 – Presentation (extrapolated).
- **Key Requirements**: Collaboration.
- **Priority**: High (required deliverable).
- **Effort**: 4 points (slides, demo prep).
- **Sprint**: 4
- **Backlog Item**: Create presentation slides; Prepare live demo and Q&A.

## Adding to GitHub Projects

1. **Create Board**: Set up a Kanban board in GitHub Projects with columns: Backlog, To Do, In Progress, Review, Done.
2. **Add Items**: Create an Issue or Card for each feature above, including:
   - Title: e.g., “Implement Google Auth for User Login.”
   - Description: Copy user story/task, rubric alignment, key requirements.
   - Labels: e.g., “Sprint 1,” “Feature,” “High Priority,” “Frontend.”
   - Assignees: Assign 1–2 members per task.
   - Milestone: Assign to Sprint 1 (August 19), Sprint 2 (September 2), etc.
   - Effort: Add story points (1–5).
3. **Prioritize**: Sort Backlog by priority (High > Medium > Low).
4. **Grooming**: Bi-weekly meetings to refine items, add acceptance criteria (e.g., “User can log in with Google and see profile.”), and move to Sprint Backlog.

## Notes

- **Total Effort**: ~75 points across sprints (refine during grooming).
- **MVP Scope**: Features 1–18 are critical for Sprint 4 submission; 19–21 are stretch goals.
- **Rubric Focus**: Prioritize Sprint 1 setup (auth, docs, planning) and Sprint 2 core features (course specification, buddy system, resources).
- **Next Steps**: Schedule group meeting by August 15, 2025, to finalize tech stack (React vs. Vue, PostgreSQL vs. MongoDB) and assign tasks. Import this list into GitHub Projects and review with client on August 18.

This list ensures all features are actionable, prioritized, and aligned with rubric goals. Add to your backlog and adjust based on group feedback.
