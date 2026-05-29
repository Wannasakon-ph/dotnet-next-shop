"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import CartItem from "../components/CartItem";
import ClearCartButton from "../components/Cleaecart";

interface Product {
  id: number;
  productName: string;
  price: number;
}

interface StockProduct {
  id: number;
  productId: number;
  product: Product;
  stockQuantity: number;
}

interface CartItemData {
  id: number;
  idStockProduct: number;
  stockProduct: StockProduct;
  totalQuantity: number;
  totalPrice: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // แจ้งเตือน Toast สั้นๆ
  const showToast = useCallback((message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // โหลดรายการตะกร้าสินค้า
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error(err);
      showToast("ไม่สามารถโหลดรายการตะกร้าสินค้าได้", true);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // โหลดข้อมูลเมื่อเปิดหน้าจอ
  useEffect(() => {
    const timer = setTimeout(() => fetchCart(), 0);
    return () => clearTimeout(timer);
  }, [fetchCart]);

  // อัปเดตปริมาณสินค้าในตะกร้า
  async function handleUpdateQuantity(cartId: number, newQuantity: number) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cartId, totalQuantity: newQuantity })
      });

      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || "อัปเดตจำนวนล้มเหลว", true);
      } else {
        await fetchCart();
      }
    } catch (err) {
      console.error(err);
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", true);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveItem(cartId: number) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/cart?id=${cartId}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || "ลบสินค้าล้มเหลว", true);
      } else {
        showToast("ลบสินค้าออกจากตะกร้าเรียบร้อยแล้ว");
        await fetchCart();
      }
    } catch (err) {
      console.error(err);
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", true);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckout() {
    if (cartItems.length === 0) return;
    setActionLoading(true);
    
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout" })
      });

      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || "การสั่งซื้อและตัดสต็อกล้มเหลว", true);
      } else {
        setCartItems([]);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error(err);
      showToast("เกิดข้อผิดพลาดในการทำรายการ", true);
    } finally {
      setActionLoading(false);
    }
  }

  const totalItems = cartItems.reduce((acc, item) => acc + item.totalQuantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  return (
    <div className="min-h-screen bg-zinc-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-100 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-emerald-100">
              ✔️
            </div>
            <h3 className="text-2xl font-black text-zinc-800 mb-2">สั่งซื้อสำเร็จ!</h3>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              ระบบได้ทำการตรวจสอบสต็อกและอัปเดตจำนวนสินค้าคงคลัง (Stock Quantity) ในระบบสำเร็จเสร็จสิ้นเรียบร้อยแล้ว
            </p>
            <Link href="/" onClick={() => setShowSuccessModal(false)} className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all text-center">
              กลับไปช้อปปิ้งต่อ
            </Link>
          </div>
        </div>
      )}

      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-xl shadow-2xl border transition-all duration-300 transform scale-100 ${
          notification.isError
            ? "bg-red-50/90 backdrop-blur-md border-red-200 text-red-800"
            : "bg-emerald-50/90 backdrop-blur-md border-emerald-200 text-emerald-800"
        }`}>
          <span className="mr-3 font-semibold text-lg">{notification.isError ? "⚠️" : "✨"}</span>
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-600 font-semibold text-sm transition-colors">
            <ArrowLeftIcon />
            กลับสู่หน้ารายการสินค้า
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-black">
            ตะกร้าสินค้าของคุณ <span className="text-zinc-400 font-normal">({totalItems} รายการ)</span>
          </h1>
          {cartItems.length > 0 && (
            <ClearCartButton onClearSuccess={fetchCart} />
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Spinner />
            <p>กำลังโหลดข้อมูลตะกร้าสินค้า...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white border border-zinc-100 rounded-3xl p-12 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              🛒
            </div>
            <h2 className="text-2xl font-bold text-zinc-800 mb-2">ไม่มีสินค้าในตะกร้าของคุณ</h2>
            <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all">
              เลือกดูสินค้า
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  isLoading={actionLoading}
                />
              ))}
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm sticky top-6">
              <h3 className="font-extrabold text-zinc-800 text-xl border-b border-zinc-100 pb-4 mb-5">
                สรุปคำสั่งซื้อ
              </h3>

              <div className="flex justify-between items-center mb-4 text-zinc-500 text-sm font-semibold">
                <span>จำนวนสินค้าทั้งหมด:</span>
                <span className="text-zinc-800 font-extrabold text-base">{totalItems} ชิ้น</span>
              </div>

              <div className="flex justify-between items-center mb-6 text-zinc-500 text-sm font-semibold">
                <span>ค่าจัดส่ง:</span>
                <span className="text-emerald-600 font-extrabold text-sm">ฟรี!</span>
              </div>

              <div className="border-t border-zinc-100 pt-5 mb-8">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-bold text-zinc-800 text-base">ยอดชำระสุทธิ</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-indigo-600">{totalPrice.toLocaleString()}</span>
                    <span className="text-sm font-extrabold text-zinc-400 ml-1">บาท</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 text-right font-medium">รวมภาษีมูลค่าเพิ่มแล้ว</p>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={actionLoading || cartItems.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] transform active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <Spinner />
                    กำลังบันทึกและตัดคลังสินค้า...
                  </>
                ) : (
                  <>
                    <SuccessCheckoutIcon />
                    ยืนยันการสั่งซื้อ
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}


function ArrowLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function SuccessCheckoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
