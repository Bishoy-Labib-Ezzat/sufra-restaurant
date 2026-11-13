import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from '@phosphor-icons/react';
import { isOpenNow } from '@/shared/config/restaurant';
import { photo } from '@/shared/lib/image';
import { cn } from '@/shared/lib/cn';
import { buttonStyles } from '@/shared/ui/button-styles';

const TABLE_SPREAD = 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0';
const JUICES = 'https://images.unsplash.com/photo-1497534446932-c925b458314e';
const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const open = isOpenNow();
  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease } };

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-12">
      <div className="flex flex-col items-start gap-7 lg:col-span-6">
        <motion.p
          {...rise(0)}
          className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold ring-1 ring-line"
        >
          <span className={cn('size-2 rounded-full', open ? 'bg-status-ready' : 'bg-status-done')} aria-hidden />
          {open ? 'Open now, kitchen closes at 1 AM' : 'Closed now, order ahead from 12 PM'}
        </motion.p>
        {/* Sized so "We'll bring the rest." always stays on one line: two lines in total. */}
        <motion.h1
          {...rise(0.08)}
          className="display text-[clamp(2.4rem,13.5vw,5rem)] leading-[0.98] lg:text-[clamp(3rem,calc(8vw-0.5rem),6rem)]"
        >
          Set the table.
          <span className="block text-tomato">We&rsquo;ll bring the rest.</span>
        </motion.h1>
        <motion.p {...rise(0.16)} className="max-w-[44ch] text-lg leading-relaxed text-ink-soft">
          Charcoal grills, big bowls, fresh juices and proper coffee from our Zamalek kitchen. Order online and we&rsquo;ll
          call to confirm.
        </motion.p>
        <motion.div {...rise(0.24)} className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to="/menu" className={buttonStyles({ size: 'lg', className: 'group' })}>
            Start your order
            <ArrowRight size={18} weight="bold" aria-hidden className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/track" className="text-[15px] font-semibold underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            Track an order
          </Link>
        </motion.div>
      </div>

      <div className="relative pb-10 lg:col-span-6 lg:pb-0">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease }}
          className="ml-auto aspect-[4/3] w-full overflow-hidden rounded-panel bg-paper-deep sm:w-[88%] lg:aspect-[5/6]"
        >
          <img
            src={photo(TABLE_SPREAD, 1100, 1300)}
            alt="A table covered with shared plates, salads and bread"
            fetchPriority="high"
            className="size-full object-cover"
          />
        </motion.div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 36, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: -5 }}
          transition={{ duration: 1, delay: 0.35, ease }}
          className="absolute bottom-0 left-0 aspect-square w-[40%] overflow-hidden rounded-panel bg-paper-deep shadow-float ring-8 ring-paper sm:w-[36%] lg:-bottom-6"
        >
          <img src={photo(JUICES, 520, 520)} alt="Glasses of fresh lemonade" className="size-full object-cover" />
        </motion.div>
      </div>
    </section>
  );
}
