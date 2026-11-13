import type { Product, ProductTag } from '@/shared/types';
import type { DbCategory } from '../db';

const img = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const seedCategories: DbCategory[] = [
  { id: 'cat-small-plates', name: 'Small plates', slug: 'small-plates', kind: 'food', sortOrder: 1, description: 'To share while the grill heats up.' },
  { id: 'cat-grill', name: 'Charcoal grill', slug: 'charcoal-grill', kind: 'food', sortOrder: 2, description: 'Cooked over oak charcoal and served with warm bread.' },
  { id: 'cat-bowls', name: 'Bowls & greens', slug: 'bowls-and-greens', kind: 'food', sortOrder: 3, description: 'Big, bright and filling.' },
  { id: 'cat-burgers', name: 'Burgers & wraps', slug: 'burgers-and-wraps', kind: 'food', sortOrder: 4, description: 'Smashed, stacked and wrapped.' },
  { id: 'cat-oven', name: 'Pasta & oven', slug: 'pasta-and-oven', kind: 'food', sortOrder: 5, description: 'Fresh pasta and stone-oven pizza.' },
  { id: 'cat-sweets', name: 'Sweets', slug: 'sweets', kind: 'food', sortOrder: 6, description: 'Something to end on.' },
  { id: 'cat-coffee', name: 'Coffee', slug: 'coffee', kind: 'drink', sortOrder: 7, description: 'Espresso drinks and slow brews.' },
  { id: 'cat-cold', name: 'Fresh & cold', slug: 'fresh-and-cold', kind: 'drink', sortOrder: 8, description: 'Juices pressed to order, lemonades and coolers.' },
  { id: 'cat-tea', name: 'Tea & more', slug: 'tea-and-more', kind: 'drink', sortOrder: 9, description: 'Loose-leaf tea and milky classics.' },
];

type SeedProduct = [
  id: string,
  categoryId: string,
  name: string,
  price: number,
  photoId: string,
  description: string,
  tags?: ProductTag[],
  flags?: { featured?: boolean; unavailable?: boolean },
];

const rows: SeedProduct[] = [
  // Small plates
  ['p-chicken-bites', 'cat-small-plates', 'Crispy chicken bites', 185, '1608039755401-742074f0548d', 'Buttermilk-brined thigh pieces fried crisp, with garlic toum and pickled chili.', ['spicy'], { featured: true }],
  ['p-samosa', 'cat-small-plates', 'Samosa trio', 140, '1601050690597-df0568f70950', 'Three pastries filled with spiced potato and peas, with tamarind and mint chutneys.', ['vegetarian']],
  ['p-zaatar-fries', 'cat-small-plates', "Za'atar fries", 95, '1585109649139-366815a0d713', "Hand-cut fries tossed in za'atar and sea salt, with smoked paprika mayo.", ['vegetarian']],
  ['p-lentil-soup', 'cat-small-plates', 'Red lentil soup', 110, '1547592166-23ac45744acd', 'Slow-cooked lentils with cumin and lemon, topped with crispy onions.', ['vegetarian']],
  ['p-loaded-fries', 'cat-small-plates', 'Loaded fries', 165, '1573080496219-bb080dd4f877', 'Fries under melted cheddar, beef bacon bits, jalapeños and ranch.', ['spicy', 'new']],

  // Charcoal grill
  ['p-kofta', 'cat-grill', 'Charcoal kofta', 295, '1599487488170-d11ec9c172f0', 'Hand-minced beef and lamb with parsley and onion, grilled on skewers. Comes with bread, tahini and salad.', ['signature'], { featured: true }],
  ['p-mixed-grill', 'cat-grill', 'Mixed grill for two', 690, '1555939594-58d7cb561ad1', 'Kofta, shish tawook, lamb chops and grilled vegetables on one board, with rice, bread and dips.', ['signature'], { featured: true }],
  ['p-lemon-chicken', 'cat-grill', 'Lemon herb chicken', 325, '1598515214211-89d3c73ae83b', 'Half a chicken marinated overnight in lemon, garlic and thyme, with vermicelli rice.'],
  ['p-bbq-chicken', 'cat-grill', 'Smoky chicken thighs', 285, '1626074353765-517a681e40be', 'Boneless thighs in a smoked chili glaze, charred and finished with spring onion.', ['spicy']],
  ['p-ribeye', 'cat-grill', 'Ribeye steak', 640, '1600891964092-4316c288032e', 'A 300 g ribeye grilled to your liking, with peppercorn sauce and fries.'],
  ['p-salmon', 'cat-grill', 'Grilled salmon', 520, '1467003909585-2f8a72700288', 'Salmon fillet with herb butter, roasted potatoes and greens.', ['new']],

  // Bowls & greens
  ['p-power-bowl', 'cat-bowls', 'Sufra power bowl', 245, '1512621776951-a57141f2eefd', 'Quinoa, roasted sweet potato, chickpeas, avocado, pickled cabbage and tahini dressing.', ['vegetarian'], { featured: true }],
  ['p-fattoush', 'cat-bowls', 'Garden fattoush', 175, '1546069901-ba9599a7e63c', 'Crunchy greens, tomato, cucumber, radish and toasted pita with pomegranate molasses.', ['vegetarian']],
  ['p-caesar', 'cat-bowls', 'Chicken caesar', 230, '1546793665-c74683f339c1', 'Grilled chicken, romaine, parmesan and croutons in our anchovy-free caesar dressing.'],
  ['p-salmon-bowl', 'cat-bowls', 'Salmon rice bowl', 320, '1625944525533-473f1a3d54e7', 'Seared salmon on sushi rice with edamame, cucumber, mango and spicy mayo.', ['spicy']],
  ['p-curry-bowl', 'cat-bowls', 'Chicken curry bowl', 260, '1565557623262-b51c2513a641', 'Coconut chicken curry with basmati rice and fresh coriander.', ['spicy']],
  ['p-fried-rice', 'cat-bowls', 'Shrimp fried rice', 290, '1512058564366-18510be2db19', 'Wok-fried rice with shrimp, egg, peas and spring onion.'],

  // Burgers & wraps
  ['p-smash', 'cat-burgers', 'Sufra smash burger', 265, '1568901346375-23c9450c58cd', 'Two smashed beef patties, cheddar, caramelised onion, pickles and house sauce in a brioche bun.', ['signature'], { featured: true }],
  ['p-double-cheese', 'cat-burgers', 'Double cheese stack', 310, '1571091718767-18b5b1457add', 'Two patties, double American cheese, crispy onions and smoky mayo.'],
  ['p-chicken-burger', 'cat-burgers', 'Crispy chicken burger', 245, '1606755962773-d324e0a13086', 'Fried chicken thigh, slaw, pickles and hot honey.', ['spicy']],
  ['p-burger-fries', 'cat-burgers', 'Burger & fries', 325, '1551782450-a2132b4ba21d', 'The smash burger with a side of fries and a dip of your choice.'],
  ['p-shawarma-wrap', 'cat-burgers', 'Chicken shawarma wrap', 185, '1626700051175-6818013e1d4f', 'Spiced chicken, garlic toum, pickles and fries rolled in saj bread.'],
  ['p-beef-shawarma', 'cat-burgers', 'Beef shawarma plate', 295, '1529006557810-274b9b2fc783', 'Sliced beef shawarma over rice with tahini, onions and sumac.', ['new']],

  // Pasta & oven
  ['p-margherita', 'cat-oven', 'Margherita', 230, '1574071318508-1cdbab80d002', 'Tomato, fior di latte and basil on a blistered crust.', ['vegetarian'], { featured: true }],
  ['p-pepperoni', 'cat-oven', 'Beef pepperoni', 285, '1565299624946-b28f40a0ae38', 'Beef pepperoni, mozzarella and chili oil.', ['spicy']],
  ['p-chicken-penne', 'cat-oven', 'Creamy chicken penne', 265, '1551183053-bf91a1d81141', 'Penne in a parmesan cream sauce with grilled chicken and mushrooms.'],
  ['p-arrabbiata', 'cat-oven', 'Penne arrabbiata', 215, '1621996346565-e3dbc646d9a9', 'Tomato, garlic and chili, finished with parsley and pecorino.', ['vegetarian', 'spicy']],
  ['p-carbonara', 'cat-oven', 'Spaghetti carbonara', 275, '1612874742237-6526221588e3', 'Egg yolk, pecorino, black pepper and crispy beef bacon.'],

  // Sweets
  ['p-tiramisu', 'cat-sweets', 'Tiramisu', 165, '1571877227200-a0d98ea607e9', 'Espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa.', ['signature'], { featured: true }],
  ['p-fudge-cake', 'cat-sweets', 'Chocolate fudge cake', 175, '1578985545062-69928b1d9587', 'Three layers of dark chocolate sponge with fudge frosting.'],
  ['p-cheesecake', 'cat-sweets', 'Berry cheesecake', 170, '1565958011703-44f9829ba187', 'Baked vanilla cheesecake with a mixed berry compote.'],
  ['p-brownie', 'cat-sweets', 'Sea salt brownie', 120, '1606313564200-e75d5e30476c', 'Dense, fudgy and finished with flaky salt.'],
  ['p-waffle', 'cat-sweets', 'Strawberry waffle', 155, '1568051243851-f9b136146e97', 'Belgian waffle with fresh strawberries, cream and maple.', ['new']],

  // Coffee
  ['p-espresso', 'cat-coffee', 'Espresso', 70, '1514432324607-a09d9b4aefdd', 'A double shot of the house blend.'],
  ['p-flat-white', 'cat-coffee', 'Flat white', 105, '1541167760496-1628856ab772', 'Double ristretto with silky steamed milk.'],
  ['p-cappuccino', 'cat-coffee', 'Cappuccino', 100, '1572442388796-11668a67e53d', 'Espresso, steamed milk and a deep layer of foam.'],
  ['p-spanish-latte', 'cat-coffee', 'Spanish latte', 120, '1509042239860-f550ce710b93', 'Espresso over milk sweetened with condensed milk.', ['signature'], { featured: true }],
  ['p-iced-latte', 'cat-coffee', 'Iced latte', 115, '1461023058943-07fcbe16d735', 'Espresso poured over cold milk and ice.'],
  ['p-v60', 'cat-coffee', 'V60 pour-over', 130, '1497935586351-b67a49e012bf', "A slow filter brew of the week's single origin.", ['new']],

  // Fresh & cold
  ['p-orange', 'cat-cold', 'Fresh orange juice', 95, '1600271886742-f049cd451bba', 'Pressed to order. Nothing added.'],
  ['p-mango', 'cat-cold', 'Mango juice', 110, '1546173159-315724a31696', 'Thick, cold and made with ripe Egyptian mangoes.', ['signature'], { featured: true }],
  ['p-mint-lemonade', 'cat-cold', 'Mint lemonade', 85, '1621263764928-df1444c5e859', 'Lemon and fresh mint blended with ice.', [], { featured: true }],
  ['p-strawberry-lemonade', 'cat-cold', 'Strawberry lemonade', 100, '1497534446932-c925b458314e', 'Fresh strawberries and lemon over crushed ice.'],
  ['p-berry-smoothie', 'cat-cold', 'Berry smoothie', 135, '1553530666-ba11a7da3888', 'Mixed berries, banana and yoghurt.'],
  ['p-watermelon', 'cat-cold', 'Watermelon cooler', 105, '1527661591475-527312dd65f5', 'Watermelon, lime and mint. Back when watermelons are.', [], { unavailable: true }],
  ['p-sunset', 'cat-cold', 'Sunset spritz', 125, '1544145945-f90425340c7e', 'Passion fruit, orange and sparkling water with grenadine. Alcohol-free.'],
  ['p-peach-tea', 'cat-cold', 'Peach iced tea', 90, '1556679343-c7306c1976bc', 'Black tea brewed cold with peach and lemon.'],

  // Tea & more
  ['p-matcha', 'cat-tea', 'Matcha latte', 125, '1515823064-d6e0c04616a7', 'Stone-ground matcha whisked into steamed milk.'],
  ['p-mint-tea', 'cat-tea', 'Mint tea', 60, '1576092768241-dec231879fc3', 'Green tea steeped with a bunch of fresh mint.'],
  ['p-karak', 'cat-tea', 'Karak chai', 75, '1544787219-7f47ccb76574', 'Black tea simmered with cardamom, ginger and evaporated milk.', ['signature']],
];

export function createSeedProducts(now: Date): Product[] {
  const stamp = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  return rows.map(([id, categoryId, name, price, photoId, description, tags = [], flags = {}]) => ({
    id,
    categoryId,
    name,
    price,
    description,
    imageUrl: img(photoId),
    tags,
    isAvailable: !flags.unavailable,
    isFeatured: Boolean(flags.featured),
    createdAt: stamp,
    updatedAt: stamp,
  }));
}
