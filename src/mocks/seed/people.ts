import type { DeliveryZone } from '@/shared/types';
import type { DbUser } from '../db';

/** Demo staff accounts. The login screen offers these while the mock backend is active. */
export const seedUsers: DbUser[] = [
  {
    id: 'u-nour',
    name: 'Nour Hassan',
    email: 'nour@sufra.test',
    password: 'sufra-admin',
    role: 'admin',
    title: 'General manager',
  },
  {
    id: 'u-karim',
    name: 'Karim Adel',
    email: 'karim@sufra.test',
    password: 'sufra-staff',
    role: 'staff',
    title: 'Shift lead',
  },
];

export const seedZones: DeliveryZone[] = [
  { id: 'zamalek', name: 'Zamalek', fee: 25, etaMinutes: 35 },
  { id: 'garden-city', name: 'Garden City', fee: 30, etaMinutes: 40 },
  { id: 'downtown', name: 'Downtown', fee: 30, etaMinutes: 40 },
  { id: 'dokki', name: 'Dokki', fee: 30, etaMinutes: 40 },
  { id: 'agouza', name: 'Agouza', fee: 30, etaMinutes: 40 },
  { id: 'mohandessin', name: 'Mohandessin', fee: 35, etaMinutes: 45 },
  { id: 'maadi', name: 'Maadi', fee: 55, etaMinutes: 60 },
  { id: 'nasr-city', name: 'Nasr City', fee: 55, etaMinutes: 60 },
  { id: 'heliopolis', name: 'Heliopolis', fee: 60, etaMinutes: 65 },
  { id: 'new-cairo', name: 'New Cairo', fee: 75, etaMinutes: 75 },
];

export const seedCustomers: [name: string, phone: string][] = [
  ['Mariam Fawzy', '01012873364'],
  ['Omar Khaled', '01147720915'],
  ['Salma Nabil', '01220486173'],
  ['Youssef Tarek', '01553901248'],
  ['Habiba Samir', '01093317540'],
  ['Ali Mostafa', '01286654021'],
  ['Farida Hany', '01118842697'],
  ['Mostafa Ezz', '01007751382'],
  ['Laila Adel', '01563290817'],
  ['Hassan Ragab', '01234418905'],
  ['Nada Ibrahim', '01099203476'],
  ['Malak Ayman', '01151176638'],
  ['Ziad Hossam', '01206634719'],
  ['Jana Walid', '01028849153'],
  ['Seif Amr', '01540097362'],
  ['Rana Sherif', '01117703854'],
];

export const seedStreets = [
  '14 Hassan Sabry Street',
  '8 Ismail Mohamed Street',
  '31 Road 9',
  '22 El Gezira Street',
  '5 Mosadak Street',
  '47 Abbas El Akkad Street',
  '12 Mohamed Mazhar Street',
  '19 Shehab Street',
  '3 Abou El Feda Street',
  '66 Gameat El Dowal Street',
];

export const seedAddressDetails = [
  'Building 14, 3rd floor, apartment 6',
  'Floor 5, apartment 12',
  'Ground floor, green gate',
  'Floor 2, apartment 4',
  'Tower B, floor 9, apartment 93',
];

export const seedLandmarks = ['Next to the pharmacy', 'Opposite the school', 'Above the bakery', '', '', ''];

export const seedNotes = [
  '',
  '',
  '',
  '',
  'Please call when you are downstairs.',
  'No onions on the burger, please.',
  'Extra tahini on the side.',
  'The bell does not work, please call.',
  'Cutlery for two, please.',
];
