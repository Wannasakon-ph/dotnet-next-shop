import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Product {
  id: number;
  productName: string;
  price: number;
  stockQuantity: number;
  stockProductId: number;
}

export default function Cardproduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [loadingAdd, setLoadingAdd] = useState<{ [key: number]: boolean }>({});
  const [notification, setNotification] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/product");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
      const initialQuantities: { [key: number]: number } = {};
      data.forEach((p: Product) => {
        initialQuantities[p.id] = p.stockQuantity > 0 ? 1 : 0;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      console.error(err);
      showToast("ไม่สามารถดึงข้อมูลสินค้าได้", true);
    }
  }, [showToast]);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data: { totalQuantity: number }[] = await res.json();
        const total = data.reduce((acc, item) => acc + item.totalQuantity, 0);
        setCartCount(total);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
      fetchCartCount();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProducts, fetchCartCount]);

  function handleQuantityChange(
    productId: number,
    change: number,
    maxStock: number,
  ) {
    const currentQty = quantities[productId] || 1;
    const newQty = currentQty + change;
    if (newQty >= 1 && newQty <= maxStock) {
      setQuantities({ ...quantities, [productId]: newQty });
    }
  }

  async function handleAddToCart(product: Product) {
    const qty = quantities[product.id] || 1;
    if (qty <= 0) return;

    setLoadingAdd({ ...loadingAdd, [product.id]: true });

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idStockProduct: product.stockProductId,
          totalQuantity: qty,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        showToast(result.error || "เกิดข้อผิดพลาดในการใส่ตะกร้า", true);
      } else {
        showToast(
          `เพิ่ม '${product.productName}' จำนวน ${qty} ชิ้นลงตะกร้าแล้ว`,
        );
        fetchCartCount();
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
      showToast("เกิดข้อผิดพลาดในการส่งข้อมูล", true);
    } finally {
      setLoadingAdd({ ...loadingAdd, [product.id]: false });
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 font-sans">
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-xl shadow-2xl border transition-all duration-300 transform scale-100 ${
            notification.isError
              ? "bg-red-50/90 backdrop-blur-md border-red-200 text-red-800"
              : "bg-emerald-50/90 backdrop-blur-md border-emerald-200 text-emerald-800"
          }`}
        >
          <span className="mr-3 font-semibold text-lg">
            {notification.isError ? "⚠️" : "✨"}
          </span>
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold">Product List</h1>
        </div>

        <Link
          href="/cart"
          className="relative flex items-center gap-2 bg-gradient-to-r from-zinc-900 to-black hover:from-blue-600 hover:to-indigo-600 text-white font-medium px-5 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-indigo-200/50 hover:scale-105"
        >
          <CartIcon />
          <span>ตะกร้าสินค้า</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce shadow">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <BoxIcon />
          <p>กำลังเชื่อมต่อ API และโหลดข้อมูลสินค้า...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => {
            const qtySelected = quantities[p.id] || 1;
            const isOutOfStock = p.stockQuantity === 0;
            const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= 3;

            return (
              <div
                key={p.id}
                className="group relative bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-indigo-50 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-300" />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100 uppercase tracking-wide">
                      ID: #{p.id}
                    </span>
                    {isOutOfStock ? (
                      <span className="bg-red-50 text-red-600 border border-red-100 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        🔴 สินค้าหมด
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm animate-pulse">
                        ⚠️ เหลือเพียง {p.stockQuantity} ชิ้น!
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        🟢 มีสินค้า: {p.stockQuantity} ชิ้น
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-zinc-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    {p.productName}
                  </h3>

                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span className="text-2xl font-extrabold text-indigo-600">
                      {p.price.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-zinc-400">
                      บาท
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between bg-zinc-50 p-2 rounded-2xl border border-zinc-100 mb-4">
                    <span className="text-xs font-bold text-zinc-500 ml-2">
                      จำนวนสินค้า:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(p.id, -1, p.stockQuantity)
                        }
                        disabled={isOutOfStock || qtySelected <= 1}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 font-bold disabled:opacity-30 disabled:hover:bg-white transition-colors shadow-sm"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-extrabold text-zinc-800 text-base">
                        {qtySelected}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(p.id, 1, p.stockQuantity)
                        }
                        disabled={
                          isOutOfStock || qtySelected >= p.stockQuantity
                        }
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 font-bold disabled:opacity-30 disabled:hover:bg-white transition-colors shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(p)}
                    disabled={isOutOfStock || loadingAdd[p.id]}
                    className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold transition-all duration-300 ${
                      isOutOfStock
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-indigo-200/50 transform active:scale-95"
                    }`}
                  >
                    {loadingAdd[p.id] ? (
                      <>
                        <Spinner />
                        กำลังบันทึก...
                      </>
                    ) : isOutOfStock ? (
                      "สินค้าหมดชั่วคราว"
                    ) : (
                      <>
                        <PlusIcon />
                        เพิ่มลงตะกร้าสินค้า
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CartIcon() {
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
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      className="w-16 h-16 animate-pulse mb-4 text-zinc-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
