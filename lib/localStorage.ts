export const BASKET_STORAGE_KEY = 'basketItems';

export const getStoredBasketItems = () => {
  if (typeof window === 'undefined') return [];
  const savedItems = localStorage.getItem(BASKET_STORAGE_KEY);
  return savedItems ? JSON.parse(savedItems) : [];
};

export const setStoredBasketItems = (items: any[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
}; 