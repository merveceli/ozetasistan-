import { ChatInterface } from "@/components/ChatInterface";

export default function AssistantPage() {
    return (
        <div className="h-full p-6 bg-background">
            <div className="h-full max-w-5xl mx-auto flex flex-col">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 w-fit">Akademik Asistan</h1>
                    <p className="text-muted-foreground text-sm">Araştırmalarınızda size özel yapay zeka desteği.</p>
                </div>
                <div className="flex-1 min-h-0"> {/* min-h-0 is crucial for flex child scrolling */}
                    <ChatInterface />
                </div>
            </div>
        </div>
    );
}
