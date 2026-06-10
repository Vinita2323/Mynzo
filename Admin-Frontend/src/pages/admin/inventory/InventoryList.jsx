import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Package, Edit3, Trash2,
  CheckCircle2, XCircle, AlertTriangle, ChevronDown,
  ArrowUpDown, Download, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/ConfirmModal';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Beauty', 'Home & Kitchen', 'Toys', 'Stationery', 'Jewellery', 'Gifting', 'Electrical'];
const STATUSES = ['All', 'Approved', 'Pending', 'Out of Stock'];

const statusConfig = {
  Approved: { label: 'Approved', color: 'bg-green-50 text-green-600 border-green-100' },
  Pending: { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  'Out of Stock': { label: 'Out of Stock', color: 'bg-red-50 text-red-500 border-red-100' },
};

// Rich mock product data based on Frontend's CRAZY_DEALS data structure
const MOCK_PRODUCTS = [
  { id: 'P001', name: 'Oversized Tee', category: 'Fashion', price: 599, originalPrice: 999, stock: 120, sales: 245, status: 'Approved', discount: '-40%', sku: 'FSH-001' },
  { id: 'P002', name: 'Layered Necklace', category: 'Jewellery', price: 699, originalPrice: 999, stock: 85, sales: 130, status: 'Approved', discount: '-30%', sku: 'JWL-001' },
  { id: 'P003', name: 'Vintage Watch', category: 'Jewellery', price: 1499, originalPrice: 2999, stock: 40, sales: 97, status: 'Approved', discount: '-50%', sku: 'JWL-002' },
  { id: 'P004', name: 'Benetint Lip Tint', category: 'Beauty', price: 1299, originalPrice: 1999, stock: 200, sales: 312, status: 'Approved', discount: '-35%', sku: 'BTY-001' },
  { id: 'P005', name: 'Pink Lip Gloss', category: 'Beauty', price: 899, originalPrice: 1199, stock: 180, sales: 210, status: 'Approved', discount: '-20%', sku: 'BTY-002' },
  { id: 'P006', name: 'Peptide Serum', category: 'Beauty', price: 2499, originalPrice: 2999, stock: 60, sales: 88, status: 'Approved', discount: '-15%', sku: 'BTY-003' },
  { id: 'P007', name: 'Sunscreen SPF 50', category: 'Beauty', price: 599, originalPrice: 799, stock: 150, sales: 175, status: 'Approved', discount: '-25%', sku: 'BTY-004' }
];

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 leading-tight">{value}</h3>
      {sub && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function InventoryList() {
  const navigate = useNavigate();
  const [dbProducts, setDbProducts] = useState([]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [flagFilter, setFlagFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [editingStock, setEditingStock] = useState(null);
  const [stockValue, setStockValue] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Confirm Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  const triggerConfirm = (title, message, action) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const fetchProducts = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/admin/catalog/products`);
      const data = await res.json();
      if (res.ok && data.success) {
        setDbProducts(data.products.map(p => ({
          id: p._id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          price: p.sellingPrice,
          originalPrice: p.mrp,
          stock: p.stock,
          sales: p.sales,
          status: p.status,
          discount: p.discountLabel,
          image: p.images && p.images[0] ? p.images[0] : '',
          flags: p.flags || { topSection: false, crazyDeals: false, flashSale: false }
        })));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products from server');
    }
  };

  const handleExport = () => {
    if (allProductsCombined.length === 0) {
      toast.error('No products to export');
      return;
    }
    const headers = ['ID', 'SKU', 'Name', 'Category', 'Price (INR)', 'Original Price (INR)', 'Stock', 'Sales', 'Status', 'Discount'];
    const rows = allProductsCombined.map(p => [
      p.id || '',
      p.sku || '',
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.category || '',
      p.price || 0,
      p.originalPrice || 0,
      p.stock || 0,
      p.sales || 0,
      p.status || '',
      p.discount || ''
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory exported successfully!');
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Show only database products
  const allProductsCombined = dbProducts;

  // Stats
  const totalProducts = allProductsCombined.length;
  const approvedCount = allProductsCombined.filter(p => p.status === 'Approved').length;
  const pendingCount = allProductsCombined.filter(p => p.status === 'Pending').length;
  const outOfStockCount = allProductsCombined.filter(p => p.stock === 0 || p.status === 'Out of Stock').length;

  // Filter
  const filtered = allProductsCombined
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      
      let matchFlag = true;
      if (flagFilter === 'Top Selection') {
        matchFlag = p.flags?.topSection === true;
      } else if (flagFilter === 'Crazy Deals') {
        matchFlag = p.flags?.crazyDeals === true;
      } else if (flagFilter === 'Flash Sale') {
        matchFlag = p.flags?.flashSale === true;
      }
      
      return matchSearch && matchCat && matchStatus && matchFlag;
    })
    .sort((a, b) => {
      let valA = a[sortBy], valB = b[sortBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(p => p.id));
  };

  const handleDeleteProduct = async (id) => {
    triggerConfirm(
      'Delete Product',
      'Are you sure you want to permanently delete this product from your inventory?',
      async () => {
        if (String(id).startsWith('P0')) {
          toast.success('Mock product removed');
          return;
        }
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        try {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${apiBase}/admin/catalog/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            toast.success('Product deleted successfully');
            fetchProducts();
          } else {
            toast.error(data.message || 'Failed to delete product');
          }
        } catch (err) {
          console.error(err);
          toast.error('Could not connect to backend server');
        }
      }
    );
  };

  const handleApproveProduct = async (id) => {
    if (String(id).startsWith('P0')) {
      toast.success('Mock product approved');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/admin/catalog/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Approved' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Product approved successfully');
        fetchProducts();
      } else {
        toast.error(data.message || 'Failed to approve product');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not connect to backend server');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    toast.loading('Approving selected products...', { id: 'bulk-action' });
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const promises = selectedIds.map(id => {
        if (String(id).startsWith('P0')) return Promise.resolve();
        return fetch(`${apiBase}/admin/catalog/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'Approved' })
        });
      });
      await Promise.all(promises);
      toast.dismiss('bulk-action');
      toast.success('Selected products approved successfully');
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.dismiss('bulk-action');
      toast.error('Bulk approval failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    triggerConfirm(
      'Delete Selected Products',
      `Are you sure you want to permanently delete all ${selectedIds.length} selected products?`,
      async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        toast.loading('Deleting selected products...', { id: 'bulk-action' });
        try {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const promises = selectedIds.map(id => {
            if (String(id).startsWith('P0')) return Promise.resolve();
            return fetch(`${apiBase}/admin/catalog/products/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          });
          await Promise.all(promises);
          toast.dismiss('bulk-action');
          toast.success('Selected products deleted successfully');
          setSelectedIds([]);
          fetchProducts();
        } catch (err) {
          console.error(err);
          toast.dismiss('bulk-action');
          toast.error('Bulk deletion failed');
        }
      }
    );
  };

  const handleSaveStock = async (id, newStock) => {
    if (String(id).startsWith('P0')) {
      toast.success('Mock product stock updated');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/admin/catalog/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Stock updated successfully');
        fetchProducts();
      } else {
        toast.error(data.message || 'Failed to update stock');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not connect to backend server');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (
      imagePath.startsWith('http://') || 
      imagePath.startsWith('https://') || 
      imagePath.startsWith('data:') ||
      imagePath.startsWith('/src/') ||
      imagePath.startsWith('/assets/')
    ) {
      return imagePath;
    }
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const SortIcon = ({ col }) => (
    <ArrowUpDown size={13} className={`ml-1 inline ${sortBy === col ? 'text-[#ee4923]' : 'text-slate-300'}`} />
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight font-montserrat">Products</h1>
          <p className="text-slate-500 font-medium mt-1 font-raleway">Manage all inventory, stock levels and product status.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={15} />
            Export
          </button>
          <button
            onClick={() => navigate('/admin/inventory/add')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ee4923] text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={totalProducts} sub="In Inventory" icon={Package} color="bg-orange-50 text-[#ee4923]" />
        <StatCard label="Live / Approved" value={approvedCount} sub="Currently active" icon={CheckCircle2} color="bg-green-50 text-green-500" />
        <StatCard label="Pending Review" value={pendingCount} sub="Awaiting approval" icon={AlertTriangle} color="bg-amber-50 text-amber-500" />
        <StatCard label="Out of Stock" value={outOfStockCount} sub="Needs restock" icon={XCircle} color="bg-red-50 text-red-400" />
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ee4923] transition-colors" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-5 text-sm font-bold focus:ring-4 focus:ring-orange-50 outline-none transition-all text-slate-900 placeholder:text-slate-300"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-100 rounded-xl py-3 pl-4 pr-10 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-50 transition-all cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-100 rounded-xl py-3 pl-4 pr-10 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-50 transition-all cursor-pointer"
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Deal / Section Filter */}
          <div className="relative">
            <select
              value={flagFilter}
              onChange={e => setFlagFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-100 rounded-xl py-3 pl-4 pr-10 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-50 transition-all cursor-pointer"
            >
              {['All Deals', 'Top Selection', 'Crazy Deals', 'Flash Sale'].map(f => <option key={f}>{f}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={() => { setSearch(''); setCategoryFilter('All'); setStatusFilter('All'); setFlagFilter('All'); }}
            className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                <span className="text-[11px] font-black text-[#ee4923] uppercase tracking-widest">{selectedIds.length} selected</span>
                <button 
                  onClick={handleBulkApprove}
                  className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-black border border-green-100 hover:bg-green-100 transition-all"
                >
                  Approve All
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-black border border-red-100 hover:bg-red-100 transition-all"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <p className="text-sm font-black text-slate-900">
            {filtered.length} <span className="font-medium text-slate-400">results</span>
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Inventory</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                <th className="px-5 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                  />
                </th>
                <th onClick={() => toggleSort('sku')} className="px-3 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                  SKU <SortIcon col="sku" />
                </th>
                <th onClick={() => toggleSort('name')} className="px-3 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none min-w-[180px]">
                  Product <SortIcon col="name" />
                </th>
                <th onClick={() => toggleSort('category')} className="px-3 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                  Category <SortIcon col="category" />
                </th>
                <th onClick={() => toggleSort('price')} className="px-3 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                  Price <SortIcon col="price" />
                </th>
                <th onClick={() => toggleSort('stock')} className="px-3 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                  Stock <SortIcon col="stock" />
                </th>
                <th onClick={() => toggleSort('sales')} className="px-3 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                  Sales <SortIcon col="sales" />
                </th>
                <th onClick={() => toggleSort('status')} className="px-3 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                  Status <SortIcon col="status" />
                </th>
                <th className="px-3 py-3.5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest pr-5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filtered.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock <= 20;
                  const isOutOfStock = product.stock === 0 || product.status === 'Out of Stock';
                  const statusInfo = statusConfig[isOutOfStock ? 'Out of Stock' : product.status] || statusConfig['Pending'];

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                        />
                      </td>

                      {/* SKU */}
                      <td className="px-3 py-4">
                        <span className="text-[11px] font-black text-slate-400 font-roboto">{product.sku || product.id}</span>
                      </td>

                      {/* Product */}
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                            {product.image ? (
                              <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={16} className="text-[#ee4923]" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none">{product.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                              {product.discount && (
                                <span className="text-[9px] font-black text-[#ee4923]">{product.discount} OFF</span>
                              )}
                              {product.flags?.topSection && (
                                <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-1 py-0.5 rounded border border-blue-100 uppercase tracking-tight scale-95 origin-left">Top</span>
                              )}
                              {product.flags?.crazyDeals && (
                                <span className="text-[8px] font-black bg-purple-50 text-purple-600 px-1 py-0.5 rounded border border-purple-100 uppercase tracking-tight scale-95 origin-left">Crazy</span>
                              )}
                              {product.flags?.flashSale && (
                                <span className="text-[8px] font-black bg-rose-50 text-rose-600 px-1 py-0.5 rounded border border-rose-100 uppercase tracking-tight scale-95 origin-left">Flash</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-3 py-4">
                        <div>
                          <p className="text-sm font-black text-slate-900">₹{product.price?.toLocaleString()}</p>
                          {product.originalPrice && (
                            <p className="text-[10px] text-slate-400 font-medium line-through">₹{product.originalPrice?.toLocaleString()}</p>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-3 py-4">
                        {editingStock === product.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={stockValue}
                              onChange={e => setStockValue(e.target.value)}
                              className="w-16 border border-orange-200 rounded-lg py-1 px-2 text-xs font-black outline-none focus:ring-2 focus:ring-orange-100"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                handleSaveStock(product.id, Number(stockValue));
                                setEditingStock(null);
                              }}
                              className="p-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all"
                            >
                              <CheckCircle2 size={12} />
                            </button>
                            <button
                              onClick={() => setEditingStock(null)}
                              className="p-1 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-all"
                            >
                              <XCircle size={12} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => { setEditingStock(product.id); setStockValue(product.stock || 0); }}
                            className="flex items-center gap-1.5 cursor-pointer group/stock"
                          >
                            <span className={`text-sm font-black ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-slate-900'}`}>
                              {product.stock ?? 0}
                            </span>
                            {isLowStock && !isOutOfStock && (
                              <AlertTriangle size={11} className="text-amber-400 shrink-0" />
                            )}
                            <Edit3 size={10} className="text-slate-300 opacity-0 group-hover/stock:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </td>

                      {/* Sales */}
                      <td className="px-3 py-4">
                        <span className="text-sm font-black text-slate-700">{product.sales ?? 0}</span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${statusInfo.color}`}>
                          {isOutOfStock ? 'Out of Stock' : product.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4 pr-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/admin/inventory/edit/${product.id}`)}
                            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-500 transition-all"
                            title="Edit Product"
                          >
                            <Edit3 size={14} />
                          </button>
                          {product.status === 'Pending' && (
                            <button
                              onClick={() => handleApproveProduct(product.id)}
                              className="p-2 bg-green-50 text-green-500 rounded-lg hover:bg-green-100 transition-all"
                              title="Approve"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                <Package size={36} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-900">No Products Found</h3>
              <p className="text-slate-400 text-sm font-medium mt-2">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>

        {/* Table Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-xs font-bold text-slate-400">Showing {filtered.length} of {allProductsCombined.length} products</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total Stock Value: <span className="text-slate-700">₹{filtered.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0).toLocaleString()}</span>
              </span>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
        title={confirmTitle}
        message={confirmMessage}
      />
    </div>
  );
}
