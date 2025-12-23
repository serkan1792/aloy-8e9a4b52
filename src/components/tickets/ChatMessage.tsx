import { Message } from '@/types';
import { agents, getAgentById } from '@/data/mockData';
import { AgentAvatar } from './AgentAvatar';
import { cn } from '@/lib/utils';
import { Mail, StickyNote } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ChatMessageProps {
  message: Message;
  showAuthor?: boolean;
}

const SlackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

// Render content with highlighted mentions
function renderContentWithMentions(content: string): React.ReactNode {
  const agentNames = agents.map(a => a.name);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Find all @mentions
  const mentionRegex = /@([A-Za-zÀ-ÿ]+\s[A-Za-zÀ-ÿ]+)/g;
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const mentionedName = match[1];
    const isValidAgent = agentNames.some(
      name => name.toLowerCase() === mentionedName.toLowerCase()
    );
    
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    
    // Add the mention (highlighted if valid agent)
    if (isValidAgent) {
      parts.push(
        <span
          key={match.index}
          className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium text-sm"
        >
          @{mentionedName}
        </span>
      );
    } else {
      parts.push(match[0]);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : content;
}

export function ChatMessage({ message, showAuthor = false }: ChatMessageProps) {
  const isAgent = message.senderType === 'Agent';
  const isInternal = message.messageType === 'internal';
  const author = message.authorId ? getAgentById(message.authorId) : undefined;

  if (isInternal) {
    return (
      <div className="flex gap-3 animate-fade-in">
        <AgentAvatar agent={author} size="sm" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">
              {author?.name || 'Agent'}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(message.timestamp, 'dd.MM. HH:mm', { locale: de })}
            </span>
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <StickyNote className="w-3 h-3" />
              Intern
            </span>
          </div>
          <div className="bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5">
            <p className="text-sm leading-relaxed text-foreground">
              {renderContentWithMentions(message.content)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-1 max-w-[80%] animate-fade-in',
        isAgent ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      <div
        className={cn(
          isAgent ? 'chat-bubble-agent' : 'chat-bubble-customer'
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-xs text-muted-foreground">
          {format(message.timestamp, 'HH:mm', { locale: de })}
        </span>
        <span className="text-muted-foreground">
          {message.channel === 'Slack' ? (
            <SlackIcon className="w-3 h-3" />
          ) : (
            <Mail className="w-3 h-3" />
          )}
        </span>
      </div>
    </div>
  );
}
