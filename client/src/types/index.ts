// types/index.ts
export interface Service {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  type: 'followers' | 'likes' | 'comments' | 'views' | 'shares' | 'subscribers';
  description: string;
  icon: string;
  minQuantity: number;
  maxQuantity: number;
  basePrice: number; // price per 1000
  features: string[];
}

export interface Package {
  id: string;
  serviceId: string;
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  features: string[];
  deliveryTime: string;
  guarantee: string;
}

export interface CartItem {
  id: string;
  serviceId: string;
  packageId: string;
  quantity: number;
  price: number;
  customQuantity?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  username: string;
  platform: string;
  avatar: string;
  rating: number;
  comment: string;
  verified: boolean;
  beforeFollowers: number;
  afterFollowers: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'payment' | 'delivery' | 'quality';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  orders: Order[];
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  paymentMethod: string;
  billingInfo: BillingInfo;
}

export interface BillingInfo {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

export interface PlatformStats {
  totalClients: number;
  totalFollowersDelivered: number;
  averageRating: number;
  completionRate: number;
}

// types/cart.ts
export interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}

export interface CartContextType {
  cart: CartState;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

// types/services.ts
export interface ServiceCategory {
  platform: 'instagram' | 'tiktok' | 'youtube';
  name: string;
  icon: string;
  color: string;
  gradient: string;
  services: Service[];
}

// types/user.ts
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType {
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}