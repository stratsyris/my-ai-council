# LLM Council TODO

## Backend Features
- [x] Database schema for conversations and messages
- [x] OpenRouter API integration service
- [x] Council orchestration logic (3-stage process)
- [x] Stage 1: Collect individual responses from multiple LLMs
- [x] Stage 2: Peer review and ranking system
- [x] Stage 3: Chairman synthesis of final answer
- [x] Conversation management endpoints (create, list, get)
- [x] Message endpoints (send, get history)
- [x] Automatic conversation title generation

## Frontend Features
- [x] Chat interface with message input
- [x] Sidebar with conversation list
- [x] Stage 1 display: Tab view for individual LLM responses
- [x] Stage 2 display: Rankings and peer reviews
- [x] Stage 3 display: Final synthesized answer
- [x] Loading states for each stage
- [x] Markdown rendering for responses
- [x] Responsive design
- [x] New conversation button
- [x] Conversation selection and history

## Configuration
- [x] OpenRouter API key setup
- [x] Council models configuration
- [x] Chairman model configuration

## Mobile Optimization
- [x] Responsive sidebar with mobile drawer/sheet
- [x] Mobile-friendly header with hamburger menu
- [x] Touch-optimized input controls
- [x] Improved spacing and typography for small screens
- [x] Collapsible stage sections on mobile
- [x] Better tab navigation for touch devices
- [x] Optimized message display for narrow screens

## Error Handling & UX
- [x] Add user-friendly error message for missing API key
- [x] Create configuration setup guide component
- [x] Add error boundary with helpful instructions
- [x] Display configuration status on startup

## Mobile Input Issues (Bug Fix)
- [x] Fix mobile input area visibility and functionality
- [x] Ensure message input is visible on mobile devices
- [x] Test question submission on mobile
- [x] Verify keyboard handling on mobile

## Document Upload Feature
- [x] Add document upload endpoint to backend
- [x] Implement file storage to S3
- [x] Extract text from documents (PDF, DOCX, TXT)
- [x] Create document upload UI component
- [x] Add document preview in chat
- [x] Pass document content to council for evaluation
- [x] Display document analysis in council responses

## Bug Fixes
- [x] Mobile input area not visible/accessible

## UI/UX Improvements
- [x] Dark mode toggle
- [x] Gradient header with council member avatars
- [x] Animated response cards
- [x] Improve contrast on stage tabs

## Chairman Synthesis Issues
- [x] Fix chairman synthesis error handling
- [x] Improve chairman prompt for better synthesis
- [x] Add fallback synthesis logic
- [x] Enhance result validation and error display
- [x] Update chairman to Gemini 3 Pro Preview

## Flow Restructuring - Option A
- [x] Remove peer ranking Stage 2
- [x] Restructure Stage 2: Chairman analyzes all 4 responses
- [x] Restructure Stage 3: Chairman creates consensus-based final answer
- [x] Update database service for new flow
- [x] Update council router for new flow
- [x] Remove rankings display from UI

## Chairman Synthesis Bug
- [x] Stage 2 chairman not completing synthesis after receiving Stage 1 responses
- [x] Final answer not being generated or displayed

## Stage 2 UI Display Bug
- [x] Stage 2 chairman final answer not displaying in UI
- [x] Only Stage 1 responses visible
- [x] Need to show Stage 2 section below Stage 1 tabs
