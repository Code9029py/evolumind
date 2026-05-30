import { Camera, Mail, MessageCircle, Share2 } from 'lucide-react';

export const fallbackContact = [
  {
    id: 'facebook',
    label: 'Facebook',
    value: 'EvoluMind Paraguay',
    href: 'https://facebook.com/',
    icon: Share2,
    tone: 'blue',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    value: '@evolumind.py',
    href: 'https://instagram.com/',
    icon: Camera,
    tone: 'coral',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    value: '+595 981 000 000',
    href: 'https://wa.me/595981000000',
    icon: MessageCircle,
    tone: 'mint',
  },
  {
    id: 'correo',
    label: 'Correo',
    value: 'contacto@evolumind.com',
    href: 'mailto:contacto@evolumind.com',
    icon: Mail,
    tone: 'night',
  },
];
