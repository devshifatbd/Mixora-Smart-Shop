import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy, getDoc, Timestamp } from 'firebase/firestore';
import { Product, Order, CartItem } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  Package, ShoppingBag, DollarSign, Upload, Trash2, LogOut, Loader2, 
  Home, AlertCircle, Link as LinkIcon, Image as ImageIcon, Plus, 
  MoreVertical, Edit, Copy, Save, X, CheckSquare, Square, Eye, Search, Filter,
  Users, ChevronLeft, ChevronRight, TrendingUp, Calendar, Truck, CheckCircle, XCircle, FileText, Printer, MapPin, Phone, Mail, Store, Minus, PlusCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { categoriesList } from '../data';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // --- Report Date State ---
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
  
  // --- Order Editing State ---
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editOrderData, setEditOrderData] = useState<any>(null);
  const [productSearchForOrder, setProductSearchForOrder] = useState('');

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
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  // --- Helper Functions for Dashboard ---
  const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
  const isSameMonth = (d1: Date, d2: Date) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  const isLast30Days = (d1: Date) => {
      const diffTime = Math.abs(new Date().getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
  };

  const calculateStats = () => {
      const selectedDateObj = new Date(reportDate);
      const today = new Date(); 

      const dailyOrders = orders.filter(o => o.createdAt && isSameDay(o.createdAt.toDate(), selectedDateObj));
      const monthOrders = orders.filter(o => o.createdAt && isSameMonth(o.createdAt.toDate(), today));
      const last30Orders = orders.filter(o => o.createdAt && isLast30Days(o.createdAt.toDate()));

      return {
          today: {
              sales: dailyOrders.reduce((acc, o) => acc + o.totalAmount, 0),
              count: dailyOrders.length,
              pendingAmount: dailyOrders.filter(o => o.status === 'Pending').reduce((acc, o) => acc + o.totalAmount, 0),
              deliveryAmount: dailyOrders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + o.totalAmount, 0),
              delivered: dailyOrders.filter(o => o.status === 'Delivered').length,
              confirmed: dailyOrders.filter(o => o.status === 'Order Confirmed').length,
              canceled: dailyOrders.filter(o => o.status === 'Cancelled' || o.status === 'Order Canceled').length,
              pending: dailyOrders.filter(o => o.status === 'Pending').length,
          },
          month: {
              sales: monthOrders.reduce((acc, o) => acc + o.totalAmount, 0),
              deliveredAmount: monthOrders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + o.totalAmount, 0),
              pendingAmount: monthOrders.filter(o => o.status === 'Pending').reduce((acc, o) => acc + o.totalAmount, 0),
              canceledAmount: monthOrders.filter(o => o.status === 'Cancelled' || o.status === 'Order Canceled').reduce((acc, o) => acc + o.totalAmount, 0),
              count: monthOrders.length
          },
          last30: {
              sales: last30Orders.reduce((acc, o) => acc + o.totalAmount, 0),
              count: last30Orders.length,
              delivered: last30Orders.filter(o => o.status === 'Delivered').length,
              canceled: last30Orders.filter(o => o.status === 'Cancelled' || o.status === 'Order Canceled').length,
              pending: last30Orders.filter(o => o.status === 'Pending').length,
              totalWithDelivery: last30Orders.reduce((acc, o) => acc + o.totalAmount, 0),
              totalWithoutDelivery: last30Orders.reduce((acc, o) => acc + (o.totalAmount - (o.shippingCost || 0)), 0),
          }
      };
  };

  const stats = calculateStats();

  const getTopSellingProducts = () => {
      const productCounts: Record<string, { name: string; count: number; image: string; price: number }> = {};
      
      orders.forEach(order => {
          if (order.status !== 'Cancelled' && order.status !== 'Order Canceled') {
              order.items.forEach(item => {
                  if (productCounts[item.id]) {
                      productCounts[item.id].count += item.quantity;
                  } else {
                      productCounts[item.id] = {
                          name: item.name,
                          count: item.quantity,
                          image: item.image,
                          price: item.price
                      };
                  }
              });
          }
      });

      return Object.values(productCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
  };

  const topSelling = getTopSellingProducts();

  const getCustomers = () => {
      const customerMap: Record<string, any> = {};
      orders.forEach(order => {
          if(!customerMap[order.customerPhone]) {
              customerMap[order.customerPhone] = {
                  name: order.customerName,
                  phone: order.customerPhone,
                  address: order.customerAddress,
                  totalSales: 0,
                  orders: [],
                  delivered: 0,
                  canceled: 0,
                  pending: 0
              };
          }
          customerMap[order.customerPhone].totalSales += order.totalAmount;
          customerMap[order.customerPhone].orders.push(order);
          if(order.status === 'Delivered') customerMap[order.customerPhone].delivered++;
          else if(order.status === 'Cancelled' || order.status === 'Order Canceled') customerMap[order.customerPhone].canceled++;
          else customerMap[order.customerPhone].pending++;
      });
      return Object.values(customerMap);
  };
  const customers = getCustomers();

  // --- Product Functions ---
  const handleRemoveImage = (index: number) => {
      const currentImages = formData.images || [];
      const updatedImages = currentImages.filter((_, i) => i !== index);
      setFormData(prev => ({
          ...prev,
          image: updatedImages.length > 0 ? updatedImages[0] : '',
          images: updatedImages
      }));
  };

  const handleEdit = (product: Product) => {
    setFormData({
        ...product,
        dimensions: product.dimensions || { length: '', width: '', height: '' },
        deliveryCharge: product.deliveryCharge || { isDefault: true, amount: 0 },
        variants: product.variants || []
    });
    setEditingId(product.id);
    setFormMode('edit');
    setViewMode('form');
  };

  const handleClone = (product: Product) => {
    const clonedData = { ...product };
    // @ts-ignore
    delete clonedData.id;
    setFormData({
        ...clonedData,
        name: `${clonedData.name} (Copy)`,
        dimensions: clonedData.dimensions || { length: '', width: '', height: '' },
        deliveryCharge: clonedData.deliveryCharge || { isDefault: true, amount: 0 },
        variants: clonedData.variants || []
    });
    setEditingId(null);
    setFormMode('add');
    setViewMode('form');
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিত যে আপনি এই পণ্যটি মুছে ফেলতে চান?")) {
        await deleteDoc(doc(db, 'products', id));
        fetchData();
    }
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
              stock: (formData.stockQuantity || 0) > 0 || formData.stock === true
          };

          if (formMode === 'edit' && editingId) {
              await updateDoc(doc(db, 'products', editingId), payload);
              setStatusMessage({ type: 'success', text: 'পণ্য সফলভাবে আপডেট করা হয়েছে!' });
          } else {
              await addDoc(collection(db, 'products'), { ...payload, createdAt: new Date() });
              setStatusMessage({ type: 'success', text: 'নতুন পণ্য সফলভাবে যোগ করা হয়েছে!' });
          }
          
          setTimeout(() => {
              setViewMode('list');
              setFormData(initialFormState);
              setStatusMessage(null);
              fetchData();
          }, 1000);
      } catch (error: any) {
          setStatusMessage({ type: 'error', text: error.message });
      }
      setUploading(false);
  };

  const addVariant = () => setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), { name: '', options: '' }] }));
  const updateVariant = (index: number, field: 'name' | 'options', value: string) => {
      const updatedVariants = [...(formData.variants || [])];
      updatedVariants[index][field] = value;
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };
  const removeVariant = (index: number) => {
      const updatedVariants = (formData.variants || []).filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Order Functions ---
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
      try {
          await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
          // Optimistic update
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
          if (selectedOrder && selectedOrder.id === orderId) {
              setSelectedOrder({ ...selectedOrder, status: newStatus as any });
          }
      } catch (error) {
          console.error("Failed to update status", error);
          alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
      }
  };

  // --- Advanced Order Editing ---
  const openEditOrder = (order: Order) => {
      setSelectedOrder(order);
      setEditOrderData({
          ...order,
          discount: (order as any).discount || 0
      });
      setIsEditingOrder(false); // Default to view mode
  };

  const updateEditOrderItemQuantity = (index: number, delta: number) => {
      if (!editOrderData) return;
      const updatedItems = [...editOrderData.items];
      const newQty = updatedItems[index].quantity + delta;
      
      if (newQty <= 0) {
          // Remove item
          updatedItems.splice(index, 1);
      } else {
          updatedItems[index].quantity = newQty;
      }
      setEditOrderData({ ...editOrderData, items: updatedItems });
  };

  const addProductToOrder = (product: Product) => {
      if (!editOrderData) return;
      const existingIndex = editOrderData.items.findIndex((item: any) => item.id === product.id);
      let updatedItems = [...editOrderData.items];

      if (existingIndex >= 0) {
          updatedItems[existingIndex].quantity += 1;
      } else {
          updatedItems.push({ ...product, quantity: 1 });
      }
      setEditOrderData({ ...editOrderData, items: updatedItems });
      setProductSearchForOrder('');
  };

  const calculateEditOrderTotal = () => {
      if (!editOrderData) return 0;
      const subtotal = editOrderData.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
      return subtotal + (editOrderData.shippingCost || 0) - (editOrderData.discount || 0);
  };

  const saveOrderChanges = async () => {
      if (!editOrderData || !editOrderData.id) return;
      
      const newTotal = calculateEditOrderTotal();
      const updatedOrder = {
          ...editOrderData,
          totalAmount: newTotal
      };

      try {
          await updateDoc(doc(db, 'orders', editOrderData.id), {
              customerName: updatedOrder.customerName,
              customerPhone: updatedOrder.customerPhone,
              customerAddress: updatedOrder.customerAddress,
              status: updatedOrder.status,
              items: updatedOrder.items,
              shippingCost: Number(updatedOrder.shippingCost),
              totalAmount: newTotal,
              discount: Number(updatedOrder.discount || 0)
          });

          // Update local state
          setOrders(prev => prev.map(o => o.id === editOrderData.id ? updatedOrder : o));
          setSelectedOrder(updatedOrder); // Update view mode data
          setIsEditingOrder(false);
          alert('অর্ডার সফলভাবে আপডেট করা হয়েছে!');
      } catch (error) {
          console.error("Update failed", error);
          alert('আপডেট করতে সমস্যা হয়েছে।');
      }
  };

  const handlePrintInvoice = (order: Order) => {
      const discount = (order as any).discount || 0;
      const printWindow = window.open('', '', 'width=800,height=800');
      if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Invoice #${order.id}</title>
                <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <style>
                  body { font-family: 'Hind Siliguri', sans-serif; padding: 40px; background: #f9f9f9; color: #333; }
                  .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border: 1px solid #eee; }
                  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C6A87C; padding-bottom: 20px; margin-bottom: 30px; }
                  .logo-section h1 { margin: 0; color: #111; font-size: 28px; font-weight: 700; }
                  .logo-section p { margin: 5px 0 0; font-size: 12px; color: #666; }
                  .invoice-title { text-align: right; }
                  .invoice-title h2 { margin: 0; color: #C6A87C; font-size: 24px; text-transform: uppercase; }
                  .invoice-title p { margin: 5px 0 0; font-weight: bold; font-family: monospace; }
                  
                  .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
                  .info-box { width: 48%; }
                  .info-box h3 { font-size: 14px; text-transform: uppercase; color: #999; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                  .info-box p { margin: 3px 0; font-size: 14px; }
                  .info-box strong { font-weight: 600; }

                  table { w-full; border-collapse: collapse; width: 100%; margin-top: 20px; }
                  th { background: #111; color: white; padding: 12px; text-align: left; font-size: 13px; text-transform: uppercase; }
                  td { border-bottom: 1px solid #eee; padding: 12px; font-size: 14px; }
                  .text-right { text-align: right; }
                  
                  .totals-section { display: flex; justify-content: flex-end; margin-top: 30px; }
                  .totals-table { width: 40%; }
                  .totals-table td { padding: 8px; border-bottom: 1px solid #eee; }
                  .totals-table .final-total { font-weight: bold; font-size: 18px; color: #111; border-top: 2px solid #C6A87C; }

                  .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                  @media print {
                    body { background: white; padding: 0; }
                    .invoice-container { border: none; padding: 0; }
                  }
                </style>
              </head>
              <body>
                <div class="invoice-container">
                  <div class="header">
                    <div class="logo-section">
                      <h1>Mixora Smart Shop</h1>
                      <p>www.mixorasmartshop.com</p>
                      <p>01711-728660</p>
                    </div>
                    <div class="invoice-title">
                      <h2>Invoice</h2>
                      <p>#${order.id}</p>
                      <p style="font-size: 12px; color: #666; margin-top: 5px;">${order.createdAt?.toDate().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div class="info-section">
                    <div class="info-box">
                      <h3>Bill To</h3>
                      <p><strong>${order.customerName}</strong></p>
                      <p>${order.customerPhone}</p>
                      <p>${order.customerAddress}</p>
                    </div>
                    <div class="info-box text-right">
                      <h3>Order Info</h3>
                      <p>Payment: <span style="text-transform:uppercase;">${order.paymentMethod}</span></p>
                      <p>Status: ${order.status}</p>
                    </div>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th class="text-right">Price</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${order.items.map(item => `
                        <tr>
                          <td>
                            <strong>${item.name}</strong><br/>
                            <span style="font-size: 11px; color: #666;">${item.category}</span>
                          </td>
                          <td class="text-right">${item.price}</td>
                          <td class="text-right">${item.quantity}</td>
                          <td class="text-right">${item.price * item.quantity}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>

                  <div class="totals-section">
                    <table class="totals-table">
                      <tr>
                        <td>Subtotal</td>
                        <td class="text-right">${order.items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}</td>
                      </tr>
                      <tr>
                        <td>Delivery Charge</td>
                        <td class="text-right">${order.shippingCost}</td>
                      </tr>
                      ${discount > 0 ? `
                      <tr>
                        <td>Discount</td>
                        <td class="text-right">-${discount}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td class="final-total">Total Amount</td>
                        <td class="text-right final-total">৳ ${order.totalAmount}</td>
                      </tr>
                    </table>
                  </div>

                  <div class="footer">
                    <p>Thank you for shopping with Mixora Smart Shop!</p>
                    <p>For any queries, contact us at support@mixorasmartshop.com</p>
                  </div>
                </div>
                <script>window.print();</script>
              </body>
            </html>
          `);
          printWindow.document.close();
      }
  };

  // Filter Orders
  const filteredOrders = orders.filter(order => {
      const matchStatus = orderFilter === 'All Orders' || order.status === orderFilter;
      const matchSearch = order.id.includes(orderSearch) || order.customerPhone.includes(orderSearch) || order.customerName.toLowerCase().includes(orderSearch.toLowerCase());
      return matchStatus && matchSearch;
  });

  const orderStatuses = ['All Orders', 'Pending', 'Order Placed', 'Order Confirmed', 'Order Shipped', 'Delivered', 'Order Completed', 'Order Canceled', 'Order Returned', 'Cancelled'];

  if (loading && viewMode === 'list') return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-row font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <div className={`bg-white shadow-xl flex-shrink-0 z-20 transition-all duration-300 flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between h-16">
           {!isSidebarCollapsed && (
             <div>
               <h1 className="text-xl font-bold text-primary tracking-tight">মিক্সোরা</h1>
               <p className="text-[10px] text-gray-400">অ্যাডমিন প্যানেল</p>
             </div>
           )}
           <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
             {isSidebarCollapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
           </button>
        </div>
        
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {/* Shop Page Link */}
          <button onClick={() => navigate('/')} className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group text-gray-600 hover:bg-gray-50 mb-2`}>
            <Store className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
            {!isSidebarCollapsed && <span className="font-semibold">শপ পেইজ</span>}
          </button>

          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${activeTab === 'overview' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Home className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
            {!isSidebarCollapsed && <span className="font-semibold">ড্যাশবোর্ড</span>}
            {isSidebarCollapsed && activeTab === 'overview' && <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded ml-2">ড্যাশবোর্ড</div>}
          </button>
          
          <button onClick={() => { setActiveTab('products'); setViewMode('list'); }} className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${activeTab === 'products' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Package className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
            {!isSidebarCollapsed && <span className="font-semibold">পণ্য ম্যানেজমেন্ট</span>}
          </button>
          
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
            <ShoppingBag className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
            {!isSidebarCollapsed && <span className="font-semibold">অর্ডার লিস্ট</span>}
          </button>

          <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${activeTab === 'customers' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Users className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
            {!isSidebarCollapsed && <span className="font-semibold">কাস্টমার লিস্ট</span>}
          </button>
        </nav>

        <div className="p-3 border-t border-gray-100 mt-auto">
            <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center px-3 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className={`h-5 w-5 ${!isSidebarCollapsed && 'mr-3'}`} />
                {!isSidebarCollapsed && <span className="font-bold">লগ আউট</span>}
            </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">ড্যাশবোর্ড ওভারভিউ</h2>
                <div className="text-sm text-gray-500 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                    <Calendar className="h-4 w-4" /> 
                    {/* Date Picker for Report */}
                    <input 
                      type="date" 
                      value={reportDate} 
                      onChange={(e) => setReportDate(e.target.value)} 
                      className="bg-transparent border-none focus:outline-none text-gray-600 font-medium text-sm"
                    />
                </div>
             </div>

             {/* Today's Stats (Filtered by Date) */}
             <div>
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2"><div className="w-1 h-6 bg-secondary rounded"></div> {reportDate === new Date().toISOString().split('T')[0] ? 'আজকের রিপোর্ট' : `রিপোর্ট: ${reportDate}`}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-lg shadow-blue-200">
                        <p className="text-blue-100 text-sm font-medium mb-1">মোট সেল</p>
                        <h3 className="text-3xl font-bold">৳ {stats.today.sales}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium mb-1">মোট অর্ডার</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.today.count}</h3>
                        <div className="flex gap-2 mt-2 text-xs">
                           <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">Conf: {stats.today.confirmed}</span>
                           <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Pend: {stats.today.pending}</span>
                        </div>
                    </div>
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium mb-1">পেন্ডিং এমাউন্ট</p>
                        <h3 className="text-3xl font-bold text-orange-500">৳ {stats.today.pendingAmount}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium mb-1">ডেলিভারি এমাউন্ট</p>
                        <h3 className="text-3xl font-bold text-green-500">৳ {stats.today.deliveryAmount}</h3>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                     <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                         <h4 className="text-xl font-bold text-red-600">{stats.today.canceled}</h4>
                         <p className="text-xs text-red-400">ক্যানসেল অর্ডার</p>
                     </div>
                     <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                         <h4 className="text-xl font-bold text-green-600">{stats.today.delivered}</h4>
                         <p className="text-xs text-green-400">ডেলিভারি অর্ডার</p>
                     </div>
                     <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                         <h4 className="text-xl font-bold text-orange-600">{stats.today.pending}</h4>
                         <p className="text-xs text-orange-400">পেন্ডিং অর্ডার</p>
                     </div>
                     <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                         <h4 className="text-xl font-bold text-purple-600">N/A</h4>
                         <p className="text-xs text-purple-400">ওয়েবসাইট ভিজিট</p>
                     </div>
                </div>
             </div>

             {/* Running Month Report */}
             <div>
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2"><div className="w-1 h-6 bg-purple-500 rounded"></div> চলতি মাসের রিপোর্ট</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-purple-500">
                        <p className="text-gray-500 text-xs">মোট সেল এমাউন্ট</p>
                        <h3 className="text-2xl font-bold text-gray-800">৳ {stats.month.sales}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-green-500">
                        <p className="text-gray-500 text-xs">ডেলিভার্ড এমাউন্ট</p>
                        <h3 className="text-2xl font-bold text-gray-800">৳ {stats.month.deliveredAmount}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-orange-500">
                        <p className="text-gray-500 text-xs">পেন্ডিং এমাউন্ট</p>
                        <h3 className="text-2xl font-bold text-gray-800">৳ {stats.month.pendingAmount}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-red-500">
                        <p className="text-gray-500 text-xs">ক্যানসেল এমাউন্ট</p>
                        <h3 className="text-2xl font-bold text-gray-800">৳ {stats.month.canceledAmount}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-blue-500">
                        <p className="text-gray-500 text-xs">মোট অর্ডার</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.month.count} টি</h3>
                    </div>
                </div>
             </div>

             {/* Recent Sections Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 
                 {/* Recent Orders */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                         <h3 className="font-bold text-gray-700">রিসেন্ট অর্ডার লিস্ট</h3>
                         <button onClick={() => setActiveTab('orders')} className="text-xs text-primary hover:underline">সব দেখুন</button>
                     </div>
                     <div className="p-0">
                         {orders.slice(0, 5).map(order => (
                             <div key={order.id} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                     {order.customerName.charAt(0)}
                                 </div>
                                 <div className="flex-1">
                                     <h4 className="text-sm font-bold text-gray-800">{order.customerName}</h4>
                                     <p className="text-xs text-gray-500">{order.customerPhone}</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-sm font-bold text-gray-800">৳ {order.totalAmount}</p>
                                     <span className={`text-[10px] px-1.5 rounded ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{order.status}</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Recent Order Products */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-4 border-b border-gray-100 bg-gray-50">
                         <h3 className="font-bold text-gray-700">রিসেন্ট অর্ডার প্রোডাক্ট</h3>
                     </div>
                     <div className="p-0">
                         {orders.filter(o => o.items && o.items.length > 0).slice(0, 5).map(order => (
                             <div key={order.id + 'prod'} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                                 <img src={order.items[0]?.image} alt="" className="w-10 h-10 rounded bg-gray-100 object-cover" />
                                 <div className="flex-1">
                                     <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{order.items[0]?.name}</h4>
                                     <p className="text-xs text-gray-500">Order #{order.id}</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-xs text-gray-500">{order.createdAt?.toDate().toLocaleDateString()}</p>
                                     <span className="text-xs font-bold text-primary">Qty: {order.items[0]?.quantity}</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Top Selling Products */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-4 border-b border-gray-100 bg-gray-50">
                         <h3 className="font-bold text-gray-700">সবচেয়ে বেশি বিক্রিত পণ্য</h3>
                     </div>
                     <div className="p-0">
                         {topSelling.map((prod, idx) => (
                             <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                                 <span className="w-6 text-center font-bold text-gray-400">#{idx + 1}</span>
                                 <img src={prod.image} alt="" className="w-10 h-10 rounded bg-gray-100 object-cover" />
                                 <div className="flex-1">
                                     <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{prod.name}</h4>
                                     <p className="text-xs text-gray-500">Price: ৳ {prod.price}</p>
                                 </div>
                                 <div className="text-right">
                                     <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                         {prod.count} Sold
                                     </div>
                                 </div>
                             </div>
                         ))}
                         {topSelling.length === 0 && <div className="p-4 text-center text-gray-400">তথ্য নেই</div>}
                     </div>
                 </div>

             </div>
          </div>
        )}

        {/* --- PRODUCTS TAB (RESTORED FULL FORM) --- */}
        {activeTab === 'products' && (
          <div>
            {/* List View */}
            {viewMode === 'list' && (
                <div className="animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-800">সকল পণ্য <span className="text-sm font-normal bg-gray-200 px-2.5 py-1 rounded-full text-gray-700 ml-2">{filteredProducts.length}</span></h2>
                        </div>
                        
                        <div className="flex w-full md:w-auto gap-3">
                             {/* Search Bar */}
                            <div className="relative flex-1 md:w-64">
                                <span className="absolute left-3 top-2.5 text-gray-400">
                                    <Search className="h-5 w-5" />
                                </span>
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="পণ্য খুঁজুন..."
                                    className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-secondary text-black"
                                />
                            </div>

                            <button 
                                onClick={() => {
                                    setFormData(initialFormState);
                                    setFormMode('add');
                                    setViewMode('form');
                                }}
                                className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-800 transition flex items-center gap-2 shadow-sm whitespace-nowrap"
                            >
                                <Plus className="h-5 w-5" /> পণ্য যোগ করুন
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#F9FAFB] text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="p-4">পণ্যের বিবরণ</th>
                                    <th className="p-4">সোর্স</th>
                                    <th className="p-4">কোড / SKU</th>
                                    <th className="p-4">মূল্য</th>
                                    <th className="p-4">স্টক</th>
                                    <th className="p-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm">
                                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0 group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                                     <img src={product.image || 'https://via.placeholder.com/48'} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{product.category}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {product.status === 'Active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium"><span className="flex items-center gap-1 text-gray-600"><Home className="w-3.5 h-3.5" /> {product.source || 'Self'}</span></td>
                                        <td className="p-4 text-gray-500 font-mono">{product.sku || product.id.substring(0,6)}</td>
                                        <td className="p-4 font-bold text-gray-900">৳ {product.price}</td>
                                        <td className="p-4">
                                            {(product.stockQuantity || 0) > 0 ? (
                                                 <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full text-xs">{product.stockQuantity} Pcs</span>
                                            ) : (
                                                 <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-full text-xs">Stock Out</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2"> 
                                                <button onClick={() => handleEdit(product)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="এডিট করুন"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleClone(product)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition" title="কপি করুন"><Copy className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="মুছে ফেলুন"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-gray-500">
                                            কোনো পণ্য পাওয়া যায়নি
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Form View (Add / Edit) - Fully Restored */}
            {viewMode === 'form' && (
                <div className="animate-fade-in">
                    {/* Header Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-0 z-20 gap-4">
                        <div>
                             <h2 className="text-xl font-bold text-gray-800">{formMode === 'add' ? 'নতুন পণ্য যোগ করুন' : 'পণ্য এডিট করুন'}</h2>
                             <p className="text-sm text-gray-500">সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => setViewMode('list')}
                                className="flex-1 md:flex-none px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition"
                            >
                                বাতিল করুন
                            </button>
                            <button 
                                onClick={handleSaveProduct}
                                disabled={uploading}
                                className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-secondary text-white font-bold hover:bg-[#b0936a] flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-70"
                            >
                                {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                                সেভ করুন
                            </button>
                        </div>
                    </div>

                    {statusMessage && (
                        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 font-medium ${statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                            <AlertCircle className="h-5 w-5" /> {statusMessage.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* General Info */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2"><Package className="h-5 w-5 text-gray-500" /> সাধারণ তথ্য</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">পণ্যের নাম <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary bg-white text-black font-medium placeholder-gray-400"
                                            placeholder="পণ্যের নাম লিখুন..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">সংক্ষিপ্ত বিবরণ (Short Description)</label>
                                        <textarea 
                                            rows={2}
                                            value={formData.shortDescription} 
                                            onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary bg-white text-black placeholder-gray-400"
                                            placeholder="SEO এবং ছোট বিবরণের জন্য..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">বিস্তারিত বিবরণ</label>
                                        <textarea 
                                            rows={6}
                                            value={formData.description} 
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary bg-white text-black placeholder-gray-400"
                                            placeholder="পণ্যের বিস্তারিত বিবরণ লিখুন..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">ক্যাটাগরি</label>
                                        <select 
                                            value={formData.category} 
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary bg-white text-black font-medium"
                                        >
                                            {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Media Section */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-gray-500" /> পণ্যের ছবি ও ভিডিও</h3>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">ছবির লিংক</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-400"><LinkIcon className="h-5 w-5" /></span>
                                        <input 
                                            type="text" 
                                            value={formData.image} 
                                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:border-secondary bg-white text-black placeholder-gray-400"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>

                                {/* Preview Gallery */}
                                {formData.images && formData.images.length > 0 ? (
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group w-24 h-24 border rounded-lg overflow-hidden bg-white shadow-sm">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button onClick={() => handleRemoveImage(idx)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                                {img === formData.image && <span className="absolute bottom-0 left-0 right-0 bg-secondary text-white text-[10px] text-center font-bold py-0.5">মেইন</span>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    formData.image && (
                                        <div className="w-32 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 mb-4">
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">ভিডিও লিংক (অপশনাল)</label>
                                    <input 
                                        type="text" 
                                        value={formData.videoUrl} 
                                        onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-secondary bg-white text-black placeholder-gray-400"
                                        placeholder="YouTube বা Vimeo ভিডিও লিংক"
                                    />
                                </div>
                            </div>

                            {/* Dimensions & Weight */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3">ওজন ও পরিমাপ</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">ওজন (kg)</label>
                                        <input 
                                            type="text" 
                                            value={formData.weight}
                                            onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg p-3 bg-white text-black" placeholder="যেমন: ১.৫" 
                                        />
                                    </div>
                                </div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">পরিমাপ (cm) - দৈর্ঘ্য x প্রস্থ x উচ্চতা</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <input type="text" placeholder="L" value={formData.dimensions?.length} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions!, length: e.target.value}})} className="border border-gray-300 rounded-lg p-3 bg-white text-black" />
                                    <input type="text" placeholder="W" value={formData.dimensions?.width} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions!, width: e.target.value}})} className="border border-gray-300 rounded-lg p-3 bg-white text-black" />
                                    <input type="text" placeholder="H" value={formData.dimensions?.height} onChange={(e) => setFormData({...formData, dimensions: {...formData.dimensions!, height: e.target.value}})} className="border border-gray-300 rounded-lg p-3 bg-white text-black" />
                                </div>
                            </div>

                            {/* Variants */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3">প্রোডাক্ট ভেরিয়েন্ট</h3>
                                <p className="text-sm text-gray-500 mb-4">একাধিক ভেরিয়েন্ট যোগ করুন যেমন সাইজ, কালার ইত্যাদি।</p>
                                
                                {formData.variants?.map((variant, idx) => (
                                    <div key={idx} className="flex gap-4 mb-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-600 mb-1">নাম (যেমন: সাইজ)</label>
                                            <input 
                                                type="text" 
                                                value={variant.name}
                                                onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                                                className="w-full border border-gray-300 rounded p-2 bg-white text-black text-sm"
                                            />
                                        </div>
                                        <div className="flex-[2]">
                                            <label className="block text-xs font-bold text-gray-600 mb-1">অপশন (যেমন: লাল, নীল)</label>
                                            <input 
                                                type="text" 
                                                value={variant.options}
                                                onChange={(e) => updateVariant(idx, 'options', e.target.value)}
                                                className="w-full border border-gray-300 rounded p-2 bg-white text-black text-sm"
                                                placeholder="কমা দিয়ে আলাদা করুন"
                                            />
                                        </div>
                                        <button onClick={() => removeVariant(idx)} className="p-2 bg-red-100 text-red-500 rounded hover:bg-red-200"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                ))}

                                <button onClick={addVariant} className="text-sm text-secondary font-bold flex items-center gap-1 hover:underline mt-2">
                                    <Plus className="h-4 w-4" /> নতুন ভেরিয়েন্ট যোগ করুন
                                </button>
                            </div>

                        </div>

                        {/* Right Column - Meta Info */}
                        <div className="space-y-6">
                            
                            {/* Status */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider border-b pb-2">প্রোডাক্ট স্ট্যাটাস</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'Active'})}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${formData.status === 'Active' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        সক্রিয়
                                    </button>
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'Inactive'})}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${formData.status === 'Inactive' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        নিষ্ক্রিয়
                                    </button>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider border-b pb-2">মূল্য নির্ধারণ</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">বিক্রয় মূল্য *</label>
                                        <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">রেগুলার মূল্য (ডিসকাউন্টের আগে)</label>
                                        <input type="number" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">কেনা দাম (অপশনাল)</label>
                                        <input type="number" value={formData.buyingPrice} onChange={(e) => setFormData({...formData, buyingPrice: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black" />
                                    </div>
                                </div>
                            </div>

                            {/* Inventory */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider border-b pb-2">স্টক ও ইনভেন্টরি</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">SKU</label>
                                            <input type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">সিরিয়াল</label>
                                            <input type="text" value={formData.productSerial} onChange={(e) => setFormData({...formData, productSerial: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">স্টক পরিমাণ</label>
                                            <input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">ইউনিট</label>
                                            <input type="text" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black" placeholder="pcs" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">সোর্স</label>
                                        <select value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black">
                                            <option value="Self">Self</option>
                                            <option value="Vendor">Vendor</option>
                                            <option value="Daraz">Daraz</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">ওয়ারেন্টি</label>
                                        <input type="text" value={formData.warranty} onChange={(e) => setFormData({...formData, warranty: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black" />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider border-b pb-2">ডেলিভারি চার্জ</h3>
                                <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded cursor-pointer" onClick={() => setFormData({...formData, deliveryCharge: { ...formData.deliveryCharge!, isDefault: !formData.deliveryCharge?.isDefault }})}>
                                    <button 
                                        className="text-secondary"
                                    >
                                        {formData.deliveryCharge?.isDefault ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                    </button>
                                    <span className="text-sm font-bold text-gray-700">ডিফল্ট চার্জ প্রযোজ্য</span>
                                </div>
                                {!formData.deliveryCharge?.isDefault && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">কাস্টম চার্জ (টাকা)</label>
                                        <input 
                                            type="number" 
                                            value={formData.deliveryCharge?.amount} 
                                            onChange={(e) => setFormData({...formData, deliveryCharge: { isDefault: false, amount: Number(e.target.value) }})} 
                                            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-black"
                                        />
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
          </div>
        )}
        
        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
             <div className="space-y-6 animate-fade-in">
                
                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">অর্ডার ম্যানেজমেন্ট</h2>
                        <p className="text-gray-500 text-sm">সকল অর্ডারের তালিকা এবং স্ট্যাটাস</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="অর্ডার আইডি / ফোন..." 
                                value={orderSearch}
                                onChange={(e) => setOrderSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* TODAY'S Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">আজকের অর্ডার</p>
                        <h3 className="text-2xl font-bold text-blue-600">{stats.today.count}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">কনফার্ম</p>
                        <h3 className="text-2xl font-bold text-indigo-600">{stats.today.confirmed}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">পেন্ডিং</p>
                        <h3 className="text-2xl font-bold text-orange-600">{stats.today.pending}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">ক্যানসেল</p>
                        <h3 className="text-2xl font-bold text-red-600">{stats.today.canceled}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">ডেলিভার্ড</p>
                        <h3 className="text-2xl font-bold text-green-600">{stats.today.delivered}</h3>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-2">
                    {orderStatuses.map(status => (
                        <button 
                            key={status}
                            onClick={() => setOrderFilter(status)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${orderFilter === status ? 'bg-secondary text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Order Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase border-b border-gray-200">
                                <tr>
                                    <th className="p-4 w-12">SL</th>
                                    <th className="p-4 w-24">Order ID</th>
                                    <th className="p-4 w-32">Date & Time</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Items</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                                {filteredOrders.length > 0 ? filteredOrders.map((order, idx) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-gray-500">{idx + 1}</td>
                                        <td className="p-4 font-mono font-bold text-primary">#{order.id}</td>
                                        <td className="p-4 text-xs text-gray-500">
                                            <div>{order.createdAt?.toDate().toLocaleDateString()}</div>
                                            <div>{order.createdAt?.toDate().toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{order.customerName}</div>
                                            <div className="text-xs text-gray-500">{order.customerPhone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs space-y-1">
                                                {order.items.slice(0, 2).map((item, i) => (
                                                    <div key={i} className="flex items-center gap-1">
                                                        <span className="bg-gray-200 text-gray-700 px-1 rounded text-[10px]">{item.quantity}x</span>
                                                        <span className="truncate w-24">{item.name}</span>
                                                    </div>
                                                ))}
                                                {order.items.length > 2 && <span className="text-xs text-gray-400">+{order.items.length - 2} more</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">৳ {order.totalAmount}</td>
                                        <td className="p-4">
                                            <select 
                                                value={order.status}
                                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                                className={`text-xs font-bold border rounded px-2 py-1 focus:outline-none cursor-pointer ${
                                                    order.status === 'Pending' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                                                    order.status === 'Delivered' ? 'text-green-600 border-green-200 bg-green-50' :
                                                    order.status === 'Cancelled' ? 'text-red-600 border-red-200 bg-red-50' :
                                                    'text-blue-600 border-blue-200 bg-blue-50'
                                                }`}
                                            >
                                                {orderStatuses.slice(1).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditOrder(order)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded" title="View Details"><Eye className="h-4 w-4" /></button>
                                                <button onClick={() => handlePrintInvoice(order)} className="p-1.5 hover:bg-gray-100 text-gray-600 rounded" title="Download Invoice"><Printer className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-gray-400">কোনো অর্ডার পাওয়া যায়নি</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
           </div>
        )}

        {/* --- CUSTOMERS TAB --- */}
        {activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800">কাস্টমার তালিকা</h2>
                    <p className="text-gray-500 text-sm">আপনার সকল রেজিস্টার্ড এবং গেস্ট কাস্টমার</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase border-b border-gray-200">
                             <tr>
                                <th className="p-4">Customer Info</th>
                                <th className="p-4">Orders</th>
                                <th className="p-4 text-center">Total Sales</th>
                                <th className="p-4 text-center">Delivered</th>
                                <th className="p-4 text-center">Canceled</th>
                                <th className="p-4 text-center">Pending</th>
                             </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                            {customers.map((customer, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{customer.name}</div>
                                        <div className="text-xs text-gray-500">{customer.phone}</div>
                                        <div className="text-[10px] text-gray-400 truncate w-40">{customer.address}</div>
                                    </td>
                                    <td className="p-4 text-xs">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{customer.orders.length} টি অর্ডার</span>
                                    </td>
                                    <td className="p-4 text-center font-bold text-primary">৳ {customer.totalSales}</td>
                                    <td className="p-4 text-center"><span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">{customer.delivered}</span></td>
                                    <td className="p-4 text-center"><span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">{customer.canceled}</span></td>
                                    <td className="p-4 text-center"><span className="text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded">{customer.pending}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>

      {/* --- ORDER VIEW/EDIT MODAL (Redesigned with Full Edit Capabilities) --- */}
      {selectedOrder && editOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
              
              {/* Header */}
              <div className="bg-primary p-4 flex justify-between items-center text-white shrink-0">
                  <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-secondary" />
                      <div>
                          <h2 className="text-lg font-bold flex items-center gap-2">
                              অর্ডার #{editOrderData.id}
                              {!isEditingOrder && (
                                  <button onClick={() => setIsEditingOrder(true)} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-xs font-normal flex items-center gap-1">
                                      <Edit className="h-3 w-3" /> এডিট
                                  </button>
                              )}
                          </h2>
                          <p className="text-xs opacity-80 font-mono">{editOrderData.createdAt?.toDate().toLocaleString()}</p>
                      </div>
                  </div>
                  <button onClick={() => { setSelectedOrder(null); setIsEditingOrder(false); }} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-white">
                      <X className="h-5 w-5" />
                  </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto bg-gray-50 flex-1 space-y-6">
                  
                  {/* Row 1: Customer Info & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Customer Details */}
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> কাস্টমার তথ্য</h3>
                          <div className="space-y-3 text-sm">
                              {isEditingOrder ? (
                                  <>
                                      <input type="text" value={editOrderData.customerName} onChange={e => setEditOrderData({...editOrderData, customerName: e.target.value})} className="w-full border border-gray-300 p-2 rounded bg-white" placeholder="নাম" />
                                      <input type="text" value={editOrderData.customerPhone} onChange={e => setEditOrderData({...editOrderData, customerPhone: e.target.value})} className="w-full border border-gray-300 p-2 rounded bg-white" placeholder="ফোন" />
                                      <textarea value={editOrderData.customerAddress} onChange={e => setEditOrderData({...editOrderData, customerAddress: e.target.value})} className="w-full border border-gray-300 p-2 rounded bg-white" placeholder="ঠিকানা" />
                                  </>
                              ) : (
                                  <>
                                      <p><span className="text-gray-500">নাম:</span> <span className="font-bold">{editOrderData.customerName}</span></p>
                                      <p><span className="text-gray-500">ফোন:</span> {editOrderData.customerPhone}</p>
                                      <p><span className="text-gray-500">ঠিকানা:</span> {editOrderData.customerAddress}</p>
                                  </>
                              )}
                          </div>
                      </div>

                      {/* Order Status & Actions */}
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2"><Truck className="h-4 w-4" /> অর্ডার স্ট্যাটাস</h3>
                          <div className="space-y-4">
                              <select 
                                  value={editOrderData.status} 
                                  onChange={(e) => setEditOrderData({...editOrderData, status: e.target.value})}
                                  disabled={!isEditingOrder}
                                  className={`w-full border border-gray-300 rounded p-2 text-sm font-bold bg-white focus:border-secondary focus:outline-none ${!isEditingOrder && 'opacity-70 bg-gray-50 cursor-not-allowed'}`}
                              >
                                  {orderStatuses.slice(1).map(status => (
                                      <option key={status} value={status}>{status}</option>
                                  ))}
                              </select>
                              
                              {!isEditingOrder && (
                                  <div className="flex gap-2">
                                      <button onClick={() => handlePrintInvoice(editOrderData)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-bold text-xs flex items-center justify-center gap-2">
                                          <Printer className="h-4 w-4" /> ইনভয়েস
                                      </button>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Row 2: Product List & Editing */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="font-bold text-gray-700 text-sm">অর্ডারকৃত পণ্য</h3>
                          {isEditingOrder && (
                              <div className="relative">
                                  <input 
                                      type="text" 
                                      placeholder="পণ্য যোগ করুন (Search)" 
                                      className="border rounded-lg pl-2 pr-8 py-1 text-xs w-48 focus:outline-none focus:border-primary bg-white"
                                      value={productSearchForOrder}
                                      onChange={(e) => setProductSearchForOrder(e.target.value)}
                                  />
                                  {productSearchForOrder && (
                                      <div className="absolute top-full right-0 w-64 bg-white border shadow-lg max-h-40 overflow-y-auto z-10 mt-1 rounded">
                                          {products.filter(p => p.name.toLowerCase().includes(productSearchForOrder.toLowerCase())).map(p => (
                                              <div 
                                                  key={p.id} 
                                                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-xs"
                                                  onClick={() => addProductToOrder(p)}
                                              >
                                                  <img src={p.image} className="w-6 h-6 rounded" />
                                                  <div className="truncate flex-1">{p.name}</div>
                                                  <div className="font-bold">৳{p.price}</div>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                      <table className="w-full text-left">
                          <thead className="text-xs text-gray-500 bg-gray-50 border-b">
                              <tr>
                                  <th className="p-3">পণ্য</th>
                                  <th className="p-3 text-center">পরিমাণ</th>
                                  <th className="p-3 text-right">মোট</th>
                                  {isEditingOrder && <th className="p-3 text-right">Action</th>}
                              </tr>
                          </thead>
                          <tbody className="text-sm">
                              {editOrderData.items.map((item: any, idx: number) => (
                                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                                      <td className="p-3">
                                          <div className="flex items-center gap-2">
                                              <img src={item.image} alt="" className="w-10 h-10 rounded object-cover border border-gray-100" />
                                              <div>
                                                  <p className="font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                                  <p className="text-xs text-gray-500">৳ {item.price}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="p-3 text-center">
                                          {isEditingOrder ? (
                                              <div className="flex items-center justify-center border rounded w-fit mx-auto bg-white">
                                                  <button onClick={() => updateEditOrderItemQuantity(idx, -1)} className="px-2 hover:bg-gray-100">-</button>
                                                  <span className="px-2 font-bold text-xs">{item.quantity}</span>
                                                  <button onClick={() => updateEditOrderItemQuantity(idx, 1)} className="px-2 hover:bg-gray-100">+</button>
                                              </div>
                                          ) : (
                                              <span className="font-bold">x {item.quantity}</span>
                                          )}
                                      </td>
                                      <td className="p-3 text-right font-bold text-gray-800">
                                          ৳ {item.price * item.quantity}
                                      </td>
                                      {isEditingOrder && (
                                          <td className="p-3 text-right">
                                              <button onClick={() => updateEditOrderItemQuantity(idx, -100)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="h-4 w-4" /></button>
                                          </td>
                                      )}
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>

                  {/* Row 3: Financials & Save */}
                  <div className="flex justify-end">
                      <div className="w-full md:w-1/2 bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                              <span>সাবটোটাল</span>
                              <span>৳ {editOrderData.items.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>ডেলিভারি চার্জ</span>
                              {isEditingOrder ? (
                                  <input 
                                      type="number" 
                                      className="border border-gray-300 rounded p-1 w-20 text-right font-bold bg-white" 
                                      value={editOrderData.shippingCost} 
                                      onChange={(e) => setEditOrderData({...editOrderData, shippingCost: Number(e.target.value)})}
                                  />
                              ) : (
                                  <span>+ ৳ {editOrderData.shippingCost}</span>
                              )}
                          </div>

                          <div className="flex justify-between items-center text-sm text-green-600">
                              <span>ডিসকাউন্ট</span>
                              {isEditingOrder ? (
                                  <input 
                                      type="number" 
                                      className="border rounded p-1 w-20 text-right font-bold border-green-200 bg-white" 
                                      value={editOrderData.discount || 0} 
                                      onChange={(e) => setEditOrderData({...editOrderData, discount: Number(e.target.value)})}
                                  />
                              ) : (
                                  <span>- ৳ {editOrderData.discount || 0}</span>
                              )}
                          </div>

                          <div className="flex justify-between pt-3 border-t border-dashed text-lg font-bold text-primary mt-2">
                              <span>সর্বমোট</span>
                              <span>৳ {calculateEditOrderTotal()}</span>
                          </div>

                          {isEditingOrder && (
                              <button 
                                  onClick={saveOrderChanges}
                                  className="w-full mt-4 bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                              >
                                  <Save className="h-4 w-4" /> সেইভ করুন
                              </button>
                          )}
                      </div>
                  </div>

              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;