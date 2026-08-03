import React, { useState } from "react";
import { X, Loader2, ChevronLeft, ChevronRight, Plus, MoreHorizontal } from "lucide-react";

/**
 * Bộ component nền tảng kiểu shadcn/ui cho AgriLog.
 * Cùng token màu với auth/dashboard/layout: xanh đất #1C2B1E, vàng lúa #C9A227,
 * nền giấy kem #F7F2DF, viền #E1E5CB / #DCE0C4, chữ #20281B / #33361F / #7C7A4E / #8B9070.
 * Mỗi component export riêng để import vào các trang khác; cuối file có Demo minh hoạ.
 */

const fontBody = { fontFamily: "'Lora', serif" };
const fontMono = { fontFamily: "'IBM Plex Mono', monospace" };

/* ========================= Button ========================= */

const BUTTON_VARIANTS = {
  primary: "bg-[#1C2B1E] text-[#F6EFDD] hover:bg-[#243A28] focus-visible:ring-[#1C2B1E]/40",
  gold: "bg-[#C9A227] text-[#1C2B1E] hover:bg-[#B8931F] focus-visible:ring-[#C9A227]/50",
  secondary: "bg-[#ECEEDA] text-[#20281B] hover:bg-[#E1E5CB] focus-visible:ring-[#8B9070]/40",
  outline: "border border-[#DCE0C4] bg-white text-[#33361F] hover:bg-[#F7F2DF] focus-visible:ring-[#8B9070]/40",
  ghost: "text-[#33361F] hover:bg-[#ECEEDA] focus-visible:ring-[#8B9070]/40",
  destructive: "bg-[#C15A34] text-white hover:bg-[#A94B2A] focus-visible:ring-[#C15A34]/40",
};

const BUTTON_SIZES = {
  sm: "h-8 px-3 text-[12.5px] gap-1.5",
  md: "h-10 px-4 text-[13.5px] gap-2",
  lg: "h-11 px-5 text-[14px] gap-2",
};

export function Button({ variant = "primary", size = "md", loading = false, disabled, className = "", children, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={
        "inline-flex items-center justify-center rounded-md font-medium shadow-sm transition " +
        "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F2DF] " +
        BUTTON_VARIANTS[variant] + " " + BUTTON_SIZES[size] + " " + className
      }
      style={fontBody}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {children}
    </button>
  );
}

/* ========================= Input ========================= */

export function Input({ label, error, icon: Icon, endAdornment, className = "", id, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-[#3A3527]" style={fontBody}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B9070]" strokeWidth={1.75} />}
        <input
          id={id}
          {...props}
          className={
            "h-10 w-full rounded-md border bg-white px-3 text-[13.5px] text-[#262A1E] shadow-sm outline-none transition " +
            "placeholder:text-[#A8AC86] " +
            (error
              ? "border-[#C15A34] focus-visible:ring-2 focus-visible:ring-[#C15A34]/30"
              : "border-[#DCE0C4] focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30") +
            (Icon ? " pl-9" : "") + (endAdornment ? " pr-9" : "") + " " + className
          }
          style={fontBody}
        />
        {endAdornment}
      </div>
      {error && <p className="mt-1 text-[12px] text-[#C15A34]" style={fontBody}>{error}</p>}
    </div>
  );
}

/* ========================= Textarea ========================= */

export function Textarea({ label, error, rows = 4, className = "", id, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-[#3A3527]" style={fontBody}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        {...props}
        className={
          "w-full resize-none rounded-md border bg-white px-3 py-2.5 text-[13.5px] text-[#262A1E] shadow-sm outline-none transition " +
          "placeholder:text-[#A8AC86] " +
          (error
            ? "border-[#C15A34] focus-visible:ring-2 focus-visible:ring-[#C15A34]/30"
            : "border-[#DCE0C4] focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30") +
          " " + className
        }
        style={fontBody}
      />
      {error && <p className="mt-1 text-[12px] text-[#C15A34]" style={fontBody}>{error}</p>}
    </div>
  );
}

/* ========================= Card ========================= */

export function Card({ className = "", children }) {
  return <div className={"rounded-2xl border border-[#E1E5CB] bg-[#FFFDF6] shadow-sm " + className}>{children}</div>;
}
export function CardHeader({ className = "", children }) {
  return <div className={"flex items-start justify-between gap-3 p-5 pb-3 " + className}>{children}</div>;
}
export function CardTitle({ className = "", children }) {
  return <h3 className={"text-[15px] font-medium text-[#20281B] " + className} style={fontBody}>{children}</h3>;
}
export function CardDescription({ className = "", children }) {
  return <p className={"mt-1 text-[12.5px] text-[#7C7A4E] " + className} style={fontBody}>{children}</p>;
}
export function CardContent({ className = "", children }) {
  return <div className={"px-5 pb-5 " + className}>{children}</div>;
}
export function CardFooter({ className = "", children }) {
  return <div className={"flex items-center gap-2 border-t border-[#EEF0E1] px-5 py-3.5 " + className}>{children}</div>;
}

/* ========================= Badge ========================= */

const BADGE_VARIANTS = {
  default: "bg-[#ECEEDA] text-[#3F6B2C]",
  gold: "bg-[#FBF0D6] text-[#8A6D1F]",
  danger: "bg-[#F6E2DC] text-[#9C4B2E]",
  outline: "border border-[#DCE0C4] text-[#52502E]",
  neutral: "bg-[#EFEBDD] text-[#8B8368]",
};

export function Badge({ variant = "default", className = "", children }) {
  return (
    <span
      className={"inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium " + BADGE_VARIANTS[variant] + " " + className}
      style={fontBody}
    >
      {children}
    </span>
  );
}

/* ========================= Spinner ========================= */

const SPINNER_SIZES = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" };

export function Spinner({ size = "md", className = "" }) {
  return <Loader2 className={"animate-spin " + SPINNER_SIZES[size] + " " + className} strokeWidth={2} />;
}

/* ========================= Table ========================= */

export function Table({ children, className = "" }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E1E5CB]">
      <table className={"w-full border-collapse text-[13px] " + className}>{children}</table>
    </div>
  );
}
export function TableHeader({ children }) {
  return <thead className="bg-[#ECEEDA]">{children}</thead>;
}
export function TableBody({ children }) {
  return <tbody className="divide-y divide-[#EEF0E1]">{children}</tbody>;
}
export function TableRow({ children, className = "" }) {
  return <tr className={"transition hover:bg-[#F7F2DF]/60 " + className}>{children}</tr>;
}
export function TableHead({ children, className = "" }) {
  return (
    <th className={"px-4 py-2.5 text-left text-[11.5px] font-medium uppercase tracking-wide text-[#52502E] " + className} style={fontMono}>
      {children}
    </th>
  );
}
export function TableCell({ children, className = "", style }) {
  return <td className={"px-4 py-3 text-[#262A1E] " + className} style={{ ...fontBody, ...style }}>{children}</td>;
}

/* ========================= Dialog ========================= */

export function Dialog({ open, onClose, title, description, footer, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#151F16]/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[#E1E5CB] bg-[#FFFDF6] shadow-lg">
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF0E1] p-5">
          <div>
            <h3 className="text-[16px] font-medium text-[#20281B]" style={fontBody}>{title}</h3>
            {description && <p className="mt-1 text-[12.5px] text-[#7C7A4E]" style={fontBody}>{description}</p>}
          </div>
          <button onClick={onClose} className="shrink-0 rounded-md p-1 text-[#8B9070] transition hover:bg-[#ECEEDA]" aria-label="Đóng">
            <X className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-[#EEF0E1] p-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ========================= Pagination ========================= */

export function Pagination({ page, totalPages, onChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[12px] text-[#8B9070]" style={fontBody}>Trang {page} / {totalPages}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#52502E] transition hover:bg-[#ECEEDA] disabled:opacity-40"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={"e" + i} className="flex h-8 w-8 items-center justify-center text-[#B3AB92]">
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={
                "flex h-8 w-8 items-center justify-center rounded-md text-[12.5px] font-medium transition " +
                (p === page ? "bg-[#1C2B1E] text-[#F6EFDD]" : "text-[#52502E] hover:bg-[#ECEEDA]")
              }
              style={fontMono}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#52502E] transition hover:bg-[#ECEEDA] disabled:opacity-40"
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

/* ========================= Demo ========================= */

const ACTIVITIES = [
  { id: 1, plot: "A1", type: "Tưới nước", farmer: "Ông Ba", date: "03/08", source: "gold" },
  { id: 2, plot: "B1", type: "Phun thuốc", farmer: "Chị Xuân", date: "02/08", source: "default" },
  { id: 3, plot: "A2", type: "Bón phân", farmer: "Ông Ba", date: "02/08", source: "outline" },
  { id: 4, plot: "A1", type: "Thu hoạch thử", farmer: "Ông Ba", date: "01/08", source: "neutral" },
  { id: 5, plot: "B1", type: "Làm cỏ", farmer: "Chị Xuân", date: "31/07", source: "default" },
];

export default function ComponentKitDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(2);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setDialogOpen(false);
    }, 1200);
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F2DF] p-6 sm:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@500&display=swap');
      `}</style>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Buttons */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Button</CardTitle>
              <CardDescription>Các biến thể và kích thước</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary">Lưu hoạt động</Button>
            <Button variant="gold">Thu hoạch</Button>
            <Button variant="secondary">Huỷ</Button>
            <Button variant="outline">Xem chi tiết</Button>
            <Button variant="ghost">Bỏ qua</Button>
            <Button variant="destructive">Xoá</Button>
            <Button variant="primary" loading>Đang lưu</Button>
            <Button variant="primary" size="sm">Nhỏ</Button>
            <Button variant="primary" size="lg">Lớn</Button>
          </CardContent>
        </Card>

        {/* Form: Input / Textarea / Badge / Spinner */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Input · Textarea · Badge · Spinner</CardTitle>
              <CardDescription>Trường nhập liệu và thành phần trạng thái</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="plot" label="Thửa" placeholder="A1" />
              <Input id="quantity" label="Số lượng" placeholder="0" error="Vui lòng nhập số lượng" />
            </div>
            <Textarea id="note" label="Ghi chú" placeholder="Mô tả hoạt động..." />
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">Đang phát triển</Badge>
              <Badge variant="gold">Mức trung bình</Badge>
              <Badge variant="danger">Mức cao</Badge>
              <Badge variant="outline">Bản nháp</Badge>
              <Badge variant="neutral">Đất trống</Badge>
              <Spinner size="sm" className="text-[#8B9070]" />
              <Spinner size="md" className="text-[#C9A227]" />
            </div>
          </CardContent>
        </Card>

        {/* Table + Pagination */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>Table kết hợp Pagination</CardDescription>
            </div>
            <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Thêm
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thửa</TableHead>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead>Người thực hiện</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Nguồn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ACTIVITIES.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell style={fontMono}>{a.plot}</TableCell>
                    <TableCell>{a.type}</TableCell>
                    <TableCell>{a.farmer}</TableCell>
                    <TableCell style={fontMono}>{a.date}</TableCell>
                    <TableCell><Badge variant={a.source}>Ghi nhận</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} totalPages={6} onChange={setPage} />
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Thêm hoạt động mới"
        description="Ghi lại một hoạt động canh tác cho thửa của bạn."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={saving}>Huỷ</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Lưu hoạt động</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input id="dialog-plot" label="Thửa" placeholder="A1" />
          <Textarea id="dialog-note" label="Mô tả" placeholder="Tưới nước buổi sáng..." rows={3} />
        </div>
      </Dialog>
    </div>
  );
}
