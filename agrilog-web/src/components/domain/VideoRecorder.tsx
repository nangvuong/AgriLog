import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Upload,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  Camera,
  Film,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  aiExtractionService,
  STTResponse,
} from '@/services/api/ai-extraction.service';

export interface VideoRecorderProps {
  onExtracted?: (result: STTResponse, videoBlob?: Blob, videoUrl?: string) => void;
  onVideoSelected?: (videoBlob: Blob, videoUrl: string) => void;
}

export function VideoRecorder({ onExtracted, onVideoSelected }: VideoRecorderProps) {
  const [mode, setMode] = useState<'RECORD' | 'UPLOAD'>('RECORD');
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCameraStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function stopCameraStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setCameraError(
        'Không thể truy cập camera/micro. Vui lòng kiểm tra quyền truy cập hoặc chuyển sang chế độ tải video từ thiết bị.',
      );
    }
  }

  async function handleStartRecording() {
    setVideoBlob(null);
    setVideoUrl(null);
    setErrorMessage(null);

    if (!streamRef.current) {
      await startCamera();
    }
    if (!streamRef.current) return;

    videoChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/webm';

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoBlob(blob);
        setVideoUrl(url);
        onVideoSelected?.(blob, url);
        stopCameraStream();
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      setErrorMessage('Lỗi khởi tạo quay video trên thiết bị này.');
    }
  }

  function handleStopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoBlob(file);
    setVideoUrl(url);
    onVideoSelected?.(file, url);
    setErrorMessage(null);
  }

  async function handleSendToAI() {
    if (!videoBlob && !description.trim()) {
      setErrorMessage('Vui lòng quay/tải lên video hoặc nhập mô tả để phân tích.');
      return;
    }
    setIsExtracting(true);
    setErrorMessage(null);

    try {
      const blobToSend =
        videoBlob || new Blob([description], { type: 'text/plain' });
      const filename = videoBlob
        ? 'recorded_video.webm'
        : 'video_description.txt';

      const response = await aiExtractionService.extractFromVideo(
        blobToSend,
        filename,
        description.trim() || undefined,
      );

      setIsExtracting(false);
      if (response && response.status === 'success') {
        onExtracted?.(response, videoBlob || undefined, videoUrl || undefined);
      } else {
        setErrorMessage(
          response?.error || 'Không nhận diện được hoạt động nào từ video.',
        );
      }
    } catch (err: any) {
      setIsExtracting(false);
      setErrorMessage('Lỗi khi gửi video lên server bóc tách.');
    }
  }

  function handleReset() {
    handleStopRecording();
    stopCameraStream();
    setVideoBlob(null);
    setVideoUrl(null);
    setSeconds(0);
    setErrorMessage(null);
  }

  function formatTime(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="space-y-4">
      {/* Mode switches */}
      <div className="flex items-center gap-2 border-b border-[#1C2B1E]/10 pb-3">
        <button
          type="button"
          onClick={() => {
            setMode('RECORD');
            if (!videoBlob) startCamera();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'RECORD'
              ? 'bg-[#1C2B1E] text-white shadow-sm'
              : 'text-[#1C2B1E]/70 hover:bg-[#1C2B1E]/5'
            }`}
        >
          <Camera className="w-4 h-4 text-[#C9A227]" />
          Quay video trực tiếp
        </button>
        <button
          type="button"
          onClick={() => {
            stopCameraStream();
            setMode('UPLOAD');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'UPLOAD'
              ? 'bg-[#1C2B1E] text-white shadow-sm'
              : 'text-[#1C2B1E]/70 hover:bg-[#1C2B1E]/5'
            }`}
        >
          <Film className="w-4 h-4 text-[#C9A227]" />
          Tải video từ thiết bị
        </button>
      </div>

      <Card className="border border-[#1C2B1E]/15 bg-[#FFFDF6] shadow-sm overflow-hidden">
        <CardContent className="p-5 space-y-4">
          {mode === 'RECORD' && !videoUrl && (
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Không thể bật camera</p>
                    <p className="mt-1 text-xs opacity-90">{cameraError}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-3 text-xs bg-white"
                      onClick={() => setMode('UPLOAD')}
                    >
                      Chuyển sang Tải video
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video max-h-[320px] bg-[#1C2B1E]/95 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                  <video
                    ref={liveVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {isRecording && (
                    <div className="absolute top-3 left-3 bg-red-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      REC • {formatTime(seconds)}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                {!isRecording ? (
                  <Button
                    type="button"
                    onClick={handleStartRecording}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2.5 font-medium flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    Bắt đầu quay video
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleStopRecording}
                    className="bg-[#1C2B1E] hover:bg-[#1C2B1E]/90 text-[#FFFDF6] rounded-full px-6 py-2.5 font-medium flex items-center gap-2 shadow-sm"
                  >
                    <Square className="w-4 h-4 fill-current text-red-500" />
                    Dừng & Lưu video ({formatTime(seconds)})
                  </Button>
                )}
              </div>
            </div>
          )}

          {mode === 'UPLOAD' && !videoUrl && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#1C2B1E]/20 hover:border-[#C9A227] rounded-xl p-8 text-center bg-[#1C2B1E]/[0.02] hover:bg-[#1C2B1E]/[0.04] transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-[#1C2B1E]/10 group-hover:bg-[#C9A227]/20 flex items-center justify-center mx-auto mb-3 transition-colors">
                <Upload className="w-6 h-6 text-[#1C2B1E] group-hover:text-[#C9A227] transition-colors" />
              </div>
              <p className="text-sm font-medium text-[#1C2B1E]">
                Nhấn để chọn video từ thiết bị hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-[#1C2B1E]/60 mt-1">
                Hỗ trợ MP4, MOV, WEBM (Tối đa 100MB)
              </p>
            </div>
          )}

          {videoUrl && (
            <div className="space-y-3">
              <div className="relative aspect-video max-h-[280px] bg-black rounded-xl overflow-hidden shadow-sm">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#1C2B1E]/70 bg-white/70 px-3 py-2 rounded-lg border border-[#1C2B1E]/10">
                <span className="flex items-center gap-1.5 font-medium text-[#1C2B1E]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Đã chuẩn bị video thành công
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-red-600 hover:underline font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Chọn lại / Quay lại
                </button>
              </div>
            </div>
          )}

          {/* Optional description / notes for better AI accuracy */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-[#1C2B1E]/80 block">
              Mô tả bổ sung về video (tuỳ chọn)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Lô A1 bưởi da xanh bón 20kg phân hữu cơ vi sinh, có sâu vẽ bùa nhẹ..."
              className="min-h-[70px] text-sm bg-white border-[#1C2B1E]/15 rounded-xl focus:border-[#C9A227]"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1C2B1E]/10">

            <Button
              type="button"
              onClick={handleSendToAI}
              disabled={isExtracting || (!videoBlob && !description.trim())}
              className="bg-[#1C2B1E] hover:bg-[#1C2B1E]/90 text-[#FFFDF6] px-5 py-2 rounded-xl text-sm font-medium shadow-sm flex items-center gap-2"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" />
                  Đang phân tích video...
                </>
              ) : (
                <>
                  <span>Phân tích & Trích xuất</span>
                  <Send className="w-4 h-4 text-[#C9A227]" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
