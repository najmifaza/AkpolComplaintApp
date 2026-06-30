export const STATUS_ORDER = [
  "masuk",
  "diverifikasi",
  "diproses",
  "ditangani",
  "selesai",
  "ditolak"
];

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  masuk: { label: "Masuk", color: "gray" },
  diverifikasi: { label: "Diverifikasi", color: "blue" },
  diproses: { label: "Diproses", color: "amber" },
  ditangani: { label: "Ditangani", color: "green" },
  selesai: { label: "Selesai", color: "teal" },
  ditolak: { label: "Ditolak", color: "red" },
};

export const STATUS_PERMISSION: Record<string, string[]> = {
  masuk: [], // otomatis sistem
  diverifikasi: ["admin"],
  diproses: ["admin", "teknisi"],
  ditangani: ["teknisi"],
  selesai: ["teknisi", "admin"],
  ditolak: ["admin"], // bisa dari status manapun
};

export const STATUS_WAJIB_FOTO = ["ditangani", "selesai"];
