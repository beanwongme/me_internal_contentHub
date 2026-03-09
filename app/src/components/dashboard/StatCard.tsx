import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  trend: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'percent';
  delay?: number;
}

function useCountUp(end: number, duration: number = 800, start: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
}

export function StatCard({ 
  label, 
  value, 
  trend, 
  icon: Icon, 
  prefix = '', 
  suffix = '',
  format = 'number',
  delay = 0 
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const animatedValue = useCountUp(value, 800, isVisible);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const formattedValue = format === 'percent' 
    ? `${animatedValue}%`
    : animatedValue.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
    >
      <Card className="bg-card border-border hover:border-primary/30 transition-colors duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {prefix}{formattedValue}{suffix}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {trend >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm text-success">+{trend}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-destructive">{trend}%</span>
                  </>
                )}
                <span className="text-sm text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
            <div className={cn(
              'p-3 rounded-lg',
              'bg-primary/10'
            )}>
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
