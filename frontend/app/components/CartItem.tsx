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

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (cartId: number, newQuantity: number) => void;
  onRemove: (cartId: number) => void;
  isLoading: boolean;
}

export default function CartItem({ item, onUpdateQuantity, onRemove, isLoading }: CartItemProps) {
  const product = item.stockProduct?.product;
  const maxStock = item.stockProduct?.stockQuantity || 0;

  if (!product) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-zinc-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-14 h-14 bg-gradient-to-tr from-blue-50 to-indigo-50 border border-zinc-100 flex items-center justify-center rounded-2xl text-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>

        </div>
        <div>
          <h4 className="font-bold text-zinc-800 text-lg leading-tight mb-1">
            {product.productName}
          </h4>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-400">ราคา: {product.price.toLocaleString()} บาท</span>
            <span className="text-zinc-300">|</span>
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full">
              คงเหลือ: {maxStock} ชิ้น
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
        <div className="flex items-center gap-1.5 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.totalQuantity - 1)}
            disabled={isLoading || item.totalQuantity <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 font-bold disabled:opacity-30 transition-all shadow-sm"
          >
            -
          </button>
          
          <span className="w-8 text-center font-extrabold text-zinc-800">
            {item.totalQuantity}
          </span>
          
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.totalQuantity + 1)}
            disabled={isLoading || item.totalQuantity >= maxStock}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 font-bold disabled:opacity-30 transition-all shadow-sm"
          >
            +
          </button>
        </div>

        <div className="text-right min-w-[100px]">
          <span className="text-zinc-400 text-xs block">ราคารวม</span>
          <span className="text-lg font-black text-zinc-800">
            {item.totalPrice.toLocaleString()} <span className="text-xs font-semibold">บาท</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={isLoading}
          className="p-2.5 rounded-xl text-red-500 hover:text-white hover:bg-red-500 transition-all border border-transparent hover:border-red-600 active:scale-95 disabled:opacity-30"
          title="ลบออกจากตะกร้า"
        >
          <TrashIcon />
        </button>

      </div>
    </div>
  );
}

function TrashIcon() {
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
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

