"use client"

import { useState } from "react";
import { Bot, Mic, Send, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { chatWithAiAssistant } from "@/ai/flows/chat-with-ai-assistant";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

export default function AiAssistantWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithAiAssistant({ message: input });
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: response.response, sender: "ai" };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I'm having trouble connecting. Please try again later.", sender: "ai" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg" size="icon">
          <Bot className="h-8 w-8" />
          <span className="sr-only">Open AI Assistant</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="font-headline flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Assistant
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 border-2 border-primary">
                    <AvatarFallback>
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-xs rounded-lg p-3 text-sm",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {message.text}
                </div>
                 {message.sender === "user" && user && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>
                      <UserIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarFallback>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-xs rounded-lg p-3 text-sm bg-muted text-muted-foreground">
                       Thinking...
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="relative">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="pr-20"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
                <Button variant="ghost" size="icon" disabled={isLoading}>
                    <Mic className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSend} disabled={isLoading}>
                    <Send className="h-5 w-5" />
                </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
