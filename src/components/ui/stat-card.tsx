'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  description?: string;
  variant?: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'cyan';
  progress?: number; // 0-100 for progress bar
  sparkles?: boolean; // Add sparkles effect
  className?: string;
}

const variantStyles = {
  blue: {
    gradient: 'from-blue-500/15 via-blue-500/8 to-transparent',
    iconBg: 'bg-blue-500/12',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/15 hover:border-blue-500/30',
  },
  red: {
    gradient: 'from-red-500/15 via-red-500/8 to-transparent',
    iconBg: 'bg-red-500/12',
    iconColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-500/15 hover:border-red-500/30',
  },
  green: {
    gradient: 'from-emerald-500/15 via-emerald-500/8 to-transparent',
    iconBg: 'bg-emerald-500/12',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/15 hover:border-emerald-500/30',
  },
  purple: {
    gradient: 'from-violet-500/15 via-violet-500/8 to-transparent',
    iconBg: 'bg-violet-500/12',
    iconColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-500/15 hover:border-violet-500/30',
  },
  orange: {
    gradient: 'from-amber-500/15 via-amber-500/8 to-transparent',
    iconBg: 'bg-amber-500/12',
    iconColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/15 hover:border-amber-500/30',
  },
  cyan: {
    gradient: 'from-cyan-500/15 via-cyan-500/8 to-transparent',
    iconBg: 'bg-cyan-500/12',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-500/15 hover:border-cyan-500/30',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  variant = 'blue',
  progress,
  sparkles = false,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="elevated"
        className={cn(
          'relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl',
          styles.borderColor,
          className
        )}
      >
        {/* Gradient Background */}
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', styles.gradient)} />

        {/* Sparkles Effect */}
        {sparkles && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-4 right-4"
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </motion.div>
          </div>
        )}

        {/* Content */}
        <div className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div
              className={cn(
                'p-2.5 rounded-xl transition-transform duration-300 hover:scale-110',
                styles.iconBg
              )}
            >
              <Icon className={cn('h-5 w-5', styles.iconColor)} />
            </div>
          </CardHeader>
          <CardContent>
          <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {trend && (
          <Badge
          variant={
          trend.direction === 'up'
          ? 'default'
          : trend.direction === 'down'
          ? 'destructive'
          : 'secondary'
          }
          className="gap-1 text-xs"
          >
          {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
          {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
          {trend.value}
          </Badge>
          )}
          </div>

            {/* Progress Bar */}
            {progress !== undefined && (
              <div className="mt-3 space-y-1">
                <Progress value={progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground text-right">
                  {progress}% tamamlandı
                </p>
              </div>
            )}

            {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
