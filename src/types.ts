export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  phone: string;
  location: string;
  settings: {
    theme: 'light' | 'dark';
    primaryColor: string;
    currency: string;
  };
}

export interface Category {
  _id: string;
  name: string;
  order: number;
}

export interface Item {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  discount?: {
    amount: number;
    type: 'fixed' | 'percentage';
  };
}

export interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'new' | 'preparing' | 'completed' | 'cancelled';
  createdAt: string;
}
