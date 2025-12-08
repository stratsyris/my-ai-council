# LLM Council

![LLM Council](https://img.shields.io/badge/LLM-Council-blue)

The idea of this project is that instead of asking a question to your favorite LLM provider (e.g., OpenAI GPT, Google Gemini, Anthropic Claude, xAI Grok), you can group them into your "LLM Council". This is a web application that looks like a modern chat interface, but it uses OpenRouter to send your query to multiple LLMs. The models then review and rank each other's work, and finally a Chairman LLM produces the final response.

## How It Works

When you submit a query, the following three-stage process occurs:

### Stage 1: First Opinions
The user query is given to all LLMs individually, and the responses are collected. The individual responses are shown in a tab view, so you can inspect them all one by one.

### Stage 2: Review
Each individual LLM is given the responses of the other LLMs. Under the hood, the LLM identities are anonymized so that the LLM can't play favorites when judging their outputs. Each LLM is asked to rank the responses in accuracy and insight.

### Stage 3: Final Response
The designated Chairman of the LLM Council takes all of the model's responses and compiles them into a single final answer that is presented to the user.

## Features

- **Multi-LLM Collaboration**: Query multiple language models simultaneously
- **Peer Review System**: Models evaluate and rank each other's responses anonymously
- **Chairman Synthesis**: A designated model creates the final comprehensive answer
- **Conversation History**: All conversations are saved and can be revisited
- **Modern UI**: Clean, responsive interface with tab views for exploring individual responses
- **Markdown Support**: Full markdown rendering for rich text responses
- **User Authentication**: Secure login with Manus OAuth
- **Database Storage**: Persistent storage of conversations and messages

## Tech Stack

### Backend
- **Framework**: Node.js with TypeScript
- **API**: tRPC for type-safe API calls
- **Database**: MySQL with Drizzle ORM
- **LLM Integration**: OpenRouter API for accessing multiple LLMs

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for lightweight routing
- **Markdown**: react-markdown for rendering responses

## Setup

### Prerequisites
- Node.js 18+ and pnpm
- MySQL database
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd llm-council
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Set up the following environment variables in the Manus platform or your `.env` file:
   
   - `OPENROUTER_API_KEY`: Your OpenRouter API key (required)
     - Get it at [openrouter.ai](https://openrouter.ai)
     - Make sure to purchase credits or enable automatic top-up
   
   - `COUNCIL_MODELS` (optional): Comma-separated list of model IDs
     - Default: `openai/gpt-4o,google/gemini-2.0-flash-exp:free,anthropic/claude-3.5-sonnet,x-ai/grok-2-1212`
   
   - `CHAIRMAN_MODEL` (optional): Model ID for the chairman
     - Default: `google/gemini-2.0-flash-exp:free`

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open the application**
   
   Navigate to `http://localhost:3000` in your browser.

## Usage

1. **Create a Conversation**: Click the "New Conversation" button in the sidebar
2. **Ask a Question**: Type your question in the input field and press Enter or click Send
3. **Watch the Council Work**: The application will show progress through the three stages
4. **Review Results**: 
   - The final answer is displayed prominently at the top
   - Click through tabs to see individual model responses (Stage 1)
   - View peer reviews and rankings (Stage 2)
5. **Continue the Conversation**: Ask follow-up questions in the same conversation

## Configuration

### Customizing Council Models

You can customize which models participate in the council by setting the `COUNCIL_MODELS` environment variable:

```bash
COUNCIL_MODELS=openai/gpt-5.1,anthropic/claude-sonnet-4.5,google/gemini-3-pro,x-ai/grok-4
```

Default council members (latest top performers):
- OpenAI GPT-5.1
- Anthropic Claude Sonnet 4.5
- Google Gemini 3 Pro
- xAI Grok 4

### Changing the Chairman

Set a different model as the chairman who synthesizes the final answer:

```bash
CHAIRMAN_MODEL=google/gemini-3-pro
```

Default chairman: Google Gemini 3 Pro

### Available Models

Check [OpenRouter's model list](https://openrouter.ai/models) for all available models and their pricing.

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/services/database.test.ts
```

### Database Migrations

```bash
# Generate and apply migrations
pnpm db:push

# View database in Drizzle Studio
pnpm db:studio
```

## Project Structure

```
llm-council/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   │   └── council/ # Council-specific components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities and helpers
├── server/              # Backend Node.js application
│   ├── services/        # Business logic services
│   │   ├── openrouter.ts    # OpenRouter API client
│   │   ├── council.ts       # Council orchestration
│   │   └── database.ts      # Database operations
│   ├── routers/         # tRPC routers
│   └── _core/           # Core server functionality
├── drizzle/             # Database schema and migrations
└── README.md
```

## Credits

This project is inspired by [Andrej Karpathy's LLM Council](https://github.com/karpathy/llm-council), reimagined as a full-stack web application with modern tooling and persistent storage.

## License

MIT
