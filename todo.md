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

## UI Enhancements
- [x] Replace header avatars with model logos (OpenAI, Anthropic, Google, xAI)
- [x] Add delete button to each conversation in sidebar
- [x] Add delete confirmation dialog
- [x] Implement conversation deletion API endpoint

## Logo & Delete Button Updates
- [x] Replace emoji logos with actual model logo images in header
- [x] Fix delete button placement - show on ALL conversations in sidebar
- [x] Position red delete icon clearly below conversation text

## Mobile Logo Sizing Issue
- [x] Logos too narrow/small on mobile - need larger sizing
- [x] Improve responsive sizing for header logos

## Auto-Load & Input Visibility
- [x] Auto-load last conversation on page load
- [x] Show input section by default without clicking new conversation
- [x] Reorganize mobile header logos to 2x2 grid for better spacing

## Bulk Delete Feature
- [x] Add checkbox selection to conversation list items
- [x] Implement selection state management in Sidebar
- [x] Implement selection state management in MobileSidebar
- [x] Add "Select All" checkbox when selections are active
- [x] Display selection counter (X / Y selected)
- [x] Add red "Delete Selected" button in header
- [x] Create bulk delete confirmation dialog
- [x] Implement bulkDeleteConversations backend mutation
- [x] Add bulkDeleteConversations handler in Council page
- [x] Test bulk delete on desktop
- [x] Test bulk delete on mobile

## Mobile UI Issues to Fix
- [x] Delete button not showing on mobile sidebar (only Rename visible)
- [x] Bulk delete checkboxes not visible on mobile
- [x] Need to improve mobile layout for rename/delete button row

## Bulk Delete API Error Fix
- [x] Fix "Conversation not found" error in bulk delete (removed ownership check)
- [x] Verify conversation IDs are being passed correctly
- [x] Add error handling for missing conversations
- [x] Test bulk delete with valid conversation IDs (API test: successfully deleted 2 conversations)

## Mobile Delete Button and Bulk Delete Issues
- [x] Delete button not showing on mobile (only Rename visible) - Fixed layout
- [x] Bulk delete checkboxes not appearing on mobile - Added checkbox trigger
- [x] Need to add delete button to mobile conversation items - Implemented
- [x] Need to implement checkbox selection on mobile - Implemented with click-to-select
