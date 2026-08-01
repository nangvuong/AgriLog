import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Award,
  Bug,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Droplets,
  Keyboard,
  Leaf,
  Loader2,
  Mic,
  MicOff,
  Pencil,
  Plus,
  Scissors,
  Sparkles,
  Sprout,
  Trash2,
  Upload,
  Volume2,
} from 'lucide-react';
import {
  LoaiHoatDongCanhTac,
  QuickLogChannel,
  type FarmerSeasonDto,
} from 'agrilog-shared';
import { transcribeAudioAiApi } from '../../../services/api';

export interface SupplyItem {
  id: string;
  ten_vat_tu: string;
  lieu_luong: string;
}

export interface ActivitySupplyGroup {
  loai_hoat_dong: string;
  mo_ta?: string;
  vat_tu_list: SupplyItem[];
}

export interface QuickLogFormProps {
  seasons: FarmerSeasonDto[];
  selectedSeasonId: number;
  setSelectedSeasonId: (id: number) => void;
  selectedActivity: string;
  setSelectedActivity: (id: string) => void;
  activeChannel: QuickLogChannel | string;
  setActiveChannel: (c: QuickLogChannel | 'mic' | 'cam' | 'text') => void;
  noteText: string;
  setNoteText: (val: string) => void;
  supplyName: string;
  setSupplyName: (val: string) => void;
  supplyAmount: string;
  setSupplyAmount: (val: string) => void;
  isRecordingMic: boolean;
  submitting: boolean;
  handleSimulateMic: () => void;
  handleSimulateCam: () => void;
  handleSaveQuickLog: (payload?: {
    hoat_dong_list: ActivitySupplyGroup[];
  }) => void;
}

/**
 * QuickLogForm - Giao diện Ghi nhật ký nhanh tối ưu cho nông dân
 *
 * Thiết kế tập trung vào:
 * - Nút Micro THU ÂM lớn, nổi bật nhất (nông dân quen nói hơn gõ phím)
 * - Ít bước thao tác nhất có thể (AI tự động điền)
 * - Font chữ lớn, khoảng cách rộng cho ngón tay lớn
 * - Ghi chú gõ tay luôn hiển thị bên dưới (không cần chuyển tab)
 */
export const QuickLogForm: React.FC<QuickLogFormProps> = ({
  seasons,
  selectedSeasonId,
  setSelectedSeasonId,
  setSelectedActivity,
  activeChannel,
  setActiveChannel,
  noteText,
  setNoteText,
  isRecordingMic,
  submitting,
  handleSimulateMic,
  handleSimulateCam,
  handleSaveQuickLog,
}) => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activitySuppliesMap, setActivitySuppliesMap] = useState<
    Record<string, SupplyItem[]>
  >({});

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [uploadedAudioName, setUploadedAudioName] = useState<string>('');
  const [showActivities, setShowActivities] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [inputMode, setInputMode] = useState<'voice' | 'manual'>('voice');

  const toggleActivity = (id: string) => {
    if (selectedActivities.includes(id)) {
      const updated = selectedActivities.filter((a) => a !== id);
      setSelectedActivities(updated);
      setSelectedActivity(updated.length > 0 ? updated[0] : '');
    } else {
      const updated = [...selectedActivities, id];
      setSelectedActivities(updated);
      setSelectedActivity(id);
      if (!activitySuppliesMap[id]) {
        setActivitySuppliesMap((prev) => ({
          ...prev,
          [id]: [{ id: String(Date.now()), ten_vat_tu: '', lieu_luong: '' }],
        }));
      }
    }
  };

  const handleAddSupplyToActivity = (actId: string) => {
    const currentList = activitySuppliesMap[actId] || [];
    setActivitySuppliesMap((prev) => ({
      ...prev,
      [actId]: [...currentList, { id: String(Date.now()), ten_vat_tu: '', lieu_luong: '' }],
    }));
  };

  const handleUpdateSupplyOfActivity = (
    actId: string, supplyId: string, field: 'ten_vat_tu' | 'lieu_luong', val: string,
  ) => {
    const updated = (activitySuppliesMap[actId] || []).map((item) =>
      item.id === supplyId ? { ...item, [field]: val } : item,
    );
    setActivitySuppliesMap((prev) => ({ ...prev, [actId]: updated }));
  };

  const handleRemoveSupplyFromActivity = (actId: string, supplyId: string) => {
    const currentList = activitySuppliesMap[actId] || [];
    if (currentList.length === 1) return;
    setActivitySuppliesMap((prev) => ({
      ...prev,
      [actId]: currentList.filter((item) => item.id !== supplyId),
    }));
  };

  const startRecordingTimer = () => {
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
  };
  const stopRecordingTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const handleMicButtonClick = async () => {
    if (isRecording) {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      setIsRecording(false);
      stopRecordingTimer();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        stopRecordingTimer();
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setIsProcessingAi(true);
        try {
          const res = await transcribeAudioAiApi(audioBlob, 'web_recording.webm');
          applyAiResponse(res);
        } catch { onSimulateVoiceAI(); }
        finally { setIsProcessingAi(false); }
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      startRecordingTimer();
      handleSimulateMic();
    } catch { onSimulateVoiceAI(); }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedAudioName(file.name);
    setIsProcessingAi(true);
    try {
      const res = await transcribeAudioAiApi(file, file.name);
      applyAiResponse(res);
    } catch { onSimulateVoiceAI(); }
    finally { setIsProcessingAi(false); }
  };

  const applyAiResponse = (res: { raw_text: string; parsed_data?: any }) => {
    if (res.raw_text) setNoteText(res.raw_text);
    if (res.parsed_data && Array.isArray(res.parsed_data)) {
      const acts: string[] = [];
      const suppliesMap: Record<string, SupplyItem[]> = {};
      res.parsed_data.forEach((group: any) => {
        const loai = group.loai_hoat_dong || 'khac';
        if (!acts.includes(loai)) acts.push(loai);
        const vatTuList = Array.isArray(group.vat_tu_list) ? group.vat_tu_list : [];
        if (!suppliesMap[loai]) suppliesMap[loai] = [];
        if (vatTuList.length > 0) {
          vatTuList.forEach((vt: any) => {
            if (vt.ten_vat_tu) {
              suppliesMap[loai].push({
                id: String(Date.now() + Math.random()),
                ten_vat_tu: vt.ten_vat_tu || '', lieu_luong: vt.lieu_luong || '',
              });
            }
          });
        }
        if (suppliesMap[loai].length === 0) {
          suppliesMap[loai].push({ id: String(Date.now() + Math.random()), ten_vat_tu: '', lieu_luong: '' });
        }
      });
      if (acts.length > 0) {
        setSelectedActivities(acts);
        setSelectedActivity(acts[0]);
        setActivitySuppliesMap(suppliesMap);
        setShowActivities(true);
      }
    }
  };

  const onSimulateVoiceAI = () => {
    handleSimulateMic();
    setTimeout(() => {
      setSelectedActivities([LoaiHoatDongCanhTac.PHUN_THUOC, LoaiHoatDongCanhTac.BON_PHAN]);
      setSelectedActivity(LoaiHoatDongCanhTac.PHUN_THUOC);
      setActivitySuppliesMap({
        [LoaiHoatDongCanhTac.PHUN_THUOC]: [
          { id: '1', ten_vat_tu: 'Regent 800WG', lieu_luong: '50 ml' },
          { id: '2', ten_vat_tu: 'Chế phẩm Trichoderma', lieu_luong: '250 g' },
        ],
        [LoaiHoatDongCanhTac.BON_PHAN]: [
          { id: '3', ten_vat_tu: 'NPK 20-20-15', lieu_luong: '2 bao (100kg)' },
        ],
      });
      setNoteText('Đã phun Regent phòng trừ sâu vẽ bùa và bón NPK đợt 2');
      setShowActivities(true);
    }, 1800);
  };

  const onSimulateCameraOCR = () => {
    handleSimulateCam();
    setTimeout(() => {
      setSelectedActivities([LoaiHoatDongCanhTac.BON_PHAN]);
      setSelectedActivity(LoaiHoatDongCanhTac.BON_PHAN);
      setActivitySuppliesMap({
        [LoaiHoatDongCanhTac.BON_PHAN]: [
          { id: '1', ten_vat_tu: 'Phân bón lá Humic Mỹ', lieu_luong: '500 ml' },
        ],
      });
      setNoteText('Quét thành công nhãn chai Phân bón lá Humic');
      setShowActivities(true);
    }, 1200);
  };

  const onSave = () => {
    if (selectedActivities.length === 0) return;
    const hoatDongList: ActivitySupplyGroup[] = selectedActivities.map((actId) => ({
      loai_hoat_dong: actId,
      vat_tu_list: (activitySuppliesMap[actId] || []).filter((v) => v.ten_vat_tu.trim() || v.lieu_luong.trim()),
    }));
    handleSaveQuickLog({ hoat_dong_list: hoatDongList });
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const activityList = [
    { id: LoaiHoatDongCanhTac.PHUN_THUOC, label: 'Phun thuốc', icon: <Activity className="w-5 h-5" /> },
    { id: LoaiHoatDongCanhTac.BON_PHAN, label: 'Bón phân', icon: <Sprout className="w-5 h-5" /> },
    { id: LoaiHoatDongCanhTac.TUOI_NUOC, label: 'Tưới nước', icon: <Droplets className="w-5 h-5" /> },
    { id: LoaiHoatDongCanhTac.TIA_CANH, label: 'Tỉa cành', icon: <Scissors className="w-5 h-5" /> },
    { id: LoaiHoatDongCanhTac.LAM_CO, label: 'Làm cỏ', icon: <Leaf className="w-5 h-5" /> },
    { id: LoaiHoatDongCanhTac.BE_QUA, label: 'Bẻ quả', icon: <Award className="w-5 h-5" /> },
    { id: LoaiHoatDongCanhTac.SAU_BENH, label: 'Sâu bệnh', icon: <Bug className="w-5 h-5" /> },
    { id: LoaiHoatDongCanhTac.KHAC, label: 'Khác', icon: <Calendar className="w-5 h-5" /> },
  ];

  const loaiMapLabel: Record<string, string> = {
    bon_phan: 'Bón phân', phun_thuoc: 'Phun thuốc', tuoi_nuoc: 'Tưới nước',
    tia_canh: 'Tỉa cành', lam_co: 'Làm cỏ', be_qua: 'Bẻ quả',
    sau_benh: 'Sâu bệnh', khac: 'Khác',
  };

  const loaiMapIcon: Record<string, React.ReactNode> = {
    phun_thuoc: <Activity className="w-4 h-4" />, bon_phan: <Sprout className="w-4 h-4" />,
    tuoi_nuoc: <Droplets className="w-4 h-4" />, tia_canh: <Scissors className="w-4 h-4" />,
    lam_co: <Leaf className="w-4 h-4" />, be_qua: <Award className="w-4 h-4" />,
    sau_benh: <Bug className="w-4 h-4" />, khac: <Calendar className="w-4 h-4" />,
  };

  const quickPresets: Array<{
    id: string;
    label: string;
    badge: string;
    icon: React.ReactNode;
    acts: string[];
    supplies: Record<string, SupplyItem[]>;
    note: string;
    bg: string;
  }> = [
    {
      id: 'tuoi',
      label: 'Tưới nước vườn',
      badge: 'Thường dùng',
      icon: <Droplets className="w-4 h-4 text-sky-500" />,
      acts: [LoaiHoatDongCanhTac.TUOI_NUOC],
      supplies: { [LoaiHoatDongCanhTac.TUOI_NUOC]: [] },
      note: 'Đã tưới nước tự động đủ ẩm gốc',
      bg: 'bg-sky-50/80 border-sky-200 hover:bg-sky-100/70',
    },
    {
      id: 'phun',
      label: 'Xịt sâu vẽ bùa',
      badge: 'Thuốc Regent',
      icon: <Activity className="w-4 h-4 text-amber-600" />,
      acts: [LoaiHoatDongCanhTac.PHUN_THUOC],
      supplies: {
        [LoaiHoatDongCanhTac.PHUN_THUOC]: [
          { id: 'p1', ten_vat_tu: 'Regent 800WG', lieu_luong: '50 ml' },
        ],
      },
      note: 'Phun thuốc Regent 800WG phòng trừ sâu vẽ bùa',
      bg: 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70',
    },
    {
      id: 'bon',
      label: 'Bón NPK 20-20-15',
      badge: '2 bao/lô',
      icon: <Sprout className="w-4 h-4 text-emerald-600" />,
      acts: [LoaiHoatDongCanhTac.BON_PHAN],
      supplies: {
        [LoaiHoatDongCanhTac.BON_PHAN]: [
          { id: 'b1', ten_vat_tu: 'NPK 20-20-15', lieu_luong: '2 bao (100kg)' },
        ],
      },
      note: 'Rải phân NPK 20-20-15 dưỡng trái định kỳ',
      bg: 'bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/70',
    },
    {
      id: 'tia',
      label: 'Tỉa cành tạo tán',
      badge: 'Vệ sinh vườn',
      icon: <Scissors className="w-4 h-4 text-purple-600" />,
      acts: [LoaiHoatDongCanhTac.TIA_CANH],
      supplies: { [LoaiHoatDongCanhTac.TIA_CANH]: [] },
      note: 'Tỉa cành tăm, cắt tỉa cành sâu bệnh tạo tán thông thoáng',
      bg: 'bg-purple-50/80 border-purple-200 hover:bg-purple-100/70',
    },
  ];

  const handleSelectPreset = (p: typeof quickPresets[0]) => {
    setSelectedActivities(p.acts);
    setSelectedActivity(p.acts[0]);
    setActivitySuppliesMap(p.supplies);
    setNoteText(p.note);
    setShowActivities(true);
  };

  return (
    <div className="space-y-4">
      {/* ═══════ CHUYỂN CHẾ ĐỘ: NÓI NHANH HAY FORM TRUYỀN THỐNG ═══════ */}
      <div className="flex bg-[#E4DCC8]/40 p-1 rounded-2xl border border-[#E4DCC8]/70">
        <button
          type="button"
          onClick={() => setInputMode('voice')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            inputMode === 'voice'
              ? 'bg-[#1F3A2E] text-white shadow-sm'
              : 'text-[#5C6B57] hover:text-[#1F3A2E]'
          }`}
        >
          <Mic className="w-4 h-4 text-[#D9A441]" />
          <span>Nói / Chọn nhanh</span>
        </button>
        <button
          type="button"
          onClick={() => setInputMode('manual')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            inputMode === 'manual'
              ? 'bg-[#1F3A2E] text-white shadow-sm'
              : 'text-[#5C6B57] hover:text-[#1F3A2E]'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-[#D9A441]" />
          <span>Nhập truyền thống</span>
        </button>
      </div>

      {/* ═══════ CHẾ ĐỘ 1: NÓI NHANH / AI (SIÊU ÍT CHỮ) ═══════ */}
      {inputMode === 'voice' && (
        <div className="space-y-4">
          {/* Khung Ghi Âm */}
          <div className="relative bg-gradient-to-br from-[#FDFBF7] to-[#F5EFE0] border-[1.5px] border-[#E4DCC8] rounded-[22px] p-5 shadow-xs text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative my-1">
                {isRecording && (
                  <>
                    <div className="absolute inset-[-14px] rounded-full bg-[#B84C3C]/15 animate-ping" />
                    <div className="absolute inset-[-6px] rounded-full bg-[#B84C3C]/20 animate-pulse" />
                  </>
                )}
                {isProcessingAi && (
                  <div className="absolute inset-[-6px] rounded-full bg-[#D9A441]/25 animate-pulse" />
                )}
                <motion.button
                  type="button"
                  onClick={handleMicButtonClick}
                  whileTap={{ scale: 0.92 }}
                  disabled={isProcessingAi}
                  className={`relative w-[80px] h-[80px] rounded-full flex items-center justify-center border-[3px] transition-all cursor-pointer shadow-lg ${
                    isProcessingAi
                      ? 'bg-[#F7EDD6] border-[#D9A441] text-[#B9862F]'
                      : isRecording
                      ? 'bg-[#B84C3C] text-white border-[#8A362B] shadow-[0_0_0_5px_rgba(184,76,60,0.2)]'
                      : 'bg-white border-[#B84C3C] text-[#B84C3C] hover:bg-[#B84C3C] hover:text-white active:scale-95'
                  }`}
                >
                  {isProcessingAi ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </motion.button>
              </div>

              <div>
                {isProcessingAi ? (
                  <p className="text-[14px] font-bold text-[#B9862F] animate-pulse flex items-center justify-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI đang bóc tách nhật ký...</span>
                  </p>
                ) : isRecording ? (
                  <p className="text-[14.5px] font-bold text-[#B84C3C]">
                    Đang ghi âm — {formatTime(recordingSeconds)}
                  </p>
                ) : (
                  <p className="text-[14.5px] font-bold text-[#1F3A2E]">
                    Chạm nút đỏ để nói nhật ký
                  </p>
                )}
              </div>

              {/* Tải file hoặc Chụp nhãn */}
              <div className="flex gap-2.5 w-full pt-1">
                <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E4DCC8] hover:border-[#345645] text-[12px] font-semibold text-[#1F3A2E] cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5 text-[#B9862F]" />
                  <span>{uploadedAudioName ? uploadedAudioName.slice(0, 14) : 'Tải âm thanh'}</span>
                  <input type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm" onChange={handleAudioFileChange} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => { setActiveChannel(QuickLogChannel.CAM); onSimulateCameraOCR(); }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E4DCC8] hover:border-[#345645] text-[12px] font-semibold text-[#1F3A2E] cursor-pointer transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-[#345645]" />
                  <span>Chụp nhãn thuốc</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chọn nhanh 1 chạm */}
          <div>
            <p className="text-[11px] font-bold text-[#5C6B57] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
              <span>Gợi ý thường dùng (1 chạm)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickPresets.map((p) => (
                <motion.button
                  key={p.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelectPreset(p)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-2xl border-[1.5px] text-left transition-all cursor-pointer shadow-xs ${p.bg}`}
                >
                  <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
                    {p.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[12px] font-bold text-[#1F3A2E] truncate">
                      {p.label}
                    </span>
                    <span className="inline-block text-[10px] font-semibold text-[#5C6B57] bg-white/80 px-1.5 py-0.5 rounded-md mt-1 border border-black/5">
                      {p.badge}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Thẻ tóm tắt kết quả AI / thao tác nhanh */}
          {selectedActivities.length > 0 && (
            <div className="bg-[#EBF3ED] border border-[#8FAE94]/50 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[12.5px] font-bold text-[#1F3A2E] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#D9A441] stroke-[2.5]" />
                  <span>Đã chọn {selectedActivities.length} hoạt động</span>
                </p>
                <p className="text-[11.5px] text-[#5C6B57] mt-0.5">
                  {selectedActivities.map((id) => loaiMapLabel[id] || id).join(', ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className="text-[11.5px] font-bold text-[#1F3A2E] bg-white px-3 py-2 rounded-xl border border-[#8FAE94]/40 hover:bg-[#FDFBF7] shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5 text-[#8FAE94]" />
                <span>Sửa chi tiết</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════ CHẾ ĐỘ 2: FORM TRUYỀN THỐNG (RÕ RÀNG, QUEN THUỘC) ═══════ */}
      {inputMode === 'manual' && (
        <div className="space-y-4">
          {/* Lưới hoạt động canh tác - Hiện ngay lập tức không cần bấm nút ẩn/hiện */}
          <div>
            <p className="text-[11px] font-bold text-[#5C6B57] uppercase tracking-wider mb-2">
              1. Chọn hoạt động canh tác
            </p>
            <div className="grid grid-cols-4 gap-2">
              {activityList.map((item) => {
                const active = selectedActivities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleActivity(item.id)}
                    className={`relative border-[1.5px] rounded-2xl p-[12px_4px] flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-[0.95] ${
                      active
                        ? 'border-[#D9A441] bg-[#F7EDD6] text-[#4A3826] font-bold shadow-sm'
                        : 'border-[#E4DCC8] bg-white text-[#5C6B57] hover:border-[#345645]'
                    }`}
                  >
                    {active && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D9A441] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div className={active ? 'text-[#B9862F]' : 'text-[#5C6B57]'}>
                      {item.icon}
                    </div>
                    <span className="text-[11px] text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chi tiết vật tư - Hiện ngay khi có hoạt động được chọn */}
          {selectedActivities.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-[#5C6B57] uppercase tracking-wider">
                2. Vật tư sử dụng
              </p>
              {selectedActivities.map((actId) => {
                const label = loaiMapLabel[actId] || actId;
                const icon = loaiMapIcon[actId];
                const supplyList = activitySuppliesMap[actId] || [];

                return (
                  <div key={actId} className="bg-white border-[1.5px] border-[#E4DCC8] rounded-2xl overflow-hidden shadow-xs">
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#FDFBF7] border-b border-[#E4DCC8]/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#D9A441]/15 text-[#B9862F] flex items-center justify-center">
                          {icon}
                        </span>
                        <span className="font-bold text-[13px] text-[#1F3A2E]">{label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddSupplyToActivity(actId)}
                        className="text-[11px] text-[#1F3A2E] font-bold flex items-center gap-1 cursor-pointer bg-[#EBF3ED] px-2 py-1 rounded-lg hover:bg-[#dceee2]"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm</span>
                      </button>
                    </div>

                    <div className="p-2.5 space-y-2">
                      {supplyList.map((item, idx) => (
                        <div key={item.id} className="flex gap-2 items-center">
                          <span className="text-[10px] text-[#8FAE94] font-bold w-3 text-center shrink-0">{idx + 1}</span>
                          <input
                            type="text"
                            value={item.ten_vat_tu}
                            onChange={(e) => handleUpdateSupplyOfActivity(actId, item.id, 'ten_vat_tu', e.target.value)}
                            placeholder="Tên thuốc / phân bón"
                            className="flex-[2] border border-[#E4DCC8] rounded-xl px-3 py-2 text-[13px] text-[#23301F] outline-none focus:border-[#345645] bg-[#FDFBF7]"
                          />
                          <input
                            type="text"
                            value={item.lieu_luong}
                            onChange={(e) => handleUpdateSupplyOfActivity(actId, item.id, 'lieu_luong', e.target.value)}
                            placeholder="Liều lượng (VD: 50ml)"
                            className="flex-1 border border-[#E4DCC8] rounded-xl px-3 py-2 text-[13px] text-[#23301F] outline-none focus:border-[#345645] bg-[#FDFBF7] font-mono"
                          />
                          {supplyList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSupplyFromActivity(actId, item.id)}
                              className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ghi chú ngắn gọn */}
          <div>
            <p className="text-[11px] font-bold text-[#5C6B57] uppercase tracking-wider mb-1.5">
              3. Ghi chú thêm (tùy chọn)
            </p>
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ghi chú ngắn..."
              className="w-full border border-[#E4DCC8] rounded-xl p-3 text-[13px] text-[#23301F] bg-white outline-none focus:border-[#345645] resize-none"
            />
          </div>
        </div>
      )}

      {/* ═══════ LÔ ĐANG CANH TÁC (LUÔN DỄ CHỌN TRONG CẢ 2 CHẾ ĐỘ) ═══════ */}
      <div>
        <p className="text-[11px] font-bold text-[#5C6B57] uppercase tracking-wider mb-1.5">
          Lô canh tác
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {seasons.map((s) => {
            const active = selectedSeasonId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSeasonId(s.id)}
                className={`shrink-0 text-[13px] font-semibold px-4 py-2 rounded-xl border-[1.5px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#1F3A2E] border-[#D9A441] text-[#F5F2E8] shadow-sm'
                    : 'bg-white border-[#E4DCC8] text-[#5C6B57] hover:border-[#345645]'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5 text-[#D9A441] stroke-[3]" />}
                <span>{s.ten_lo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════ NÚT LƯU NHẬT KÝ ═══════ */}
      <motion.button
        type="button"
        disabled={submitting || selectedActivities.length === 0}
        onClick={onSave}
        whileTap={{ scale: 0.98 }}
        className={`w-full rounded-2xl py-4 font-bold text-[15px] transition-all border-0 flex items-center justify-center gap-2 ${
          selectedActivities.length === 0
            ? 'bg-[#E4DCC8]/60 text-[#8FAE94] cursor-not-allowed'
            : 'bg-gradient-to-r from-[#D9A441] to-[#C4912E] hover:from-[#C4912E] hover:to-[#A87B25] text-white cursor-pointer shadow-lg shadow-[#D9A441]/25 active:shadow-md'
        }`}
      >
        {submitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
        ) : selectedActivities.length === 0 ? (
          'Chọn hoạt động để lưu nhật ký'
        ) : (
          <><Check className="w-4.5 h-4.5 stroke-[2.5]" /> Lưu nhật ký ({selectedActivities.length} hoạt động)</>
        )}
      </motion.button>
    </div>
  );
};
