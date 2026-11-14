import type { DeliveryZone } from '@/shared/types';
import type { DbUser } from '../db';

/** Demo staff accounts. The login screen offers these while the mock backend is active. */
export const seedUsers: DbUser[] = [
  {
    id: 'u-nour',
    name: 'نور حسن',
    email: 'nour@sufra.test',
    password: 'sufra-admin',
    role: 'admin',
    title: 'المدير العام',
  },
  {
    id: 'u-karim',
    name: 'كريم عادل',
    email: 'karim@sufra.test',
    password: 'sufra-staff',
    role: 'staff',
    title: 'مشرف الوردية',
  },
];

export const seedZones: DeliveryZone[] = [
  { id: 'zamalek', name: 'الزمالك', fee: 25, etaMinutes: 35 },
  { id: 'garden-city', name: 'جاردن سيتي', fee: 30, etaMinutes: 40 },
  { id: 'downtown', name: 'وسط البلد', fee: 30, etaMinutes: 40 },
  { id: 'dokki', name: 'الدقي', fee: 30, etaMinutes: 40 },
  { id: 'agouza', name: 'العجوزة', fee: 30, etaMinutes: 40 },
  { id: 'mohandessin', name: 'المهندسين', fee: 35, etaMinutes: 45 },
  { id: 'maadi', name: 'المعادي', fee: 55, etaMinutes: 60 },
  { id: 'nasr-city', name: 'مدينة نصر', fee: 55, etaMinutes: 60 },
  { id: 'heliopolis', name: 'مصر الجديدة', fee: 60, etaMinutes: 65 },
  { id: 'new-cairo', name: 'القاهرة الجديدة', fee: 75, etaMinutes: 75 },
];

export const seedCustomers: [name: string, phone: string][] = [
  ['مريم فوزي', '01012873364'],
  ['عمر خالد', '01147720915'],
  ['سلمى نبيل', '01220486173'],
  ['يوسف طارق', '01553901248'],
  ['حبيبة سمير', '01093317540'],
  ['علي مصطفى', '01286654021'],
  ['فريدة هاني', '01118842697'],
  ['مصطفى عز', '01007751382'],
  ['ليلى عادل', '01563290817'],
  ['حسن رجب', '01234418905'],
  ['ندى إبراهيم', '01099203476'],
  ['ملك أيمن', '01151176638'],
  ['زياد حسام', '01206634719'],
  ['جنى وليد', '01028849153'],
  ['سيف عمرو', '01540097362'],
  ['رنا شريف', '01117703854'],
];

export const seedStreets = [
  '١٤ شارع حسن صبري',
  '٨ شارع إسماعيل محمد',
  '٣١ شارع ٩',
  '٢٢ شارع الجزيرة',
  '٥ شارع مصدق',
  '٤٧ شارع عباس العقاد',
  '١٢ شارع محمد مظهر',
  '١٩ شارع شهاب',
  '٣ شارع أبو الفدا',
  '٦٦ شارع جامعة الدول العربية',
];

export const seedAddressDetails = [
  'عمارة ١٤، الدور الثالث، شقة ٦',
  'الدور الخامس، شقة ١٢',
  'الدور الأرضي، البوابة الخضراء',
  'الدور الثاني، شقة ٤',
  'برج ب، الدور التاسع، شقة ٩٣',
];

export const seedLandmarks = ['بجوار الصيدلية', 'أمام المدرسة', 'فوق المخبز', '', '', ''];

export const seedNotes = [
  '',
  '',
  '',
  '',
  'من فضلك اتصل عندما تصل أسفل العمارة.',
  'البرجر بدون بصل من فضلك.',
  'طحينة زيادة على الجنب.',
  'الجرس لا يعمل، اتصل من فضلك.',
  'أدوات أكل لشخصين من فضلك.',
];
