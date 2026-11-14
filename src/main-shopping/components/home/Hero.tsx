import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft } from '@phosphor-icons/react';
import { closesAtLabel, isOpenNow, opensAtLabel } from '@/shared/config/restaurant';
import { fill, t } from '@/shared/i18n';
import { photo } from '@/shared/lib/image';
import { cn } from '@/shared/lib/cn';
import { buttonStyles } from '@/shared/ui/button-styles';

const TABLE_SPREAD = 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0';
const JUICES = 'https://images.unsplash.com/photo-1497534446932-c925b458314e';
const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const open = isOpenNow();
  const copy = t.shop.home.hero;
  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease } };

  return (
    <section className="mx-auto grid grid-cols-1 max-w-7xl items-center gap-12 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-12">
      <div className="flex flex-col items-start gap-7 lg:col-span-6">
        <motion.p
          {...rise(0)}
          className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold ring-1 ring-line"
        >
          <span className={cn('size-2 rounded-full', open ? 'bg-status-ready' : 'bg-status-done')} aria-hidden />
          {open ? fill(copy.open, { time: closesAtLabel }) : fill(copy.closed, { time: opensAtLabel })}
        </motion.p>
        {/* Two lines in total: each half of the line stays whole. */}
        <motion.h1
          {...rise(0.08)}
          className="display text-[clamp(2.6rem,14vw,5.4rem)] leading-[1.15] lg:text-[clamp(3.2rem,calc(8vw-0.5rem),6.4rem)]"
        >
          {copy.titleLine1}
          <span className="block text-tomato">{copy.titleLine2}</span>
        </motion.h1>
        <motion.p {...rise(0.16)} className="max-w-[44ch] text-lg leading-relaxed text-ink-soft">
          {copy.body}
        </motion.p>
        <motion.div {...rise(0.24)} className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to="/menu" className={buttonStyles({ size: 'lg', className: 'group' })}>
            {copy.cta}
            <ArrowLeft size={18} weight="bold" aria-hidden className="transition-transform group-hover:-translate-x-1" />
          </Link>
          <Link to="/track" className="inline-flex min-h-11 items-center text-[15px] font-semibold underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            {copy.track}
          </Link>
        </motion.div>
      </div>

      <div className="relative pb-10 lg:col-span-6 lg:pb-0">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease }}
          className="ms-auto aspect-[4/3] w-full overflow-hidden rounded-panel bg-paper-deep sm:w-[88%] lg:aspect-[5/6]"
        >
          <img
            src={photo(TABLE_SPREAD, 1100, 1300)}
            alt={copy.tableAlt}
            fetchPriority="high"
            className="size-full object-cover"
          />
        </motion.div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 36, rotate: 10 }}
          animate={{ opacity: 1, y: 0, rotate: 5 }}
          transition={{ duration: 1, delay: 0.35, ease }}
          className="absolute bottom-0 start-0 aspect-square w-[40%] overflow-hidden rounded-panel bg-paper-deep shadow-float ring-8 ring-paper sm:w-[36%] lg:-bottom-6"
        >
          <img src={photo(JUICES, 520, 520)} alt={copy.juiceAlt} className="size-full object-cover" />
        </motion.div>
      </div>
    </section>
  );
}
