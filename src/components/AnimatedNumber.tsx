import { useCountUp } from '@/hooks/useCountUp';
import { formatCurrency } from '@/utils';
import { useEffect, useState } from 'react';

interface Props {
  amount: number;
  className?: string;
  prefix?: string;
}

export function AnimatedNumber({ amount, className, prefix }: Props) {
  const [mounted, setMounted] = useState(false);
  const value = useCountUp(amount, 900);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <span className={className}>
      {prefix}
      {mounted ? formatCurrency(value) : formatCurrency(0)}
    </span>
  );
}
