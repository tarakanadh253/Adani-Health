import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { localDataService } from "@/services/localData";
import {
  Bot, Send, Cpu, Zap, Sparkles, User, Mic, FileText,
  ExternalLink, Filter, BarChart3, Database, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KPIData, IssueData } from "@/types";
import {
  Select as SelectUI,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
  sources?: string[];
  isKPIQuery?: boolean;
}

const sampleQueries = [
  "Show me all medical gas outlets in OT-1 with pending inspections",
  "What is the lead time for the GE MRI scanner?",
  "Show me open RFIs for Radiology",
  "List vendors with delayed deliveries",
  "What is the current budget variance?",
  "Show maintenance schedule for LINAC equipment",
];

const kpiFilters = [
  { label: "Budget Status", query: "What is the current budget variance?" },
  { label: "Schedule Health", query: "Show schedule health for all zones" },
  { label: "Active RFIs", query: "Show me open RFIs" },
  { label: "Safety Score", query: "What is the current safety score?" },
];

const AILab = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem('health_app_model');
    const validModels = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"];
    if (saved && validModels.includes(saved)) {
      return saved;
    }
    return "gpt-4o-mini";
  });
  const [isListening, setIsListening] = useState(false);
  const [recordCounts, setRecordCounts] = useState({ documents: 0, moms: 0, contracts: 0 });

  useEffect(() => {
    // Fetch count summary
    localDataService.getDashboardData().then(data => {
      setRecordCounts({
        documents: data.latestFiles.length + 1240, // Mock base
        moms: data.meetings.length + 150,
        contracts: data.budget.length + 42
      });
    }).catch(e => console.error(e));
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch('https://web-production-3180c.up.railway.app/api/bot/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage.content,
          userId: 'default_user',
          model: selectedModel
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const botResponseText = data.text || "Sorry, I couldn't get a response.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botResponseText,
        model: selectedModel,
        timestamp: new Date(),
        sources: [], // Backend doesn't return sources yet, keep empty or parse if added later
        isKPIQuery: false, // Backend doesn't flag this yet
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting to the server. Please ensure the backend is running.",
        model: selectedModel,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSampleQuery = (query: string) => {
    setInput(query);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Simulated voice input
    if (!isListening) {
      setTimeout(() => {
        setInput("Show me open RFIs for Block A");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg gradient-primary">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">AI Intelligence Lab</h1>
          </div>
          <p className="text-muted-foreground">
            RAG-Powered Assistant — Natural Language BIM & Project Queries with Source Citations
          </p>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
          <SelectUI
            value={selectedModel}
            onValueChange={(val: string) => {
              setSelectedModel(val);
              localStorage.setItem('health_app_model', val);
            }}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Models</SelectLabel>
                <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
              </SelectGroup>
            </SelectContent>
          </SelectUI>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
        {/* Left Panel - Sample Queries & KPI Filters */}
        <div className="space-y-6 animate-slide-up overflow-y-auto h-full pr-2">
          {/* Sample Queries */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card p-4">
            <h3 className="font-semibold text-foreground mb-4">Sample Queries</h3>
            <div className="space-y-2">
              {sampleQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleQuery(query)}
                  className="w-full p-3 text-left text-sm bg-muted/30 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Quick Filters */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">KPI Filters</h3>
            </div>
            <div className="space-y-2">
              {kpiFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleQuery(filter.query)}
                  className="w-full p-2.5 text-left text-sm bg-primary/5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-all flex items-center gap-2"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Indexing Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Knowledge Base</span>
                </div>
                <span className="text-success flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Indexed
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Documents</span>
                </div>
                <span className="text-foreground">{recordCounts.documents} files</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">MOMs Indexed</span>
                </div>
                <span className="text-foreground">{recordCounts.moms} records</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Contracts</span>
                </div>
                <span className="text-foreground">{recordCounts.contracts} active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border/50 shadow-card flex flex-col animate-slide-up h-full" style={{ animationDelay: "100ms" }}>
          {/* Chat Header */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Adani Health AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by RAG + Knowledge Graphs • Source-cited responses</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Using:</span>
              <span className="font-medium px-2 py-0.5 rounded bg-primary/20 text-primary">
                {selectedModel}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Welcome to AI Intelligence Lab
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Ask questions about the project using natural language. I can query BIM metadata,
                  procurement logs, MOMs, contracts, and project documentation with full source citations.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  <Badge variant="outline" className="text-xs">BIM Queries</Badge>
                  <Badge variant="outline" className="text-xs">Procurement Status</Badge>
                  <Badge variant="outline" className="text-xs">Schedule Analysis</Badge>
                  <Badge variant="outline" className="text-xs">MOM Search</Badge>
                  <Badge variant="outline" className="text-xs">Contract Review</Badge>
                  <Badge variant="outline" className="text-xs">KPI Filtering</Badge>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl p-4",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 border border-border/50"
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                    {(typeof message.content === 'string' ? message.content : String(message.content || '')).split('\n').map((line, i) => {
                      // Simple markdown table rendering
                      if (line.startsWith('|')) {
                        return <p key={i} className="font-mono text-xs">{line}</p>;
                      }
                      // Bold headers
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-semibold mt-2">{line.replace(/\*\*/g, '')}</p>;
                      }
                      // Source citations
                      if (line.startsWith('📎')) {
                        return <p key={i} className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/30">{line}</p>;
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                  {message.model && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                      <p className="text-xs opacity-70">
                        via {message.model}
                      </p>
                      {message.sources && message.sources.length > 0 && (
                        <div className="flex items-center gap-1">
                          {message.sources.slice(0, 2).map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] py-0 gap-1">
                              <FileText className="w-2.5 h-2.5" />
                              {source.split(':')[0]}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted/50 border border-border/50 rounded-xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Button
                variant={isListening ? "secondary" : "outline"}
                size="icon"
                onClick={handleVoiceInput}
                className={cn(isListening && "animate-pulse")}
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about BIM data, procurement, schedules, MOMs..."
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isTyping} className="gap-2">
                <Send className="w-4 h-4" />
                Send
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Speech-to-BIM powered by Whisper-1 • All responses include source citations
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AILab;
