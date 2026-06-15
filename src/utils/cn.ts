type ClassValue = string | undefined | null | boolean | { [key: string]: boolean };

export function cn(...classes: ClassValue[]): string {
  return classes
    .flatMap(cls => {
      if (!cls) return [];
      if (typeof cls === 'string') return [cls];
      return Object.entries(cls)
        .filter(([, value]) => value)
        .map(([key]) => key);
    })
    .join(' ');
}
