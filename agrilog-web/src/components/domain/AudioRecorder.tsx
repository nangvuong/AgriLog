import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Loader2,
  Volume2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  aiExtractionService,
  STTResponse,
} from '@/services/api/ai-extraction.service';

export interface AudioRecorderProps {
  onRecorded?: (durationSeconds: number, audioBlob?: Blob) => void;
  onExtracted?: (result: STTResponse) => void;
}

export function AudioRecorder({ onRecorded, onExtracted }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState<number | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // AI Extraction states
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState<STTResponse | null>(
    null,
  );
  const [editableSttText, setEditableSttText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const bars = useRef(
    Array.from({ length: 28 }, () => 20 + Math.random() * 70),
  );

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording]);

  async function startRecording() {
    setErrorMessage(null);
    setExtractedResult(null);
    setEditableSttText('');
    setSeconds(0);
    setRecordedDuration(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      if (
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function'
      ) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, {
            type: 'audio/webm;codecs=opus',
          });
          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setRecording(true);
      } else {
        // Fallback simulation khi trình duyệt hoặc HTTP không hỗ trợ mic
        setRecording(true);
      }
    } catch (err) {
      // Fallback simulation nếu từ chối quyền mic để vẫn cho phép test tính năng AI
      console.warn('Microphone access denied or unavailable. Simulating audio recording.');
      setRecording(true);
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    } else {
      // Simulation fallback blob
      const simulatedBlob = new Blob(['simulated-audio-data'], {
        type: 'audio/webm',
      });
      setAudioBlob(simulatedBlob);
      const url = URL.createObjectURL(simulatedBlob);
      setAudioUrl(url);
    }

    setRecording(false);
    setRecordedDuration(seconds);
    onRecorded?.(seconds, audioBlob || undefined);
  }

  function toggleRecord() {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function togglePlayback() {
    if (!audioUrl) return;
    if (!audioElRef.current) {
      audioElRef.current = new Audio(audioUrl);
      audioElRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElRef.current.play().catch(() => { });
      setIsPlaying(true);
    }
  }

  async function handleAiExtract() {
    if (!audioBlob && !recordedDuration) {
      setErrorMessage('Vui lòng ghi âm trước khi bóc tách nhật ký.');
      return;
    }

    setIsExtracting(true);
    setErrorMessage(null);

    try {
      const blobToUse =
        audioBlob ||
        new Blob(['simulated-voice-note'], { type: 'audio/webm' });
      const res = await aiExtractionService.extractFromVoice(blobToUse);
      setExtractedResult(res);
      setEditableSttText(res.raw_text || '');
      onExtracted?.(res);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
        'Có lỗi xảy ra khi bóc tách giọng nói. Vui lòng thử lại.',
      );
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleReExtractSttText() {
    if (!editableSttText || !editableSttText.trim()) return;
    setIsExtracting(true);
    setErrorMessage(null);

    try {
      const res = await aiExtractionService.extractFromText(
        editableSttText.trim(),
      );
      setExtractedResult(res);
      onExtracted?.(res);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          'Có lỗi xảy ra khi bóc tách lại văn bản STT. Vui lòng thử lại.',
      );
    } finally {
      setIsExtracting(false);
    }
  }

  function fmt(s: number) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const r = String(s % 60).padStart(2, '0');
    return `${m}:${r}`;
  }

  return (
    <div className="space-y-3">
      <Card className="border border-[#E1E5CB] bg-[#FFFDF6] shadow-sm">
        <CardContent className="p-4">
          {extractedResult ? (
            <div className="relative rounded-xl border border-[#E1E5CB] bg-white/95 p-2 shadow-xs focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]">
              <Textarea
                rows={2}
                value={editableSttText}
                onChange={(e) => setEditableSttText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReExtractSttText();
                  }
                }}
                placeholder="Nội dung STT từ giọng nói (có thể chỉnh sửa)..."
                className="border-0 bg-transparent p-1 text-[13px] shadow-none focus-visible:ring-0 resize-none text-[#1C2B1E]"
              />
            </div>
          ) : (
            <div className="flex h-14 items-center gap-[3px] overflow-hidden">
              {bars.current.map((h, i) => (
                <span
                  key={i}
                  className="w-1 shrink-0 rounded-full"
                  style={{
                    height: `${recording || recordedDuration ? h : 12}%`,
                    background: recording ? '#C15A34' : '#C9A227',
                    opacity: recording && i % 3 === 0 ? 0.6 : 1,
                    transition: 'height 0.2s',
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span
              className="text-[13px] text-[#52502E]"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {recording
                ? `Đang ghi âm · ${fmt(seconds)}`
                : recordedDuration
                  ? `Đã ghi âm · ${fmt(recordedDuration)}`
                  : 'Nhấn mic để bắt đầu ghi âm'}
            </span>

            <div className="flex items-center gap-2">
              {recordedDuration != null && !recording && (
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={togglePlayback}
                  className="h-9 w-9 rounded-full border-[#C9A227] text-[#8A6D1F] hover:bg-[#F7F2DF]"
                  aria-label="Nghe lại"
                  title="Nghe lại bản ghi"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </Button>
              )}
              <Button
                type="button"
                onClick={toggleRecord}
                variant={recording ? 'destructive' : 'primary'}
                size="icon"
                className="h-11 w-11 rounded-full shadow-sm"
                aria-label={recording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
              >
                {recording ? (
                  <Square
                    className="h-4 w-4"
                    strokeWidth={2}
                    fill="currentColor"
                  />
                ) : (
                  <Mic className="h-5 w-5" strokeWidth={1.75} />
                )}
              </Button>
              {(recordedDuration != null || extractedResult != null) &&
                !recording && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      onClick={() => {
                        if (audioElRef.current) {
                          audioElRef.current.pause();
                          setIsPlaying(false);
                        }
                        setRecordedDuration(null);
                        setSeconds(0);
                        setExtractedResult(null);
                        setEditableSttText('');
                        setAudioBlob(null);
                      }}
                      className="h-9 w-9 rounded-full"
                      aria-label="Ghi lại"
                      title="Ghi lại"
                    >
                      <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
                    </Button>
                    <Button
                      type="button"
                      onClick={
                        extractedResult ? handleReExtractSttText : handleAiExtract
                      }
                      disabled={
                        isExtracting ||
                        (extractedResult ? !editableSttText.trim() : false)
                      }
                      size="icon"
                      className="h-10 w-10 rounded-full bg-[#1C2B1E] text-[#C9A227] shadow-md hover:bg-[#2C3F2E] transition"
                      aria-label={
                        extractedResult
                          ? 'Gửi lại văn bản chỉnh sửa'
                          : 'Gửi giọng nói'
                      }
                      title={
                        extractedResult ? 'Gửi lại cho AI' : 'Gửi giọng nói cho AI'
                      }
                    >
                      {isExtracting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" strokeWidth={2} />
                      )}
                    </Button>
                  </>
                )}
            </div>
          </div>

          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-[12.5px] text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

export default AudioRecorder;
