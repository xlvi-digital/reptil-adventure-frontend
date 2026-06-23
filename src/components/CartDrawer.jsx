import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
// import { CartItem } from '../types';

// interface CartDrawerProps {
//   isOpen: boolean;
//   onClose: () => void;
//   cart: CartItem[];
//   onUpdateQuantity: (id: string, amount: number) => void;
//   onRemoveItem: (id: string) => void;
//   onCheckout: () => void;
// }

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0, // Menghilangkan ,00 di belakang harga
      maximumFractionDigits: 0,
    }).format(number);
  };
  if (!isOpen) return null;

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const BASE_URL = "http://localhost:8080";
  const getProductImage = (product) => {
    if (!product) return "https://via.placeholder.com/300";

    // Ambil data gambar mentah dari produk
    const rawImage = product.image || product.image_url;

    if (!rawImage) return "https://via.placeholder.com/300";

    try {
      // Jika datanya berupa string JSON (karena dari database seringkali datang sebagai string)
      if (typeof rawImage === "string" && rawImage.startsWith("{")) {
        const parsed = JSON.parse(rawImage);
        if (parsed.primary) {
          return `${BASE_URL}${parsed.primary}`;
        }
      }
      // Jika datanya sudah otomatis menjadi Object di JavaScript
      else if (typeof rawImage === "object" && rawImage.primary) {
        return `${BASE_URL}${rawImage.primary}`;
      }

      // Jika ternyata datanya string biasa (bukan JSON objek)
      if (typeof rawImage === "string") {
        if (rawImage.startsWith("http")) return rawImage;
        return `${BASE_URL}${rawImage}`;
      }
    } catch (error) {
      console.error("Gagal memparsing gambar:", error);
    }

    return "https://via.placeholder.com/300"; // Gambar cadangan jika gagal
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative z-10 w-full max-w-md bg-[#F9F9F7] text-neutral-900 shadow-2xl flex flex-col h-full border-l border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-neutral-800" />
            <span className="font-sans font-medium text-lg text-neutral-800">
              Shopping Cart
            </span>
            <span className="bg-neutral-900 text-white rounded-full text-xs px-2.5 py-0.5 font-mono ml-1">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-neutral-400" />
              </div>
              <div>
                <p className="font-sans font-medium text-neutral-800 text-lg">
                  Your cart is empty
                </p>
                <p className="font-sans text-xs text-neutral-500 mt-1">
                  Select products and configure custom sizes to populate
                  details.
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-neutral-900 font-sans font-medium hover:bg-neutral-800 text-white px-6 py-2.5 rounded-lg text-sm transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition duration-200"
              >
                {/* Image */}
                <div className="h-20 w-20 rounded-lg overflow-hidden shrink-0 border border-neutral-100 bg-neutral-50">
                  <img
                    src={
                      getProductImage(item.product) ||
                      "https://via.placeholder.com/300"
                    }
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-sans font-medium text-neutral-800 text-sm truncate pr-2">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-neutral-400 hover:text-red-500 transition p-0.5 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Options */}
                  <div className="flex gap-3 text-xs text-neutral-500 mt-1 font-mono">
                    <span>
                      Size:{" "}
                      <strong className="text-neutral-700">{item.size}</strong>
                    </span>
                    <span>
                      Color:{" "}
                      <strong className="text-neutral-700">{item.color}</strong>
                    </span>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 px-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-l-lg"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 font-mono text-xs font-semibold text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 px-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-r-lg"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-sans font-semibold text-sm text-neutral-900">
                      Rp.{" "}
                      {formatRupiah(item.product.price * item.quantity)
                        .replace("Rp", "")
                        .trim()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout section */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-200 bg-white px-6 py-6 space-y-4 shadow-[0_-8px_24px_rgba(0,0,0,0.02)]">
            <div className="space-y-2">
              <div className="flex justify-between text-neutral-500 text-xs font-medium">
                <span>Subtotal</span>
                <span>Rp. {formatRupiah(total).replace("Rp", "").trim()}</span>
              </div>
              <div className="flex justify-between text-neutral-500 text-xs font-medium">
                <span>Shipping</span>
                <span className="text-[#2D3E35] font-mono select-none font-bold uppercase">
                  FREE
                </span>
              </div>
              <div className="border-t border-neutral-100 my-2 pt-2 flex justify-between text-neutral-900 font-semibold text-base leading-tight">
                <span>Total Due</span>
                <span className="font-mono text-lg text-neutral-900">
                  Rp. {formatRupiah(total).replace("Rp", "").trim()}
                </span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-neutral-900 text-white font-sans font-medium hover:bg-neutral-800 py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 group transition duration-300 shadow-sm"
            >
              Secure Checkout
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition duration-200" />
            </button>
            <p className="text-[10px] text-center text-neutral-400 font-mono tracking-normal leading-normal">
              SECURE SEAMLESS ENCRYPTED CHECKS WITH SSL CORE
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
