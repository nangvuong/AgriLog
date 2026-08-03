import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface AudioRecorderProps {
  onRecorded?: (durationSeconds: number) => void;
}

export function AudioRecorder({ onRecorded }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
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

  function toggleRecord() {
    if (recording) {
      setRecording(false);
      setRecordedDuration(seconds);
      onRecorded?.(seconds);
    } else {
      setSeconds(0);
      setRecordedDuration(null);
      setRecording(true);
    }
  }

  function fmt(s: number) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const r = String(s % 60).padStart(2, '0');
    return `${m}:${r}`;
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
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

        <div className="mt-3 flex items-center justify-between">
          <span
            className="text-[13px] text-[#52502E]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {recording
              ? `Đang ghi · ${fmt(seconds)}`
              : recordedDuration
                ? `Đã ghi · ${fmt(recordedDuration)}`
                : 'Chưa có bản ghi'}
          </span>

          <div className="flex items-center gap-2">
            {recordedDuration != null && !recording && (
              <Button
                variant="outline"
                size="icon"
                type="button"
                className="h-9 w-9 rounded-full"
                aria-label="Nghe lại"
              >
                <Play className="h-4 w-4" strokeWidth={1.75} />
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
            {recordedDuration != null && !recording && (
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => {
                  setRecordedDuration(null);
                  setSeconds(0);
                }}
                className="h-9 w-9 rounded-full"
                aria-label="Ghi lại"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AudioRecorder;
