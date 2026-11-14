import { Link } from 'react-router';
import { ArrowUpLeft } from '@phosphor-icons/react';
import { t } from '@/shared/i18n';
import { photo } from '@/shared/lib/image';
import { cn } from '@/shared/lib/cn';

interface TileProps {
  to: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  tone: 'tomato' | 'forest';
}

function Tile({ to, title, description, image, imageAlt, tone }: TileProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative isolate flex min-h-[320px] flex-col justify-between overflow-hidden rounded-panel p-7 sm:min-h-[400px] sm:p-9',
        tone === 'tomato' ? 'bg-tomato text-white' : 'bg-forest text-paper',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="display text-[clamp(5rem,15vw,9.5rem)] leading-[1]">{title}</h2>
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/15 transition-colors duration-300 group-hover:bg-white group-hover:text-ink">
          <ArrowUpLeft size={22} weight="bold" aria-hidden />
        </span>
      </div>
      <p className="relative z-10 max-w-[15ch] text-lg leading-snug font-medium">{description}</p>
      <img
        src={photo(image, 700, 700)}
        alt={imageAlt}
        loading="lazy"
        className="absolute -end-16 -bottom-24 -z-10 size-[250px] rounded-full object-cover ring-[12px] ring-white/12 transition-transform duration-700 ease-out-expo group-hover:scale-105 group-hover:-rotate-[8deg] sm:size-[320px]"
      />
    </Link>
  );
}

export function EatDrinkTiles() {
  return (
    <section aria-label={t.shop.home.tiles.label} className="mx-auto grid grid-cols-1 max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-[1.3fr_1fr] lg:px-8">
      <Tile
        to="/menu?kind=food"
        title={t.shop.home.tiles.foodTitle}
        description={t.shop.home.tiles.foodBody}
        image="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0"
        imageAlt={t.shop.home.tiles.foodAlt}
        tone="tomato"
      />
      <Tile
        to="/menu?kind=drink"
        title={t.shop.home.tiles.drinkTitle}
        description={t.shop.home.tiles.drinkBody}
        image="https://images.unsplash.com/photo-1546173159-315724a31696"
        imageAlt={t.shop.home.tiles.drinkAlt}
        tone="forest"
      />
    </section>
  );
}
