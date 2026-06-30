export const ORDER_STATUS_FLOW = ["PENDING", "PAID", "SHIPPED", "DONE"];

export function normalizeOrderStatus(status) {
  if (!status || typeof status !== "string") return "PENDING";

  const cleaned = status.trim().toUpperCase();
  const aliases = {
    SELESAI: "DONE",
    COMPLETED: "DONE",
    SUCCESS: "DONE",
    SETTLEMENT: "PAID",
    PAYMENT_CONFIRMED: "PAID",
    DELIVERED: "DONE",
    FINISHED: "DONE",
    CANCELED: "CANCELLED",
    CANCEL: "CANCELLED",
    BATAL: "CANCELLED",
  };

  return aliases[cleaned] || cleaned;
}

export function getOrderStatusMeta(status) {
  const normalized = normalizeOrderStatus(status);

  const map = {
    PENDING: {
      label: "Menunggu Pembayaran",
      step: 0,
      badge: "bg-amber-50 text-amber-700 border-amber-200/70",
      dot: "bg-amber-500",
      title: "Pesanan baru masuk",
      description:
        "Pembayaran belum dikonfirmasi. Silakan lanjutkan pembayaran atau unggah bukti pembayaran.",
    },
    PAID: {
      label: "Pembayaran Diterima",
      step: 1,
      badge: "bg-sky-50 text-sky-700 border-sky-200/70",
      dot: "bg-sky-500",
      title: "Pesanan sedang diproses",
      description:
        "Pesanan Anda sedang diproses dan tim admin sedang menyiapkan pengiriman.",
    },
    SHIPPED: {
      label: "Sedang Dikirim",
      step: 2,
      badge: "bg-violet-50 text-violet-700 border-violet-200/70",
      dot: "bg-violet-500",
      title: "Pesanan dalam perjalanan",
      description: "Pesanan sudah keluar dan dapat dipantau dengan nomor resi.",
    },
    DONE: {
      label: "Selesai",
      step: 3,
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      dot: "bg-emerald-500",
      title: "Pesanan selesai",
      description: "Pengiriman telah selesai dan pesanan Anda telah rampung.",
    },
    CANCELLED: {
      label: "Dibatalkan",
      step: -1,
      badge: "bg-rose-50 text-rose-700 border-rose-200/70",
      dot: "bg-rose-500",
      title: "Pesanan dibatalkan",
      description:
        "Pesanan ini tidak dilanjutkan dan tidak masuk proses pengiriman.",
    },
  };

  return map[normalized] || map.PENDING;
}

export function getOrderProgress(status) {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "CANCELLED") return 0;
  const currentStep = getOrderStatusMeta(normalized).step;
  const maxStep = ORDER_STATUS_FLOW.length - 1;
  return maxStep === 0 ? 0 : Math.round((currentStep / maxStep) * 100);
}

export function getOrderStatusSteps(status) {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "CANCELLED") {
    return [
      { key: "PENDING", label: "Tertunda" },
      { key: "PAID", label: "Diproses" },
      { key: "SHIPPED", label: "Dikirim" },
      { key: "DONE", label: "Selesai" },
    ];
  }

  return ORDER_STATUS_FLOW.map((step) => ({
    key: step,
    label:
      step === "DONE"
        ? "Selesai"
        : step === "PAID"
          ? "Diproses"
          : step === "SHIPPED"
            ? "Dikirim"
            : "Tertunda",
  }));
}

export function getOrderCompletionState(order) {
  const status = normalizeOrderStatus(
    order?.status || order?.payment_status || order?.order_status,
  );
  const meta = getOrderStatusMeta(status);
  return {
    status,
    meta,
    progress: getOrderProgress(status),
    steps: getOrderStatusSteps(status),
  };
}

export function getInvoiceNumber(order) {
  return (
    order?.order_invoice ||
    order?.invoice_number ||
    order?.invoice ||
    order?.id ||
    "INV-UNKNOWN"
  );
}
