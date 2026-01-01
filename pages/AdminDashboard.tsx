import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy, Timestamp, where, setDoc } from 'firebase/firestore';
import { Product, Order, Coupon, CartItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  Package, ShoppingBag, Trash2, LogOut, Loader2, 
  Home, AlertCircle, Link as LinkIcon, Image as ImageIcon, Plus, 
  Edit, Copy, Save, X, CheckSquare, Square, Eye, Search,
  Users, ChevronLeft, ChevronRight, Calendar, Truck, FileText, Printer, Store,
  Menu as MenuIcon, LayoutDashboard, BarChart3, TrendingUp, DollarSign, Activity,
  Ticket, Download, Filter, UploadCloud, Video, XCircle, Ban, Minus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { categoriesList } from '../data';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'coupons'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // --- Report State ---
  const [reportMonth, setReportMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // --- Product Management State ---
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Data State
  const initialFormState: Partial<Product> = {
    name: '',
    shortDescription: '',
    description: '',
    category: categoriesList[0],
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    image: '',
    images: [],
    videoUrl: '',
    videoUrls: [], // New for multiple videos
    status: 'Active',
    price: 0,
    originalPrice: 0,
    buyingPrice: 0,
    productSerial: '',
    sku: '',
    unit: 'pcs',
    stockQuantity: 0,
    warranty: '',
    initialSold: 0,
    source: 'Self',
    deliveryCharge: { isDefault: true, amount: 0 },
    variants: [],
    stock: true,
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);

  // --- Order Management State ---
  const [orderFilter, setOrderFilter] = useState('All Orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); 
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  // --- Order Edit/Create Data ---
  const initialOrderState: Partial<Order> = {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      items: [],
      shippingCost: 70, // Default
      discount: 0,
      totalAmount: 0,
      status: 'Pending',
      paymentMethod: 'cod',
      createdAt: null
  };
  const [editOrderData, setEditOrderData] = useState<Partial<Order>>(initialOrderState);
  const [productToAdd, setProductToAdd] = useState<string>(''); // For adding products to order

  // --- Coupon State ---
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
      code: '', discountType: 'fixed', discountAmount: 0, minOrderAmount: 0, status: 'active', usageCount: 0
  });

  useEffect(() => {
    if (!isAdmin && auth.currentUser) {
      navigate('/login');
      return;
    } else if (!auth.currentUser) {
       navigate('/login');
       return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const productSnapshot = await getDocs(collection(db, 'products'));
      const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productList);

      const orderQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const orderSnapshot = await getDocs(orderQuery);
      const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(orderList);

      const couponSnapshot = await getDocs(collection(db, 'coupons'));
      const couponList = couponSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
      setCoupons(couponList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
  const isSameMonth = (d1: Date, d2: Date) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const calculateStats = () => {
      const today = new Date(); 
      const dailyOrders = orders.filter(o => o.createdAt && isSameDay(o.createdAt.toDate(), today));
      const monthOrders = orders.filter(o => o.createdAt && isSameMonth(o.createdAt.toDate(), today));
      
      return {
          today: {
              sales: dailyOrders.reduce((acc, o) => acc + o.totalAmount, 0),
              count: dailyOrders.length,
              pendingAmount: dailyOrders.filter(o => o.status === 'Pending').reduce((acc, o) => acc + o.totalAmount, 0),
              deliveryAmount: dailyOrders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + o.totalAmount, 0),
              pending: dailyOrders.filter(o => o.status === 'Pending').length,
              delivered: dailyOrders.filter(o => o.status === 'Delivered').length,
              canceled: dailyOrders.filter(o => o.status === 'Cancelled' || o.status === 'Order Canceled').length,
          },
          month: {
              sales: monthOrders.reduce((acc, o) => acc + o.totalAmount, 0),
              count: monthOrders.length,
              orders: monthOrders 
          }
      };
  };

  const stats = calculateStats();

  const generateMonthlyReport = () => {
     // ... (Existing Report Logic)
  };

  const getTopSellingProducts = () => {
     // ... (Existing Logic)
      const productCounts: Record<string, { name: string; count: number; image: string; price: number }> = {};
      orders.forEach(order => {
          if (order.status !== 'Cancelled' && order.status !== 'Order Canceled') {
              order.items.forEach(item => {
                  if (productCounts[item.id]) {
                      productCounts[item.id].count += item.quantity;
                  } else {
                      productCounts[item.id] = { name: item.name, count: item.quantity, image: item.image, price: item.price };
                  }
              });
          }
      });
      return Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  };

  const topSelling = getTopSellingProducts();

  const getCustomers = () => {
      const customerMap: Record<string, any> = {};
      orders.forEach(order => {
          if(!customerMap[order.customerPhone]) {
              customerMap[order.customerPhone] = { name: order.customerName, phone: order.customerPhone, address: order.customerAddress, totalSales: 0, orders: [], delivered: 0, canceled: 0, pending: 0 };
          }
          customerMap[order.customerPhone].totalSales += order.totalAmount;
          customerMap[order.customerPhone].orders.push(order);
      });
      return Object.values(customerMap);
  };
  const customers = getCustomers();

  // Coupon Logic
  const handleCreateCoupon = async () => {
      if(!newCoupon.code || !newCoupon.discountAmount) return alert("Please fill code and amount");
      await addDoc(collection(db, 'coupons'), newCoupon);
      setNewCoupon({ code: '', discountType: 'fixed', discountAmount: 0, minOrderAmount: 0, status: 'active', usageCount: 0 });
      fetchData();
  };

  const handleDeleteCoupon = async (id: string) => {
      if(confirm('Delete this coupon?')) {
          await deleteDoc(doc(db, 'coupons', id));
          fetchData();
      }
  };

  const handleEdit = (product: Product) => {
    setFormData({ 
        ...product, 
        dimensions: product.dimensions || { length: '', width: '', height: '' }, 
        deliveryCharge: product.deliveryCharge || { isDefault: true, amount: 0 }, 
        variants: product.variants || [],
        videoUrl: product.videoUrl || '',
        videoUrls: product.videoUrls || []
    });
    setEditingId(product.id);
    setFormMode('edit');
    setViewMode('form');
    setIsSidebarOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিত যে আপনি এই পণ্যটি মুছে ফেলতে চান?")) {
        await deleteDoc(doc(db, 'products', id));
        fetchData();
    }
  };

  // --- CLIENT SIDE IMAGE COMPRESSION & BASE64 (No Backend Required) ---
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800; // Limit width
          const MAX_HEIGHT = 800; // Limit height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              // Compress to 70% quality JPEG to save DB space
              resolve(canvas.toDataURL('image/jpeg', 0.7)); 
          } else {
              reject(new Error("Canvas context is null"));
          }
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      const newImages = [...(formData.images || [])];
      
      try {
          for (let i = 0; i < files.length; i++) {
              const file = files[i];
              // Convert to compressed Base64
              const base64 = await resizeImage(file);
              
              newImages.push(base64);
              // Set first image as main image if not set
              if (!formData.image && i === 0) {
                  setFormData(prev => ({ ...prev, image: base64 }));
              }
          }
          setFormData(prev => ({ ...prev, images: newImages }));
      } catch (error) {
          console.error("Image processing error", error);
          alert("ছবি প্রসেস করতে সমস্যা হয়েছে। অন্য ছবি চেষ্টা করুন।");
      }
      setUploading(false);
  };

  const handleSaveProduct = async () => {
      if (!formData.name || !formData.price) {
          setStatusMessage({ type: 'error', text: 'পণ্যের নাম এবং বিক্রয় মূল্য আবশ্যক।' });
          return;
      }
      setUploading(true);
      try {
          const payload = { 
              ...formData, 
              price: Number(formData.price), 
              originalPrice: Number(formData.originalPrice || 0), 
              buyingPrice: Number(formData.buyingPrice || 0), 
              stockQuantity: Number(formData.stockQuantity || 0), 
              initialSold: Number(formData.initialSold || 0), 
              updatedAt: new Date(), 
              stock: (formData.stockQuantity || 0) > 0 
          };
          if (formMode === 'edit' && editingId) {
              await updateDoc(doc(db, 'products', editingId), payload);
              setStatusMessage({ type: 'success', text: 'পণ্য সফলভাবে আপডেট করা হয়েছে!' });
          } else {
              await addDoc(collection(db, 'products'), { ...payload, createdAt: new Date() });
              setStatusMessage({ type: 'success', text: 'নতুন পণ্য সফলভাবে যোগ করা হয়েছে!' });
          }
          setTimeout(() => { setViewMode('list'); setFormData(initialFormState); setStatusMessage(null); fetchData(); }, 1000);
      } catch (error: any) { setStatusMessage({ type: 'error', text: error.message }); }
      setUploading(false);
  };

  const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- ADVANCED ORDER MANAGEMENT ---
  const generateOrderId = async () => {
    const now = new Date();
    const datePrefix = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    let newSequence = Math.floor(Math.random() * 90 + 10).toString();
    return `${datePrefix}${newSequence}`;
  };

  const openEditOrder = (order: Order) => {
      setEditOrderData({ ...order });
      setIsCreatingOrder(false);
      setIsOrderModalOpen(true);
  };

  const openCreateOrder = () => {
      setEditOrderData(initialOrderState);
      setIsCreatingOrder(true);
      setIsOrderModalOpen(true);
  };

  const handleAddProductToOrder = () => {
      if (!productToAdd) return;
      const product = products.find(p => p.id === productToAdd);
      if (product) {
          const existingItemIndex = editOrderData.items?.findIndex(i => i.id === product.id);
          let newItems = [...(editOrderData.items || [])];
          
          if (existingItemIndex !== undefined && existingItemIndex > -1) {
              newItems[existingItemIndex].quantity += 1;
          } else {
              newItems.push({ ...product, quantity: 1 });
          }
          setEditOrderData({ ...editOrderData, items: newItems });
          setProductToAdd('');
      }
  };

  const handleRemoveItemFromOrder = (index: number) => {
      const newItems = [...(editOrderData.items || [])];
      newItems.splice(index, 1);
      setEditOrderData({ ...editOrderData, items: newItems });
  };

  const handleUpdateItemQuantity = (index: number, delta: number) => {
      const newItems = [...(editOrderData.items || [])];
      newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
      setEditOrderData({ ...editOrderData, items: newItems });
  };

  const saveOrder = async () => {
      if (!editOrderData.customerName || !editOrderData.customerPhone || !editOrderData.items || editOrderData.items.length === 0) {
          alert('অনুগ্রহ করে কাস্টমারের নাম, ফোন এবং অন্তত একটি পণ্য যোগ করুন।');
          return;
      }

      const subtotal = editOrderData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const total = subtotal + (editOrderData.shippingCost || 0) - (editOrderData.discount || 0);
      
      const payload = {
          ...editOrderData,
          totalAmount: total,
          subTotal: subtotal
      };

      try {
          if (isCreatingOrder) {
              const newId = await generateOrderId();
              await setDoc(doc(db, 'orders', newId), { ...payload, id: newId, createdAt: Timestamp.now() });
              alert('অর্ডার সফলভাবে তৈরি হয়েছে!');
          } else {
              if (editOrderData.id) {
                 await updateDoc(doc(db, 'orders', editOrderData.id), payload);
                 alert('অর্ডার আপডেট হয়েছে!');
              }
          }
          setIsOrderModalOpen(false);
          fetchData();
      } catch (error) {
          console.error(error);
          alert('সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
  };

  const handlePrintInvoice = (order: Order) => {
      // ... (Existing Invoice Logic)
      const discount = (order as any).discount || 0;
      const subTotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const printWindow = window.open('', '', 'width=900,height=900');
      if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Invoice #${order.id}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
                <style>
                  body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; -webkit-print-color-adjust: exact; }
                  .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
                  .logo { font-size: 28px; font-weight: 900; color: #111; letter-spacing: -1px; }
                  .invoice-title { font-size: 40px; font-weight: 900; color: #e5e7eb; text-transform: uppercase; line-height: 1; }
                  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                  .box p { margin: 4px 0; font-size: 14px; color: #4b5563; }
                  .box strong { color: #111; display: block; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                  th { text-align: left; padding: 12px; background: #f9fafb; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; color: #6b7280; }
                  td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
                  .total-section { display: flex; justify-content: flex-end; }
                  .total-box { width: 300px; }
                  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e5e7eb; }
                  .row.final { border-bottom: none; border-top: 2px solid #111; font-size: 18px; font-weight: 900; padding-top: 15px; margin-top: 10px; }
                  .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px; }
                  .badge { display: inline-block; padding: 4px 12px; border-radius: 99px; background: #f3f4f6; font-size: 10px; font-weight: bold; text-transform: uppercase; }
                </style>
              </head>
              <body>
                <div class="header">
                   <div>
                      <div class="logo">Mixora Smart Shop</div>
                      <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">Uttara Sector 7, Dhaka - 1230</p>
                      <p style="font-size: 12px; color: #6b7280;">Hotline: 01711-728660</p>
                   </div>
                   <div style="text-align: right;">
                      <div class="invoice-title">Invoice</div>
                      <p style="font-weight: bold; font-size: 16px;">#${order.id}</p>
                      <span class="badge">${order.status}</span>
                   </div>
                </div>

                <div class="grid">
                   <div class="box">
                      <strong>Bill To:</strong>
                      <p style="font-size: 16px; font-weight: bold; color: #111;">${order.customerName}</p>
                      <p>${order.customerPhone}</p>
                      <p>${order.customerAddress}</p>
                   </div>
                   <div class="box" style="text-align: right;">
                      <strong>Order Info:</strong>
                      <p>Date: ${order.createdAt ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
                      <p>Payment: <span style="text-transform: uppercase;">${order.paymentMethod}</span></p>
                   </div>
                </div>

                <table>
                   <thead>
                      <tr>
                        <th style="width: 50%;">Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Total</th>
                      </tr>
                   </thead>
                   <tbody>
                      ${order.items.map(item => `
                        <tr>
                           <td>
                              <span style="font-weight: 600; color: #111;">${item.name}</span>
                              <div style="font-size: 11px; color: #9ca3af;">SKU: ${item.sku || 'N/A'}</div>
                           </td>
                           <td style="text-align: center;">${item.quantity}</td>
                           <td style="text-align: right;">৳${item.price}</td>
                           <td style="text-align: right; font-weight: bold;">৳${item.price * item.quantity}</td>
                        </tr>
                      `).join('')}
                   </tbody>
                </table>

                <div class="total-section">
                   <div class="total-box">
                      <div class="row"><span>Subtotal</span><span>৳${subTotal}</span></div>
                      <div class="row"><span>Shipping</span><span>৳${order.shippingCost}</span></div>
                      ${discount > 0 ? `<div class="row" style="color: red;"><span>Discount</span><span>- ৳${discount}</span></div>` : ''}
                      <div class="row final"><span>Total</span><span>৳${order.totalAmount}</span></div>
                   </div>
                </div>

                <div class="footer">
                   <p>Thank you for shopping with Mixora Smart Shop!</p>
                   <p>For any queries, please contact our support.</p>
                </div>

                <script>window.print();</script>
              </body>
            </html>
          `);
          printWindow.document.close();
      }
  };

  const filteredOrders = orders.filter(order => {
      const matchStatus = orderFilter === 'All Orders' || order.status === orderFilter;
      const matchSearch = order.id.includes(orderSearch) || order.customerPhone.includes(orderSearch) || order.customerName.toLowerCase().includes(orderSearch.toLowerCase());
      return matchStatus && matchSearch;
  });

  const orderStatuses = ['All Orders', 'Pending', 'Order Placed', 'Order Confirmed', 'Order Shipped', 'Delivered', 'Order Completed', 'Order Canceled', 'Order Returned', 'Cancelled'];

  const NavItem = ({ id, label, icon: Icon, active }: { id: typeof activeTab; label: string; icon: any; active: boolean }) => (
    <button
      onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
      className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group relative mb-2 ${active ? 'bg-gradient-to-r from-primary to-gray-900 text-white shadow-lg shadow-gray-300 transform scale-105' : 'text-gray-500 hover:bg-gray-50 hover:text-primary hover:shadow-sm'}`}
    >
      <Icon className={`h-5 w-5 ${!isSidebarCollapsed || isSidebarOpen ? 'mr-3' : ''}`} />
      {(!isSidebarCollapsed || isSidebarOpen) && <span className="font-bold text-sm tracking-wide">{label}</span>}
    </button>
  );

  return (
    <div className="h-screen bg-[#F0F2F5] flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* --- SIDEBAR BACKDROP (Mobile) --- */}
      <div className={`
        fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden
        ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
      `} onClick={() => setIsSidebarOpen(false)}></div>

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-[80] bg-white shadow-2xl md:shadow-none transition-transform duration-300 flex flex-col border-r border-gray-100 h-full
        ${isSidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-0'}
        md:translate-x-0 ${isSidebarCollapsed ? 'md:w-24' : 'md:w-[280px]'}
      `}>
         {/* Sidebar Header */}
          <div className="hidden md:flex p-6 items-center justify-between h-[80px] shrink-0">
           {(!isSidebarCollapsed || isSidebarOpen) && (
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-br from-primary to-gray-800 rounded-xl flex items-center justify-center shadow-md">
                  <BarChart3 className="text-white h-5 w-5" />
               </div>
               <div>
                   <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mixora</h1>
                   <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">Dashboard</p>
               </div>
             </div>
           )}
           <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition shadow-sm">
             {isSidebarCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
           </button>
        </div>
        
        <div className="md:hidden p-4 flex justify-end shrink-0">
            <button onClick={() => setIsSidebarOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-600"><X size={20}/></button>
        </div>
        
        {/* Sidebar Nav Items - Scrollable */}
        <nav className="p-5 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
          <NavItem id="overview" label="ড্যাশবোর্ড" icon={LayoutDashboard} active={activeTab === 'overview'} />
          <NavItem id="products" label="পণ্যসমূহ" icon={Package} active={activeTab === 'products'} />
          <NavItem id="orders" label="অর্ডার লিস্ট" icon={ShoppingBag} active={activeTab === 'orders'} />
          <NavItem id="coupons" label="কুপন ম্যানেজমেন্ট" icon={Ticket} active={activeTab === 'coupons'} />
          <NavItem id="customers" label="কাস্টমার" icon={Users} active={activeTab === 'customers'} />
          
          <div className="pt-6 mt-6 border-t border-gray-100">
             <button onClick={() => navigate('/')} className="w-full flex items-center px-4 py-3.5 rounded-2xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition font-bold group">
                <Store className={`h-5 w-5 group-hover:scale-110 transition ${!isSidebarCollapsed || isSidebarOpen ? 'mr-3' : ''}`} />
                {(!isSidebarCollapsed || isSidebarOpen) && <span className="text-sm">শপ ভিজিট</span>}
             </button>
          </div>
        </nav>

        {/* Sidebar Footer - Fixed at Bottom */}
        <div className="p-5 border-t border-gray-100 shrink-0 bg-white">
            <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center px-4 py-4 rounded-2xl text-white bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-lg hover:shadow-red-200 transition-all font-bold text-sm shadow-md">
                <LogOut className={`h-5 w-5 ${!isSidebarCollapsed || isSidebarOpen ? 'mr-3' : ''}`} />
                {(!isSidebarCollapsed || isSidebarOpen) && <span>লগ আউট</span>}
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-24 md:pb-8 bg-[#F0F2F5] relative z-0">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          // ... (Overview content same as before) ...
           <div className="space-y-8 animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">হ্যালো, অ্যাডমিন 👋</h2>
                    <p className="text-gray-500 font-medium mt-1">আজকের ব্যবসার আপডেট দেখে নিন</p>
                </div>
                <div className="flex gap-2 items-center">
                    {/* ... report logic ... */}
                    <button onClick={generateMonthlyReport} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-md">
                        <Download size={18} /> ডাউনলোড রিপোর্ট
                    </button>
                </div>
             </div>
             
             {/* Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                 {/* ... (Existing Stat Cards) ... */}
                  <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-[2rem] shadow-xl shadow-purple-200 text-white relative overflow-hidden group hover:-translate-y-1 transition duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-125 transition-transform duration-500"><BarChart3 size={70} /></div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner"><DollarSign className="h-6 w-6 text-white" /></div>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">মোট সেল (আজকে)</p>
                        <h3 className="text-4xl font-black tracking-tight">৳{stats.today.sales.toLocaleString()}</h3>
                        <div className="mt-2 text-xs opacity-80 font-bold">এই মাসে: ৳{stats.month.sales.toLocaleString()}</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-400 to-cyan-600 p-6 rounded-[2rem] shadow-xl shadow-cyan-200 text-white relative overflow-hidden group hover:-translate-y-1 transition duration-300">
                    <div className="absolute -right-5 -bottom-5 opacity-20 transform group-hover:rotate-12 transition-transform duration-500"><ShoppingBag size={100} /></div>
                    <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner"><Package className="h-6 w-6 text-white" /></div>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">অর্ডার (আজকে)</p>
                    <h3 className="text-4xl font-black">{stats.today.count} <span className="text-lg font-medium opacity-80">টি</span></h3>
                    <div className="flex gap-2 mt-4">
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-sm flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div> পেন্ডিং: {stats.today.pending}</span>
                    </div>
                </div>

                 <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-6 rounded-[2rem] shadow-xl shadow-green-200 text-white relative overflow-hidden group hover:-translate-y-1 transition duration-300">
                    <div className="absolute -right-6 top-10 opacity-20"><Truck size={80} /></div>
                    <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner"><CheckSquare className="h-6 w-6 text-white" /></div>
                    <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1">ডেলিভারড (আজকে)</p>
                    <h3 className="text-3xl font-black">{stats.today.delivered} টি</h3>
                    <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                        ৳ {stats.today.deliveryAmount.toLocaleString()}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-500 to-red-600 p-6 rounded-[2rem] shadow-xl shadow-red-200 text-white relative overflow-hidden group hover:-translate-y-1 transition duration-300">
                    <div className="absolute -right-6 -top-6 opacity-20"><Ban size={100} /></div>
                    <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner"><XCircle className="h-6 w-6 text-white" /></div>
                    <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1">ক্যানসেল অর্ডার</p>
                    <h3 className="text-4xl font-black">{stats.today.canceled} টি</h3>
                    <p className="text-xs text-white/80 mt-2 font-medium">আজকের বাতিল হওয়া অর্ডার</p>
                </div>
             </div>
             
             {/* ... (Recent Orders & Top Selling) ... */}
           </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
          <div className="animate-fade-in space-y-6">
             {/* ... (Existing List View) ... */}
             {viewMode === 'list' ? (
                <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">পণ্য ম্যানেজমেন্ট</h2>
                            <p className="text-gray-500 font-medium text-sm mt-1">মোট পণ্য: <span className="text-primary font-bold bg-white px-2 py-0.5 rounded-md shadow-sm">{filteredProducts.length}</span></p>
                        </div>
                        <button onClick={() => { setFormData(initialFormState); setFormMode('add'); setViewMode('form'); }} className="bg-gradient-to-r from-primary to-gray-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-gray-300 hover:scale-105 transition-transform">
                            <Plus size={20} /> নতুন পণ্য
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="নাম, ক্যাটাগরি বা কোড দিয়ে খুঁজুন..." className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none text-sm font-bold text-gray-700" />
                    </div>

                    {/* Desktop View Table */}
                    <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                                <tr>
                                    <th className="p-6">পণ্য বিবরণ</th>
                                    <th className="p-6">মূল্য</th>
                                    <th className="p-6">স্টক স্ট্যাটাস</th>
                                    <th className="p-6 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-blue-50/30 transition group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0 bg-white p-1">
                                                    <img src={product.image} className="w-full h-full object-cover rounded-xl" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</p>
                                                    <div className="flex gap-2 mt-1.5">
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold">{product.category}</span>
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-mono">{product.sku || 'NO SKU'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-black text-gray-900 text-base">৳{product.price}</p>
                                            {product.originalPrice && <p className="text-xs text-gray-400 line-through">৳{product.originalPrice}</p>}
                                        </td>
                                        <td className="p-6">
                                            <span className={`text-[10px] px-3 py-1.5 rounded-xl font-bold border ${product.stockQuantity && product.stockQuantity > 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {product.stockQuantity || 0} units left
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(product)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 hover:scale-110 transition"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:scale-110 transition"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                     {/* Mobile View Cards */}
                    <div className="md:hidden space-y-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex gap-4 relative overflow-hidden">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                    <img src={product.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 rounded">{product.category}</span>
                                        <span className={`w-2 h-2 rounded-full ${product.stock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 truncate mb-1">{product.name}</h4>
                                    <p className="text-lg font-black text-primary">৳{product.price}</p>
                                </div>
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button onClick={() => handleEdit(product)} className="p-2 bg-blue-50 text-blue-600 rounded-xl shadow-sm"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 text-red-500 rounded-xl shadow-sm"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                /* Full Form */
                <div className="max-w-4xl mx-auto pb-10">
                     {/* ... (Existing Form Code) ... */}
                     <div className="flex items-center gap-4 mb-6">
                        <button onClick={() => setViewMode('list')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600"><ChevronLeft /></button>
                        <h2 className="text-2xl font-black text-gray-900">{formMode === 'add' ? 'নতুন পণ্য যোগ করুন' : 'পণ্য আপডেট করুন'}</h2>
                    </div>
                    
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-8">
                        
                        {/* 1. Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-gray-800 border-b pb-2">সাধারণ তথ্য</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">পণ্যের নাম *</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition font-bold text-gray-800" placeholder="Product Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">ক্যাটাগরি</label>
                                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition font-bold text-gray-800">
                                        {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">SKU / কোড</label>
                                    <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition font-bold text-gray-800" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Pricing & Stock */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-gray-800 border-b pb-2">দাম ও স্টক</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">বিক্রয় মূল্য *</label>
                                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition font-bold text-gray-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">অরিজিনাল দাম (ছাড়ের আগে)</label>
                                    <input type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition font-bold text-gray-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">কেনা দাম (Cost Price)</label>
                                    <input type="number" value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: Number(e.target.value)})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition font-bold text-gray-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">স্টক পরিমাণ</label>
                                    <input type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition font-bold text-gray-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">ইউনিট (Pcs/Kg/Ltr)</label>
                                    <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition font-bold text-gray-800" placeholder="pcs" />
                                </div>
                            </div>
                        </div>

                        {/* 3. Media & Description */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-gray-800 border-b pb-2">মিডিয়া ও বিবরণ</h3>
                             
                             {/* Image Upload */}
                             <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">পণ্য ছবি আপলোড করুন</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition relative">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={handleImageUpload} 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    />
                                    <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm font-bold text-gray-600">ছবি ড্র্যাগ করুন অথবা ক্লিক করে সিলেক্ট করুন</p>
                                    <p className="text-xs text-gray-400 mt-1">Direct upload supported (Max 800px resized)</p>
                                </div>
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {formData.images?.map((img, idx) => (
                                        <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 relative group">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => {
                                                    const newImgs = formData.images?.filter((_, i) => i !== idx);
                                                    setFormData({...formData, images: newImgs, image: newImgs?.[0] || ''});
                                                }}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">অথবা ছবির লিংক দিন (অপশনাল)</label>
                                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition text-gray-600" placeholder="https://..." />
                            </div>

                            {/* Multiple Video URLs */}
                             <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">ভিডিও লিংক সমূহ (YouTube)</label>
                                {formData.videoUrls?.map((url, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0"><Video size={20} /></div>
                                        <input 
                                            type="text" 
                                            value={url} 
                                            onChange={e => {
                                                const newUrls = [...(formData.videoUrls || [])];
                                                newUrls[idx] = e.target.value;
                                                setFormData({...formData, videoUrls: newUrls, videoUrl: newUrls[0] || ''});
                                            }} 
                                            className="w-full border-gray-200 rounded-xl p-3 bg-gray-50" 
                                            placeholder="https://youtube.com/..." 
                                        />
                                        <button 
                                            onClick={() => {
                                                const newUrls = formData.videoUrls?.filter((_, i) => i !== idx);
                                                setFormData({...formData, videoUrls: newUrls, videoUrl: newUrls?.[0] || ''});
                                            }}
                                            className="p-3 bg-red-50 text-red-500 rounded-xl"
                                        ><Trash2 size={20} /></button>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => setFormData({...formData, videoUrls: [...(formData.videoUrls || []), '']})}
                                    className="text-sm font-bold text-primary flex items-center gap-2 mt-2"
                                >
                                    <Plus size={16} /> আরও ভিডিও যোগ করুন
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">ওজন</label>
                                    <input type="text" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition text-gray-600" placeholder="0.5 kg" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">ওয়ারেন্টি</label>
                                    <input type="text" value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition text-gray-600" placeholder="1 Year Service" />
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">বিস্তারিত বিবরণ</label>
                                <textarea rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition text-gray-600" placeholder="Product details..." />
                            </div>
                        </div>

                        <button onClick={handleSaveProduct} disabled={uploading} className="w-full bg-gradient-to-r from-primary to-gray-800 text-white py-4 rounded-xl font-bold shadow-lg shadow-gray-300 flex justify-center items-center gap-2 hover:scale-[1.01] transition-transform">
                            {uploading ? <Loader2 className="animate-spin" /> : <Save size={20} />} {formMode === 'add' ? 'পণ্য সেভ করুন' : 'আপডেট করুন'}
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
        
        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
             <div className="space-y-6 animate-fade-in">
                {/* ... (Summary Cards) ... */}
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                        <p className="text-xs font-bold text-gray-400 uppercase">আজকের অর্ডার</p>
                        <h3 className="text-2xl font-black text-gray-800">{stats.today.count}</h3>
                        <p className="text-xs font-bold text-primary">৳ {stats.today.sales.toLocaleString()}</p>
                    </div>
                    {/* ... other stats ... */}
                    <div className="bg-orange-50 p-4 rounded-2xl shadow-sm border border-orange-100 flex flex-col justify-center items-center">
                        <p className="text-xs font-bold text-orange-400 uppercase">পেন্ডিং</p>
                        <h3 className="text-2xl font-black text-orange-600">{stats.today.pending}</h3>
                        <p className="text-xs font-bold text-orange-500">৳ {stats.today.pendingAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl shadow-sm border border-green-100 flex flex-col justify-center items-center">
                        <p className="text-xs font-bold text-green-400 uppercase">ডেলিভারড</p>
                        <h3 className="text-2xl font-black text-green-600">{stats.today.delivered}</h3>
                        <p className="text-xs font-bold text-green-500">৳ {stats.today.deliveryAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-center items-center">
                        <p className="text-xs font-bold text-red-400 uppercase">ক্যানসেলড</p>
                        <h3 className="text-2xl font-black text-red-600">{stats.today.canceled}</h3>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">অর্ডার তালিকা</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">ম্যানেজ করুন আপনার কাস্টমার অর্ডার</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
                            <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="bg-transparent text-xs font-bold text-gray-600 focus:outline-none cursor-pointer">
                                {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button onClick={openCreateOrder} className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                            <Plus size={18} /> অর্ডার তৈরি করুন
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input type="text" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="অর্ডার আইডি বা ফোন নম্বর দিয়ে খুঁজুন..." className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-primary/20 text-sm font-bold text-gray-700 outline-none" />
                </div>

                {/* Colorful Order Cards */}
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <div key={order.id} className={`rounded-[24px] shadow-sm border hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group relative
                             ${order.status === 'Pending' ? 'bg-orange-50 border-orange-100' : 
                               order.status === 'Delivered' ? 'bg-green-50 border-green-100' :
                               order.status === 'Cancelled' ? 'bg-red-50 border-red-100' :
                               'bg-white border-gray-100'}
                        `} onClick={() => openEditOrder(order)}>
                            
                            <div className="pl-6 pr-5 py-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                {/* Order ID & Date */}
                                <div className="min-w-[120px]">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Order ID</p>
                                    <h3 className="text-lg font-black text-gray-800 font-mono">#{order.id}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">{order.createdAt?.toDate().toLocaleDateString()}</p>
                                </div>

                                {/* Customer */}
                                <div className="flex items-center gap-3 md:flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-white shadow-sm`}>
                                        {order.customerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                                        <p className="text-[11px] text-gray-500 font-medium">{order.customerPhone}</p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl text-center min-w-[100px]">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Amount</p>
                                    <p className="text-base font-black text-gray-800">৳{order.totalAmount}</p>
                                </div>

                                {/* Status Badge */}
                                <div className="min-w-[100px] text-center">
                                    <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wide shadow-sm inline-block bg-white`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Arrow */}
                                <div className="hidden md:block text-gray-300 group-hover:text-primary transition group-hover:translate-x-1">
                                    <ChevronRight />
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100 border-dashed">
                            <ShoppingBag size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">কোনো অর্ডার পাওয়া যায়নি</p>
                        </div>
                    )}
                </div>
             </div>
        )}

        {/* ... (Coupons & Customers Tabs remain same) ... */}
        {activeTab === 'coupons' && (
            <div className="space-y-6 animate-fade-in">
                 <h2 className="text-3xl font-black text-gray-900 tracking-tight">কুপন ম্যানেজমেন্ট</h2>
                 {/* Create Coupon */}
                 <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                     <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">নতুন কুপন যোগ করুন</h3>
                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                         <input type="text" placeholder="Code (e.g. SAVE10)" className="md:col-span-1 border border-gray-200 rounded-xl p-3 bg-gray-50" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} />
                         <select className="border border-gray-200 rounded-xl p-3 bg-gray-50" value={newCoupon.discountType} onChange={(e:any) => setNewCoupon({...newCoupon, discountType: e.target.value})}>
                             <option value="fixed">Fixed Amount (৳)</option>
                             <option value="percentage">Percentage (%)</option>
                         </select>
                         <input type="number" placeholder="Amount" className="border border-gray-200 rounded-xl p-3 bg-gray-50" value={newCoupon.discountAmount || ''} onChange={e => setNewCoupon({...newCoupon, discountAmount: Number(e.target.value)})} />
                         <input type="number" placeholder="Min Order" className="border border-gray-200 rounded-xl p-3 bg-gray-50" value={newCoupon.minOrderAmount || ''} onChange={e => setNewCoupon({...newCoupon, minOrderAmount: Number(e.target.value)})} />
                         <button onClick={handleCreateCoupon} className="bg-primary text-white rounded-xl font-bold shadow-lg">Save Coupon</button>
                     </div>
                 </div>
                 {/* Coupon List */}
                 <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                     <table className="w-full text-left">
                         <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-400">
                             <tr>
                                 <th className="p-4">Code</th>
                                 <th className="p-4">Discount</th>
                                 <th className="p-4">Min Order</th>
                                 <th className="p-4">Status</th>
                                 <th className="p-4 text-right">Action</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                             {coupons.map(coupon => (
                                 <tr key={coupon.id}>
                                     <td className="p-4 font-black text-primary">{coupon.code}</td>
                                     <td className="p-4 font-bold">{coupon.discountAmount} {coupon.discountType === 'percentage' ? '%' : '৳'}</td>
                                     <td className="p-4 text-gray-500">৳ {coupon.minOrderAmount}</td>
                                     <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{coupon.status}</span></td>
                                     <td className="p-4 text-right">
                                         <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
            </div>
        )}

        {/* --- CUSTOMERS TAB --- */}
        {activeTab === 'customers' && (
             // ... existing customers ...
             <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">কাস্টমার তালিকা</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {customers.map((c, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg ${['bg-gradient-to-br from-pink-500 to-rose-500', 'bg-gradient-to-br from-purple-500 to-indigo-500', 'bg-gradient-to-br from-cyan-500 to-blue-500'][idx % 3]}`}>
                                    {c.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary transition">{c.name}</h4>
                                    <p className="text-xs text-gray-400 font-medium mt-1">{c.phone}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">মোট অর্ডার</p>
                                    <p className="text-lg font-black text-gray-800">{c.orders.length}</p>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-2xl text-center border border-blue-100">
                                    <p className="text-xs text-blue-400 uppercase font-bold mb-1">মোট কেনাকাটা</p>
                                    <p className="text-lg font-black text-blue-600">৳{c.totalSales}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      {/* ... (Existing) ... */}
       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 flex items-center justify-around py-3 px-4 z-[60] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-[20px]">
          <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center p-1 rounded-xl transition-all ${activeTab === 'overview' ? 'text-primary scale-110' : 'text-gray-400'}`}>
              <LayoutDashboard size={22} strokeWidth={activeTab === 'overview' ? 2.5 : 2} />
              <span className="text-[9px] font-bold mt-1">Home</span>
          </button>
          <button onClick={() => { setActiveTab('products'); setViewMode('list'); }} className={`flex flex-col items-center p-1 rounded-xl transition-all ${activeTab === 'products' ? 'text-primary scale-110' : 'text-gray-400'}`}>
              <Package size={22} strokeWidth={activeTab === 'products' ? 2.5 : 2} />
              <span className="text-[9px] font-bold mt-1">Products</span>
          </button>
          <div className="w-12 h-12 bg-primary rounded-full -mt-8 border-4 border-white shadow-lg flex items-center justify-center text-white cursor-pointer" onClick={() => { setFormData(initialFormState); setFormMode('add'); setViewMode('form'); setActiveTab('products'); }}>
              <Plus size={24} />
          </div>
          <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center p-1 rounded-xl transition-all ${activeTab === 'orders' ? 'text-primary scale-110' : 'text-gray-400'}`}>
              <ShoppingBag size={22} strokeWidth={activeTab === 'orders' ? 2.5 : 2} />
              <span className="text-[9px] font-bold mt-1">Orders</span>
          </button>
          <button onClick={() => setActiveTab('customers')} className={`flex flex-col items-center p-1 rounded-xl transition-all ${activeTab === 'customers' ? 'text-primary scale-110' : 'text-gray-400'}`}>
              <Users size={22} strokeWidth={activeTab === 'customers' ? 2.5 : 2} />
              <span className="text-[9px] font-bold mt-1">Users</span>
          </button>
      </div>

      {/* --- ORDER CREATE/EDIT MODAL --- */}
      {isOrderModalOpen && editOrderData && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
           <div className="bg-[#F8F9FB] w-full max-w-4xl h-[95vh] md:h-auto md:max-h-[95vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
              
              <div className="bg-white p-5 flex justify-between items-center border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md"><FileText size={20} /></div>
                      <div>
                          <h2 className="text-xl font-black text-gray-900 leading-none">
                              {isCreatingOrder ? 'নতুন অর্ডার তৈরি' : `অর্ডার #${editOrderData.id}`}
                          </h2>
                          <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wide">
                              {isCreatingOrder ? new Date().toLocaleDateString() : editOrderData.createdAt?.toDate().toLocaleDateString()}
                          </p>
                      </div>
                  </div>
                  <button onClick={() => setIsOrderModalOpen(false)} className="bg-gray-50 p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><X /></button>
              </div>

              <div className="p-5 overflow-y-auto bg-[#F8F9FB] flex-1 space-y-6 scrollbar-hide">
                  {/* ... (Existing Modal Content) ... */}
                  {/* Status Picker */}
                  <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest ml-1">অর্ডার স্ট্যাটাস</p>
                      <select value={editOrderData.status} onChange={(e) => setEditOrderData({...editOrderData, status: e.target.value as any})} className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-900 shadow-inner focus:ring-2 focus:ring-primary/20">
                          {orderStatuses.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>

                  {/* Customer Block (Editable) */}
                  <div className="space-y-3">
                      <h3 className="font-black text-gray-800 flex items-center gap-2 ml-1 text-sm uppercase tracking-wide opacity-60"><Users size={16} /> কাস্টমার ডিটেইলস</h3>
                      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">নাম</p>
                                <input 
                                    value={editOrderData.customerName} 
                                    onChange={e => setEditOrderData({...editOrderData, customerName: e.target.value})} 
                                    className="w-full bg-gray-50 rounded-lg p-3 font-bold text-sm border border-gray-100" 
                                    placeholder="কাস্টমারের নাম"
                                />
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">ফোন</p>
                                <input 
                                    value={editOrderData.customerPhone} 
                                    onChange={e => setEditOrderData({...editOrderData, customerPhone: e.target.value})} 
                                    className="w-full bg-gray-50 rounded-lg p-3 font-bold text-sm border border-gray-100" 
                                    placeholder="017xxxxxxxx"
                                />
                             </div>
                          </div>
                          <div>
                             <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">ঠিকানা</p>
                             <textarea 
                                value={editOrderData.customerAddress} 
                                onChange={e => setEditOrderData({...editOrderData, customerAddress: e.target.value})} 
                                className="w-full bg-gray-50 rounded-lg p-3 font-bold text-sm border border-gray-100 h-20" 
                                placeholder="পূর্ণ ঠিকানা লিখুন"
                             />
                          </div>
                      </div>
                  </div>

                  {/* Items List (Editable) */}
                  <div className="space-y-3">
                      <div className="flex justify-between items-center ml-1">
                         <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide opacity-60"><Package size={16} /> পণ্য তালিকা</h3>
                      </div>
                      
                      <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 space-y-4">
                         {/* Add Product Section */}
                         <div className="flex gap-2 mb-4 p-2 bg-gray-50 rounded-xl">
                             <select 
                                value={productToAdd} 
                                onChange={(e) => setProductToAdd(e.target.value)} 
                                className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold"
                             >
                                <option value="">পণ্য সিলেক্ট করুন...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - ৳{p.price}</option>
                                ))}
                             </select>
                             <button 
                                onClick={handleAddProductToOrder}
                                className="bg-green-500 text-white px-4 rounded-lg font-bold flex items-center gap-1 hover:bg-green-600"
                             >
                                <Plus size={16}/> Add
                             </button>
                         </div>

                         {/* Items Mapping */}
                         <div className="space-y-3">
                            {editOrderData.items?.map((item: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 p-3 rounded-[20px] flex flex-col md:flex-row items-center justify-between border border-gray-100 relative group">
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="w-12 h-12 rounded-xl bg-white flex-shrink-0 border border-gray-100 overflow-hidden">
                                           <img src={item.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-900 line-clamp-1 w-32">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Price: ৳{item.price}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                                        <div className="flex items-center bg-white rounded-lg border border-gray-200 h-8">
                                            <button onClick={() => handleUpdateItemQuantity(idx, -1)} className="px-2 hover:bg-gray-100"><Minus size={12}/></button>
                                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                            <button onClick={() => handleUpdateItemQuantity(idx, 1)} className="px-2 hover:bg-gray-100"><Plus size={12}/></button>
                                        </div>
                                        <p className="font-black text-gray-900 text-sm w-16 text-right">৳{item.price * item.quantity}</p>
                                        <button onClick={() => handleRemoveItemFromOrder(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            {(!editOrderData.items || editOrderData.items.length === 0) && (
                                <p className="text-center text-gray-400 text-sm py-4">কোনো পণ্য যোগ করা হয়নি</p>
                            )}
                         </div>
                      </div>
                  </div>

                  {/* Summary (Editable Fees) */}
                  <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-[32px] space-y-3 shadow-2xl shadow-gray-400">
                      <div className="flex justify-between text-xs text-white/60 font-bold uppercase">
                          <span>Subtotal</span>
                          <span>৳{editOrderData.items?.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0) || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-white/60 font-bold uppercase">
                          <span>Delivery Charge</span>
                          <input 
                              type="number"
                              value={editOrderData.shippingCost}
                              onChange={(e) => setEditOrderData({...editOrderData, shippingCost: Number(e.target.value)})}
                              className="w-20 bg-white/10 border border-white/20 rounded px-2 py-1 text-right text-white font-bold outline-none focus:border-white/50"
                          />
                      </div>
                      <div className="flex justify-between items-center text-xs text-red-300 font-bold uppercase">
                          <span>Discount</span>
                          <input 
                              type="number"
                              value={editOrderData.discount}
                              onChange={(e) => setEditOrderData({...editOrderData, discount: Number(e.target.value)})}
                              className="w-20 bg-white/10 border border-white/20 rounded px-2 py-1 text-right text-white font-bold outline-none focus:border-white/50"
                          />
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t border-white/10 mt-2">
                          <span className="text-lg font-black uppercase">Total</span>
                          <span className="text-2xl font-black text-green-400">
                              ৳{
                                  (editOrderData.items?.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0) || 0) + 
                                  (Number(editOrderData.shippingCost) || 0) - 
                                  (Number(editOrderData.discount) || 0)
                              }
                          </span>
                      </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="grid grid-cols-2 gap-4 pb-4">
                      {!isCreatingOrder && <button onClick={() => handlePrintInvoice(editOrderData as Order)} className="py-4 bg-white border border-gray-200 rounded-2xl font-bold flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50"><Printer size={18} /> Invoice</button>}
                      <button onClick={saveOrder} className={`py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform ${isCreatingOrder ? 'col-span-2' : ''}`}><Save size={18} /> {isCreatingOrder ? 'Create Order' : 'Save Changes'}</button>
                  </div>

              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;