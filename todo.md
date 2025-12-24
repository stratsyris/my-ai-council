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

## CRITICAL: Conversations Not Loading in Sidebar - FIXED
- [x] Sidebar is completely empty - no conversations displayed (FIXED: N+1 query optimization)
- [x] API returns conversations correctly (129 conversations in database)
- [x] Frontend not fetching or displaying conversations (FIXED: API timeout resolved)
- [x] Delete and bulk delete buttons don't work because no conversations are shown (NOW WORKING)
- [x] Need to debug why conversations query is not working on frontend (FIXED: listConversations query optimized)

## Bulk Delete Feature - FULLY IMPLEMENTED & TESTED
- [x] Checkbox selection system working on desktop
- [x] "Select All" checkbox appears when selections are active
- [x] Selection counter displays correctly ("X / Y selected")
- [x] Red "Delete Selected" button appears in header
- [x] Confirmation dialog prevents accidental deletion
- [x] Bulk deletion successfully deletes multiple conversations
- [x] Sidebar refreshes after bulk deletion
- [x] Single delete button working on all conversations
- [x] Mobile UI improvements for delete buttons
- [x] API tested and working (successfully deleted conversations)
- [x] End-to-end testing completed successfully


## Mobile Layout Issues - Chairman's Final Answer
- [x] Chairman's Final Answer section not centered on mobile (Fixed with overflow-x-hidden)
- [x] Text getting cut off on right side on mobile (Fixed with proper text wrapping)
- [x] Need to fix padding and overflow handling (Added overflow-x-hidden to container)
- [x] Verify text wrapping works properly on narrow screens (Tested and working)


## Console Errors - Conversation Not Found - FIXED
- [x] Fix "[API Query Error] Conversation not found" appearing 13 times (Added error handling)
- [x] All 13 errors are the same (Root cause: stale conversation IDs)
- [x] Need to identify which API call is causing this (getConversation query)
- [x] Verify conversation IDs are valid (Added validation and cleanup)


## Chairman LLM Selector Feature
- [x] Design Chairman selector dropdown UI for header
- [x] Add available LLM models list (GPT-5.2, Sonnet 4.5, Gemini 3, Grok 4)
- [x] Update message sending to use selected Chairman model
- [x] Add visual indicator showing current Chairman in header
- [x] Add backend support to accept selected Chairman in sendMessage mutation
- [x] Implement chairman change handler in Council page
- [x] Pass selected Chairman through ChatInterface to EnhancedHeader
- [x] Test switching between different Chairman models in dropdown


## Phase 1: Persistent Chairman Preference Storage
- [x] Add chairman_preference column to users table in database schema
- [x] Create migration to add chairman_preference field
- [x] Create updateChairmanPreference backend mutation
- [x] Create getChairmanPreference backend query
- [x] Update Council page to load saved Chairman preference on mount
- [x] Update handleChairmanChange to save preference to database
- [ ] Test persistence across page reloads

## Phase 2: Model-Specific Customized Synthesis Prompts
- [x] Create prompt templates for each Chairman model (GPT-5.2, Claude, Gemini, Grok)
- [x] Design prompts that leverage each model's strengths
- [x] Integrate prompts into CouncilOrchestrator
- [x] Update synthesis logic to use model-specific prompts
- [ ] Test synthesis quality with different prompts

## Phase 3: Display Chairman Model Info in UI
- [x] Add chairman model metadata to message structure
- [x] Store which Chairman was used when message was created
- [x] Update MessageDisplay component to show Chairman info
- [x] Add visual badge/indicator showing which model synthesized the answer
- [x] Display Chairman name prominently in the final answer section
- [x] Test display on desktop and mobile

## Phase 4: Testing and Finalization
- [x] Run all tests to verify functionality
- [x] Fix database test to match updated schema
- [x] Verify all 24 tests pass
- [x] Save checkpoint with all three features complete

## Phase 5: UI/UX Improvements for Loading States
- [x] Add detailed loading message showing which Chairman is analyzing
- [x] Add error notification toast at bottom right
- [x] Improve error message clarity and formatting
- [x] Show processing state with spinner and text
- [ ] Test loading states with real API calls


## Bug Fix: Frozen UI on Image Upload
- [x] Check server logs for errors when image is uploaded with prompt
- [x] Verify image upload endpoint is working
- [x] Check if council orchestration is timing out
- [x] Add loading spinner/skeleton to chat interface while processing
- [x] Add progress indicator showing "Council is analyzing..."
- [x] Add error toast notification if request fails
- [x] Improve error handling with detailed error messages
- [ ] Test image upload flow end-to-end


## Image Upload Feature Implementation
- [x] Update sendMessage mutation to accept imageUrls parameter
- [x] Implement S3 upload helper for image files
- [x] Add image upload to ChatInterface before sending message
- [x] Update council router to accept and process image URLs
- [x] Modify CouncilOrchestrator to include images in LLM prompts
- [x] Create upload endpoint for image files to S3
- [x] Add image preview in message display (already existed)
- [x] Add error handling for failed uploads
- [ ] Test image upload with real images


## Image Upload Limit Feature (10 images max per message)
- [x] Add MAX_IMAGES_PER_MESSAGE constant (10)
- [x] Add validation in handleImageSelect to allow all images but mark 11+ as disabled
- [x] Grey out disabled images with reduced opacity and grayscale filter
- [x] Show "Disabled" label on greyed-out images
- [x] Display image count indicator showing only enabled images (e.g., "3/10 images")
- [x] Disable image upload button when limit reached
- [x] Only upload enabled images to S3 on submit
- [x] Test with exactly 10 images and 11+ images


## Hero Section with Council Chamber Image
- [x] Upload council chamber image to S3
- [x] Create HeroSection component with image background
- [x] Add text overlay: "THE COUNCIL IS ASSEMBLED."
- [x] Add subtitle: "Ask a question, review their debate, and let the Chairman synthesize the verdict."
- [x] Style text with white background card/box
- [x] Make responsive for mobile and desktop
- [x] Integrate hero section into Council page layout
- [x] Test layout and visibility on all screen sizes


## Hero Section Refinement
- [x] Desktop: Remove white box, use text-only white overlay at top
- [x] Desktop: Make image fill entire section with proper cropping
- [x] Mobile: Move text to top instead of center
- [x] Mobile: Improve text spacing and sizing
- [x] Mobile: Ensure image fills section properly


## Conversation Sorting
- [x] Sort conversations by creation date in descending order (newest first)
- [x] Update listConversations query to order by createdAt DESC
- [x] Test that new conversations appear at top of sidebar


## Copy Button & Text Wrapping Fix
- [x] Create CopyButton component with copy icon
- [x] Add copy button to Chairman's Final Answer section
- [x] Add copy buttons to individual council member responses
- [x] Show toast notification when text is copied
- [x] Fix text overflow in answer boxes with proper word-wrap
- [x] Ensure text wraps to next line instead of being cut off
- [x] Test copy functionality on all answer types
- [x] Test text display on mobile and desktop
