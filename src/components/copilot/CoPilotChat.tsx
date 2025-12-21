import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send, Calendar, MapPin, Plane, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  widget?: "calendar" | "airports" | "destinations";
  options?: { label: string; value: string; icon?: string }[];
  timestamp: Date;
}

interface CoPilotChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onWidgetSelect: (type: string, value: string) => void;
  isLoading?: boolean;
}

const CoPilotChat = ({ messages, onSendMessage, onWidgetSelect, isLoading }: CoPilotChatProps) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderWidget = (message: ChatMessage) => {
    if (message.widget === "calendar") {
      return (
        <div className="mt-3 bg-card/50 rounded-lg p-3 border border-border/50">
          <CalendarWidget
            mode="range"
            className="rounded-md"
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onWidgetSelect("dates", `${range.from.toISOString()},${range.to.toISOString()}`);
              }
            }}
          />
        </div>
      );
    }

    if (message.widget === "airports" || message.widget === "destinations") {
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.options?.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              className="bg-card/50 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all"
              onClick={() => onWidgetSelect(message.widget!, option.value)}
            >
              {option.icon && <span className="mr-1.5">{option.icon}</span>}
              {option.label}
            </Button>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Plane className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-montserrat font-bold text-foreground">
              {t("copilot.title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("copilot.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border/50 text-foreground rounded-bl-md shadow-sm"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                {renderWidget(message)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t("copilot.thinking")}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("copilot.inputPlaceholder")}
            className="flex-1 bg-background/80 border-border/50 focus:border-primary"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onSendMessage(t("copilot.quickDestination"))}
          >
            <MapPin className="w-3 h-3 mr-1" />
            {t("copilot.quickDestination")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onSendMessage(t("copilot.quickDates"))}
          >
            <Calendar className="w-3 h-3 mr-1" />
            {t("copilot.quickDates")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoPilotChat;
