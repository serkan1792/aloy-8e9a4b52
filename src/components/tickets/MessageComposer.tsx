import { useState, useEffect } from 'react';
import { Channel } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MentionInput } from './MentionInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Send, Mail, StickyNote, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SendMode = 'external' | 'internal';

interface MessageComposerProps {
  defaultChannel: Channel;
  onSend: (content: string, channel: Channel, isInternal: boolean) => void;
  disabled?: boolean;
  activeTab: 'customer' | 'internal';
}

const SlackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

export function MessageComposer({ defaultChannel, onSend, disabled, activeTab }: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState<Channel>(defaultChannel);
  const [sendMode, setSendMode] = useState<SendMode>(activeTab === 'internal' ? 'internal' : 'external');

  // Sync sendMode with activeTab when it changes
  useEffect(() => {
    setSendMode(activeTab === 'internal' ? 'internal' : 'external');
  }, [activeTab]);

  const handleSend = (mode?: SendMode) => {
    const modeToUse = mode ?? sendMode;
    if (content.trim()) {
      onSend(content.trim(), channel, modeToUse === 'internal');
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isInternal = sendMode === 'internal';

  return (
    <div className={cn(
      "border-t p-4",
      isInternal ? "bg-amber-50/50 dark:bg-amber-950/20" : "bg-card"
    )}>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          {isInternal ? (
            <MentionInput
              value={content}
              onChange={setContent}
              onKeyDown={handleKeyDown}
              placeholder="Interne Notiz schreiben... (@ zum Erwähnen)"
              disabled={disabled}
              className="border-amber-300 dark:border-amber-700"
            />
          ) : (
            <Textarea
              placeholder="Nachricht schreiben..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="min-h-[80px] resize-none"
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          {!isInternal && (
            <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Slack">
                  <div className="flex items-center gap-2">
                    <SlackIcon className="w-4 h-4" />
                    <span>Slack</span>
                  </div>
                </SelectItem>
                <SelectItem value="Email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
          {isInternal && <div className="h-9" />}
          
          <div className="flex">
            <Button 
              onClick={() => handleSend()} 
              disabled={!content.trim() || disabled}
              className={cn(
                "rounded-r-none",
                isInternal && "bg-amber-600 hover:bg-amber-700"
              )}
            >
              {isInternal ? (
                <>
                  <StickyNote className="w-4 h-4 mr-2" />
                  Notiz
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Senden
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="default" 
                  size="icon"
                  className={cn(
                    "rounded-l-none border-l border-primary-foreground/20",
                    isInternal && "bg-amber-600 hover:bg-amber-700"
                  )}
                  disabled={disabled}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSendMode('external')}>
                  <Send className="w-4 h-4 mr-2" />
                  An Kunden senden
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSendMode('internal')}>
                  <StickyNote className="w-4 h-4 mr-2" />
                  Interne Notiz erstellen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
