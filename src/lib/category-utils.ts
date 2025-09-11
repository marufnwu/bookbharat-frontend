import { 
  BookOpen, 
  GraduationCap,
  Heart,
  Baby,
  Briefcase,
  Globe,
  Music,
  Palette,
  Brain,
  History,
  FlaskConical,
  Users,
  Zap,
  Sparkles,
  Gamepad2,
  Utensils,
  Camera,
  Plane,
  Trophy,
  Cpu,
  Newspaper,
  Drama,
  HeartHandshake,
  LucideIcon
} from 'lucide-react';

export const getCategoryIcon = (categoryName: string): LucideIcon => {
  const name = categoryName.toLowerCase();
  
  // Fiction & Literature
  if (name.includes('fiction') || name.includes('novel')) return BookOpen;
  if (name.includes('drama') || name.includes('play')) return Drama;
  
  // Academic & Education
  if (name.includes('academic') || name.includes('education') || name.includes('textbook')) return GraduationCap;
  if (name.includes('science') || name.includes('physics') || name.includes('chemistry')) return FlaskConical;
  if (name.includes('technology') || name.includes('computer') || name.includes('programming')) return Cpu;
  
  // Business & Career
  if (name.includes('business') || name.includes('finance') || name.includes('economics')) return Briefcase;
  
  // Personal Development
  if (name.includes('self-help') || name.includes('personal') || name.includes('motivation')) return Zap;
  if (name.includes('psychology') || name.includes('mind') || name.includes('mental')) return Brain;
  if (name.includes('health') || name.includes('wellness') || name.includes('fitness')) return Heart;
  
  // Children & Young Adults
  if (name.includes('children') || name.includes('kids') || name.includes('juvenile')) return Baby;
  if (name.includes('young adult') || name.includes('teen')) return Sparkles;
  
  // Culture & Society
  if (name.includes('history') || name.includes('historical')) return History;
  if (name.includes('travel') || name.includes('geography')) return Plane;
  if (name.includes('culture') || name.includes('social')) return Globe;
  if (name.includes('religion') || name.includes('spiritual') || name.includes('philosophy')) return Users;
  
  // Arts & Entertainment
  if (name.includes('art') || name.includes('craft') || name.includes('design')) return Palette;
  if (name.includes('music')) return Music;
  if (name.includes('photography')) return Camera;
  if (name.includes('game') || name.includes('gaming')) return Gamepad2;
  if (name.includes('sports')) return Trophy;
  
  // Lifestyle
  if (name.includes('cooking') || name.includes('food') || name.includes('recipe')) return Utensils;
  if (name.includes('romance') || name.includes('love')) return HeartHandshake;
  
  // News & Current Affairs
  if (name.includes('news') || name.includes('current') || name.includes('politics')) return Newspaper;
  
  return BookOpen; // default
};

export const getCategoryColor = (index: number): string => {
  const colors = [
    'text-blue-600',
    'text-emerald-600',
    'text-purple-600',
    'text-amber-600',
    'text-rose-600',
    'text-indigo-600',
    'text-teal-600',
    'text-orange-600',
    'text-cyan-600',
    'text-pink-600',
    'text-green-600',
    'text-violet-600',
    'text-red-600',
    'text-yellow-600',
    'text-sky-600',
    'text-lime-600',
    'text-fuchsia-600',
    'text-slate-600'
  ];
  return colors[index % colors.length];
};

export const getCategoryGradient = (index: number): string => {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-teal-500 to-green-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-cyan-500 to-blue-500',
    'from-violet-500 to-purple-500',
    'from-red-500 to-rose-500',
    'from-yellow-500 to-amber-500',
    'from-sky-500 to-blue-500',
    'from-lime-500 to-green-500',
    'from-fuchsia-500 to-pink-500',
    'from-slate-500 to-gray-500'
  ];
  return gradients[index % gradients.length];
};

export const getCategoryBgColor = (index: number): string => {
  const bgColors = [
    'bg-blue-50 hover:bg-blue-100',
    'bg-emerald-50 hover:bg-emerald-100',
    'bg-purple-50 hover:bg-purple-100',
    'bg-amber-50 hover:bg-amber-100',
    'bg-rose-50 hover:bg-rose-100',
    'bg-indigo-50 hover:bg-indigo-100',
    'bg-teal-50 hover:bg-teal-100',
    'bg-orange-50 hover:bg-orange-100',
    'bg-cyan-50 hover:bg-cyan-100',
    'bg-pink-50 hover:bg-pink-100',
    'bg-green-50 hover:bg-green-100',
    'bg-violet-50 hover:bg-violet-100',
    'bg-red-50 hover:bg-red-100',
    'bg-yellow-50 hover:bg-yellow-100',
    'bg-sky-50 hover:bg-sky-100',
    'bg-lime-50 hover:bg-lime-100',
    'bg-fuchsia-50 hover:bg-fuchsia-100',
    'bg-slate-50 hover:bg-slate-100'
  ];
  return bgColors[index % bgColors.length];
};