import { useState, useRef, useEffect, useCallback } from 'react';
import { Agent } from '@/types';
import { agents } from '@/data/mockData';
import { Textarea } from '@/components/ui/textarea';
import { AgentAvatar } from './AgentAvatar';
import { cn } from '@/lib/utils';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MentionInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  className,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);

    // Check for @ mentions
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's a space before the @, or it's at the start
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      
      if ((charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) && 
          !textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setMentionStart(lastAtIndex);
        setShowSuggestions(true);
        setSuggestionIndex(0);
        return;
      }
    }

    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStart(-1);
  };

  const insertMention = useCallback((agent: Agent) => {
    if (mentionStart === -1) return;

    const beforeMention = value.slice(0, mentionStart);
    const afterMention = value.slice(mentionStart + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${agent.name} ${afterMention}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStart(-1);

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStart + agent.name.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, mentionStart, mentionQuery, onChange]);

  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && filteredAgents.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex((prev) => 
          prev < filteredAgents.length - 1 ? prev + 1 : prev
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredAgents[suggestionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }

    onKeyDown?.(e);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDownInternal}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("min-h-[80px] resize-none", className)}
      />

      {showSuggestions && filteredAgents.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 mb-1 w-64 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
        >
          <div className="p-1.5 text-xs text-muted-foreground border-b border-border bg-muted/50">
            Kollegen erwähnen
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredAgents.map((agent, index) => (
              <button
                key={agent.id}
                type="button"
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted transition-colors",
                  index === suggestionIndex && "bg-muted"
                )}
                onClick={() => insertMention(agent)}
                onMouseEnter={() => setSuggestionIndex(index)}
              >
                <AgentAvatar agent={agent} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {agent.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {agent.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to extract mentioned agent names from a message
export function extractMentions(content: string): string[] {
  const mentionRegex = /@([A-Za-zÀ-ÿ]+\s[A-Za-zÀ-ÿ]+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

// Helper to check if a name is a valid agent
export function getMentionedAgents(content: string): Agent[] {
  const mentionedNames = extractMentions(content);
  return agents.filter((agent) =>
    mentionedNames.some((name) => 
      agent.name.toLowerCase() === name.toLowerCase()
    )
  );
}
