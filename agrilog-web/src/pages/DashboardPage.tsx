import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Dialog,
} from '@/components/ui';
import {
  Container,
  Breadcrumb,
  PageHeader,
} from '@/components/layout';
import {
  ActivityCard,
  PlotCard,
  MapView,
  AIResultCard,
  ActivityForm,
  ActivityData,
  PlotData,
  AIResultData,
} from '@/components/domain';
import {
  User,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Bot,
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';

const DEMO_PLOTS: PlotData[] = [
  {
    code: 'A1',
    name: 'Ruộng trước nhà',
    area: 1.2,
    soil_type: 'Đất phù sa',
    status: 'GROWING',
    crop: 'Lúa',
    variety: 'OM5451',
    progress: 68,
    mapStatus: 'ALERT',
    points: '20,20 140,20 150,90 10,90',
    labelX: 80,
    labelY: 58,
  },
  {
    code: 'A2',
    name: 'Ruộng sau vườn',
    area: 0.8,
    soil_type: 'Đất thịt',
    status: 'GROWING',
    crop: 'Lúa',
    variety: 'ST25',
    progress: 41,
    mapStatus: 'GROWING',
    points: '160,20 300,20 300,90 170,90',
    labelX: 230,
    labelY: 58,
  },
  {
    code: 'B1',
    name: 'Vườn xoài',
    area: 0.5,
    soil_type: 'Đất cát pha',
    status: 'GROWING',
    crop: 'Xoài',
    variety: 'Cát Hòa Lộc',
    progress: 89,
    mapStatus: 'GROWING',
    points: '20,110 150,110 140,190 10,190',
    labelX: 80,
    labelY: 152,
  },
  {
    code: 'C1',
    name: 'Ruộng góc kênh',
    area: 1.0,
    soil_type: 'Đất phù sa',
    status: 'FALLOW',
    progress: 0,
    mapStatus: 'FALLOW',
    points: '170,110 300,110 300,190 160,190',
    labelX: 230,
    labelY: 152,
  },
];

const DEMO_ACTIVITY: ActivityData = {
  type: 'IRRIGATE',
  type_name: 'Tưới nước',
  plot_code: 'A1',
  farmer: 'Ông Ba',
  start_time: '2026-08-03T06:20:00',
  source_type: 'VOICE',
  ai_status: 'CONFIRMED',
  description: 'Tưới nước buổi sáng, mực nước ruộng ổn định khoảng 5cm.',
  materials: [{ name: 'Nước tưới', quantity: 200, unit: 'L' }],
  mediaCount: 1,
};

const DEMO_ACTIVITY_2: ActivityData = {
  type: 'SPRAY',
  type_name: 'Phun thuốc sinh học',
  plot_code: 'B1',
  farmer: 'Chị Xuân',
  start_time: '2026-08-02T16:30:00',
  source_type: 'IMAGE',
  ai_status: 'CONFIRMED',
  description: 'Phun phòng trừ rầy nâu giai đoạn làm đòng.',
  materials: [{ name: 'Chế phẩm nấm xanh', quantity: 2, unit: 'Gói' }],
  mediaCount: 2,
};

const DEMO_AI_RESULT: AIResultData = {
  model_name: 'AgriLog Extractor v2',
  source_type: 'VOICE',
  ai_status: 'COMPLETED',
  confidence: 0.91,
  transcript:
    'Sáng nay tôi phun thuốc trừ sâu cuốn lá cho ruộng A1, dùng khoảng 2 lít.',
  extracted: {
    hoat_dong: 'Phun thuốc',
    thua: 'A1',
    vat_tu: 'Thuốc trừ sâu',
    so_luong: '2 lít',
  },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiResult, setAiResult] = useState<AIResultData>(DEMO_AI_RESULT);

  return (
    <Container>
      <Breadcrumb
        items={[
          { label: 'Tổng quan', href: '/' },
          { label: 'Quản lý Nông trại' },
        ]}
      />

      <PageHeader
        title="Tổng quan Trang trại"
        description="Theo dõi toàn diện thửa đất, bản đồ đồng ruộng và tự động trích xuất nhật ký canh tác bằng AI."
        actions={
          <Button
            variant="primary"
            onClick={() => setDialogOpen(true)}
            style={{ fontFamily: "'Lora', serif" }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Ghi hoạt động
          </Button>
        }
      />

      {/* Stats Quick Cards sử dụng Shadcn/UI <Card> */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="h-full shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span
                  className="text-[13px] font-medium text-[#7C7A4E]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  Tổng số Thửa đất
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ECEEDA] text-[#1C2B1E]">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
              </div>
              <p
                className="mt-4 text-3xl font-bold text-[#20281B]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                4 Thửa
              </p>
              <p className="mt-1 text-[12px] text-[#8B9070]">
                3 thửa đang canh tác · 3.5 ha
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="h-full shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span
                  className="text-[13px] font-medium text-[#7C7A4E]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  Nhật ký đã xác nhận
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ECEEDA] text-[#1C2B1E]">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
              </div>
              <p
                className="mt-4 text-3xl font-bold text-[#20281B]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                28
              </p>
              <p className="mt-1 text-[12px] text-[#8B9070]">
                100% kiểm chứng chuẩn GAP
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="h-full shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span
                  className="text-[13px] font-medium text-[#7C7A4E]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  Trợ lý AI Nông nghiệp
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1C2B1E] text-[#E7C766]">
                  <Bot className="h-4 w-4" />
                </div>
              </div>
              <p
                className="mt-4 text-3xl font-bold text-[#20281B]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                Sẵn sàng
              </p>
              <p className="mt-1 text-[12px] text-[#8B9070]">
                Hỗ trợ giọng nói & nhận diện ảnh
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Section 1: Bản đồ đồng ruộng & Danh sách thửa đất (MapView + PlotCard) */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2
              className="text-[18px] font-medium text-[#20281B]"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Bản đồ & Trạng thái Thửa đất
            </h2>
            <p className="text-[13px] text-[#7C7A4E]">
              Nhấp vào thửa trên bản đồ hoặc chọn Xem mùa vụ để kiểm tra tình hình canh tác
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            Thêm thửa đất
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <MapView plots={DEMO_PLOTS} />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEMO_PLOTS.map((p) => (
              <PlotCard
                key={p.code}
                plot={p}
                onOpen={() => setDialogOpen(true)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: AI Result Card & Hoạt động gần đây (ActivityCard) */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2
              className="text-[18px] font-medium text-[#20281B]"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Hoạt động canh tác & Phân tích từ AI
            </h2>
            <p className="text-[13px] text-[#7C7A4E]">
              Kết hợp ghi nhận giọng nói, hình ảnh và phân tích tự động bằng AI AgriLog
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <ActivityCard
              activity={DEMO_ACTIVITY}
              onDetailClick={() => setDialogOpen(true)}
            />
            <ActivityCard
              activity={DEMO_ACTIVITY_2}
              onDetailClick={() => setDialogOpen(true)}
            />
          </div>

          <div className="lg:col-span-1">
            <AIResultCard
              result={aiResult}
              onConfirm={() =>
                setAiResult({ ...aiResult, ai_status: 'CONFIRMED' })
              }
              onEdit={() => setDialogOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Profile nông dân */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hồ sơ nông dân AgriLog 🌾</CardTitle>
              <CardDescription>
                {user?.full_name || 'Nông dân AgriLog'}
              </CardDescription>
            </div>
            <Badge variant="gold">
              {user?.role?.toUpperCase() || 'FARMER'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#F7F2DF]/70 border border-[#E1E5CB]">
            <div className="w-9 h-9 rounded-lg bg-[#ECEEDA] flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-[#1C2B1E]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#8B9070]">
                Tên đăng nhập
              </p>
              <p className="text-[13.5px] font-semibold text-[#20281B] truncate">
                {user?.username || 'farmer_admin'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#F7F2DF]/70 border border-[#E1E5CB]">
            <div className="w-9 h-9 rounded-lg bg-[#ECEEDA] flex items-center justify-center">
              <Mail className="w-4.5 h-4.5 text-[#1C2B1E]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#8B9070]">Email</p>
              <p className="text-[13.5px] font-semibold text-[#20281B] truncate">
                {user?.email || 'farmer@agrilog.vn'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#F7F2DF]/70 border border-[#E1E5CB]">
            <div className="w-9 h-9 rounded-lg bg-[#ECEEDA] flex items-center justify-center">
              <Phone className="w-4.5 h-4.5 text-[#1C2B1E]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#8B9070]">
                Số điện thoại
              </p>
              <p className="text-[13.5px] font-semibold text-[#20281B] truncate">
                {user?.phone || '0988777666'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog chứa ActivityForm */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Ghi hoạt động canh tác mới"
        description="Chọn nguồn ghi nhận (nhập tay, văn bản, giọng nói hoặc hình ảnh) để tạo nhật ký."
      >
        <ActivityForm
          plots={DEMO_PLOTS}
          onSubmit={() => {
            setDialogOpen(false);
          }}
          onCancel={() => setDialogOpen(false)}
        />
      </Dialog>
    </Container>
  );
}
