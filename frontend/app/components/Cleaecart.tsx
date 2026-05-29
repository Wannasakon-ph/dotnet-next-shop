"use client";

import { useState } from "react";

interface ClearCartButtonProps {
  onClearSuccess: () => void;
}

export default function ClearCartButton({ onClearSuccess }: ClearCartButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      const res = await fetch("/api/cart?clear=true", {
        method: "DELETE",
      });

      if (res.ok) {
        setShowConfirmCard(false);
        onClearSuccess(); 
        setShowSuccessCard(true);
        setTimeout(() => {
          setShowSuccessCard(false);
        }, 2000);
      } else {
        alert("เกิดข้อผิดพลาดในการล้างตะกร้า");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmCard(true)}
        className="text-red-600 hover:text-red-800 text-sm font-medium underline"
      >
        ล้างตะกร้าทั้งหมด
      </button>

      {showConfirmCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-sm animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ยืนยันการล้างตะกร้า?
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              สินค้าทั้งหมดในตะกร้าของคุณจะถูกลบทิ้ง คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmCard(false)}
                disabled={isClearing}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {isClearing ? "กำลังลบ..." : "ใช่, ลบทั้งหมด"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-xs text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              ล้างตะกร้าสำเร็จ
            </h3>
          </div>
        </div>
      )}
    </>
  );
}