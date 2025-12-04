import { AlertCircle, ExternalLink, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ConfigurationGuideProps {
  missingKeys?: string[];
}

export default function ConfigurationGuide({ missingKeys = ["OPENROUTER_API_KEY"] }: ConfigurationGuideProps) {
  const steps = [
    {
      number: 1,
      title: "Get OpenRouter API Key",
      description: "Visit OpenRouter to create an API key",
      action: "Visit OpenRouter",
      url: "https://openrouter.ai",
    },
    {
      number: 2,
      title: "Purchase Credits",
      description: "Make sure to purchase credits or enable automatic top-up on OpenRouter",
      action: "View Pricing",
      url: "https://openrouter.ai/credits",
    },
    {
      number: 3,
      title: "Add to Settings",
      description: "Go to Settings → Secrets and add your OPENROUTER_API_KEY",
      action: "Open Settings",
      url: "#settings",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription>
            The following environment variables are not configured: {missingKeys.join(", ")}
          </AlertDescription>
        </Alert>

        <Card className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Setup LLM Council</h1>
          <p className="text-muted-foreground mb-8">
            Follow these steps to configure your LLM Council with OpenRouter API access.
          </p>

          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                  <p className="text-muted-foreground mb-3">{step.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a href={step.url} target={step.url.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer">
                      {step.action}
                      {step.url.startsWith("http") && <ExternalLink className="w-4 h-4" />}
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <div className="flex gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <h4 className="font-semibold">After Configuration</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Once you've added the OPENROUTER_API_KEY to Settings → Secrets, refresh this page and you'll be ready to use LLM Council!
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-sm mb-2">Optional Configuration</h4>
            <p className="text-sm text-muted-foreground mb-2">
              You can customize which models participate in your council:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li><code className="bg-muted px-1 rounded">COUNCIL_MODELS</code>: Comma-separated model IDs</li>
              <li><code className="bg-muted px-1 rounded">CHAIRMAN_MODEL</code>: Model for final synthesis</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              See the README for available models and examples.
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Need help? Check the <a href="https://github.com/karpathy/llm-council" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">original LLM Council repository</a> for more information.</p>
        </div>
      </div>
    </div>
  );
}
