# Context-Preserving AI Research Interface PRD

## Overview
Context-Preserving AI Research Interface is a full-stack research assistant designed to solve a common failure mode in AI chat products: when users ask about a specific word or phrase in an answer, the system often loses the original research context.

This project introduces a dual-context workflow:
- the main chat remains focused on the original topic
- a separate explanation panel handles word- or phrase-level clarification

The result is a more stable, research-friendly AI experience for technical learning, topic exploration, and concept breakdown.

## Problem
Most AI chat systems treat every follow-up as part of the same linear conversation. That creates a workflow problem:
- users ask a broad question
- the AI responds with several unfamiliar terms
- the user asks what one term means
- the main conversation shifts away from the original topic
- the research thread becomes diluted or lost

This is especially painful for:
- students learning technical subjects
- developers reading unfamiliar architecture or framework terminology
- researchers parsing dense content
- self-learners exploring layered concepts step by step

## Vision
Build an AI research workspace where users can inspect any word or phrase in an AI response without interrupting the main thread of thought.

The product should feel like:
- an AI chat interface with contextual depth
- a built-in glossary for live research
- a workspace for structured understanding rather than one-dimensional chat

## Goals
### Primary Goals
- Preserve the user’s main research context during follow-up clarification.
- Let users click or select words and phrases from AI responses.
- Show short, contextual explanations in a side panel.
- Keep the frontend interaction simple and intuitive.
- Keep the backend modular so the LLM provider can be swapped without changing the frontend API contract.

### Secondary Goals
- Demonstrate a strong portfolio-quality full-stack architecture.
- Support future extensibility for saved sessions, citations, and richer research tools.
- Provide a low-cost inference path using Google Gemini.

## Non-Goals
The current version does not aim to provide:
- user authentication
- persistent database storage
- team collaboration
- document upload or PDF parsing
- source citations or web browsing
- long-term memory across sessions
- voice input
- multi-model routing

## Target Users
### Primary Users
- students
- developers
- technical interview candidates
- researchers
- writers and analysts

### Key User Needs
- understand difficult words without restarting the conversation
- continue learning in a stable context
- reduce friction during topic exploration
- explore explanations inline rather than leaving the app

## Core Value Proposition
Users can research a topic deeply while exploring side meanings in parallel, without breaking the main AI conversation.

In one sentence:

> Ask the big question, click the confusing term, keep the original context.

## User Stories
### Main Chat
- As a user, I want to ask a broad research question and receive a helpful AI answer.
- As a user, I want my prior messages preserved during the main conversation.

### Contextual Explanation
- As a user, I want to click a word in the AI response and get its meaning.
- As a user, I want to select a short phrase like `platform independent` and get a contextual explanation.
- As a user, I do not want that explanation request to change the main chat thread.

### Clarity and Flow
- As a user, I want the explanation to appear in a separate panel so I can continue reading the answer.
- As a user, I want the selected word or phrase to be visually highlighted.
- As a user, I want clear loading and error states if the explanation request fails.

## Product Scope
### In Scope
- AI research chat UI
- contextual explanation side panel
- clickable word rendering
- phrase selection for explanation
- NestJS REST API
- Gemini integration
- frontend state-based message history
- environment-based configuration

### Out of Scope
- account system
- shared workspaces
- database-backed chat history
- analytics dashboard
- admin tooling

## Functional Requirements
## 1. Main AI Research Chat
The application must provide a chat interface where users can submit research questions and receive AI-generated responses.

Requirements:
- users can type a prompt and send it
- messages appear in chat bubbles
- chat history is scrollable
- user and assistant messages are visually distinct
- prior chat history is sent to the backend for continued context

API:
- `POST /chat`

Request:
```json
{
  "message": "Explain JavaScript features",
  "history": [
    {
      "role": "user",
      "content": "What is JavaScript?"
    },
    {
      "role": "assistant",
      "content": "JavaScript is a programming language..."
    }
  ]
}
```

Response:
```json
{
  "response": "JavaScript is a versatile language..."
}
```

## 2. Clickable Word and Phrase Explanation
The application must allow users to inspect AI responses without mutating the main research context.

Requirements:
- assistant responses are rendered as clickable tokens
- clicking a token opens the explanation panel
- selecting multiple words also opens the explanation panel
- the selected text is sent to the backend along with its context
- the explanation request does not append a new message to chat history

API:
- `POST /explain`

Request:
```json
{
  "word": "platform independent",
  "context": "JavaScript supports platform independent runtimes through engines like V8."
}
```

Response:
```json
{
  "explanation": "Platform independent means software can run on different operating systems without needing separate code changes."
}
```

## 3. Explanation Panel
The explanation panel must function as a separate secondary workspace for clarification.

Requirements:
- hidden or inactive by default
- opens when a word or phrase is clicked
- shows the selected text
- shows loading feedback during request execution
- shows a friendly error message if the backend fails
- supports close/reset behavior

## 4. Backend AI Provider Layer
The backend must:
- use Google Gemini via the official Node.js SDK
- use `GEMINI_API_KEY` from environment configuration
- use the `gemini-2.5-flash` model
- return the same response shapes used by the frontend
- wrap provider failures in clear backend errors

## 5. Prompt Separation
The system must keep chat generation and explanation generation independent.

Requirements:
- `chat` uses conversation history plus the new user message
- `explain` uses only the selected text and local context
- explanation calls must not alter the main conversation state

## UX Requirements
### Layout
- desktop layout uses a two-column split
- left side contains the main AI research chat
- right side contains the explanation panel
- mobile layout should stack cleanly and remain usable

### Interaction Design
- clicked or selected words should feel intentionally interactive
- explanations should appear fast and feel lightweight
- the main chat must remain readable while the side panel is active
- the interface should communicate that explanation is a side-path, not a new main prompt

### Visual Requirements
- calm and research-oriented visual style
- strong readability for long-form assistant text
- subtle highlight for selected text
- clear distinction between primary and secondary context

## Technical Architecture
### Frontend
- Next.js with App Router
- TypeScript
- functional React components
- frontend-only chat state management
- REST calls to backend

Frontend structure:
- `app/`
- `components/ChatWindow.tsx`
- `components/MessageBubble.tsx`
- `components/ExplanationPanel.tsx`
- `api.ts`

### Backend
- NestJS
- TypeScript
- REST API
- provider abstraction through a shared AI service

Backend structure:
- `src/modules/chat`
- `src/modules/explain`
- `src/services/gemini.service.ts`

## Environment Variables
### Backend
```env
GEMINI_API_KEY=your_api_key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Success Metrics
### MVP Success Metrics
- user can submit a chat message successfully
- assistant response renders correctly
- user can click a word or phrase successfully
- side explanation loads without changing main chat state
- backend response contracts remain stable

### Product Metrics
- explanation click-through rate
- average explanation requests per session
- average session length
- follow-up prompt rate after explanation
- `/chat` error rate
- `/explain` error rate

## Acceptance Criteria
- `POST /chat` works and returns `{ "response": string }`
- `POST /explain` works and returns `{ "explanation": string }`
- assistant messages render as clickable words
- selected text opens the explanation panel
- explanation requests do not change main chat history
- backend uses Gemini, not OpenAI
- app runs locally through environment configuration
- errors are visible to the user when provider calls fail

## Risks
### Product Risks
- users may expect citations or fact-checking
- single-word tokenization can feel too naive for some phrases
- explanations may be too generic if context is too short

### Technical Risks
- model naming and provider deprecations may change over time
- prompt formatting can affect explanation quality
- no persistence means users lose state on refresh
- error bodies from provider SDKs may expose too much raw detail unless normalized

## Future Roadmap
### Phase 2
- phrase-aware semantic tokenization
- saved glossary history
- persistent sessions
- markdown and code block rendering
- streaming assistant responses
- stronger backend error normalization

### Phase 3
- citations and grounded research mode
- document upload and context extraction
- pinned concepts and note-taking
- concept graph or knowledge map
- user accounts and saved research workspaces

## Why This Project Matters
Most AI chat products optimize for answering the next prompt. This project optimizes for preserving the user’s train of thought.

That makes it a strong product concept because it solves a real interaction problem instead of just wrapping an LLM with a generic UI.

It is also a strong engineering project because it demonstrates:
- thoughtful UX design
- clean frontend/backend separation
- provider abstraction on the backend
- practical state management
- real product thinking beyond raw API integration

## Current Status
This project currently includes:
- Next.js frontend
- NestJS backend
- Gemini-powered `/chat` endpoint
- Gemini-powered `/explain` endpoint
- side-panel explanation workflow
- clickable and selectable assistant response text

## Repository Positioning
This repository can be presented as:
- a portfolio project
- an MVP prototype for an edtech or research SaaS
- a demonstration of context-preserving AI interaction design
- a reference implementation for layered AI UX patterns

## Suggested Next Documents
To strengthen the repository further, the next useful documents would be:
- `README.md`
- `SYSTEM_DESIGN.md`
- `API.md`
- `ROADMAP.md`

