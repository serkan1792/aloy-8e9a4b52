import { Agent } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AgentAvatarProps {
  agent: Agent | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function AgentAvatar({ agent, size = 'md', className }: AgentAvatarProps) {
  if (!agent) {
    return (
      <Avatar className={cn(sizeClasses[size], 'bg-muted', className)}>
        <AvatarFallback className="bg-muted text-muted-foreground">
          ?
        </AvatarFallback>
      </Avatar>
    );
  }

  const initials = getInitials(agent.name);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {agent.avatar && <AvatarImage src={agent.avatar} alt={agent.name} />}
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
