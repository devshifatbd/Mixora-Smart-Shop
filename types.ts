export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  buyingPrice?: number; // New
  category: string;
  description: string;
  shortDescription?: string; // New
  
  image: string; // Main thumbnail
  images?: string[]; // Multiple images support
  videoUrl?: string; // New
  
  stock: boolean;
  stockQuantity?: number; // New
  sku?: string; // New
  productSerial?: string; // New
  unit?: string; // New (kg, pcs)
  
  weight?: string; // New
  dimensions?: { // New
    length: string;
    width: string;
    height: string;
  };
  
  features?: string[];
  
  warranty?: string; // New
  initialSold?: number; // New
  source?: string; // New (Self, Vendor)
  
  deliveryCharge?: { // New
    isDefault: boolean;
    amount?: number;
  };
  
  variants?: { // New
    name: string; // e.g. Size, Color
    options: string; // e.g. Red, Blue, XL
  }[];
  
  status: 'Active' | 'Inactive'; // New
  createdAt?: any;
}

export interface Category {
  id: string;
  name: string;
  icon: string; 
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: string; // To handle variant selection in cart
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  totalAmount: number;
  shippingCost: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  createdAt: any; 
}