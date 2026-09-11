import React from 'react';
import { Activity, Gauge } from 'lucide-react';
import { TelemetryData } from '../types';

interface TelemetryCardProps {
  telemetry: TelemetryData;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({ telemetry }) => {
  return (
    <div
      id="telemetry-performance-card"
      className="bg-[#FFFFFF] rounded-2xl border-2 border-[#171717] shadow-retro p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#2BD7D0]" />
          <h3 className="font-display font-bold text-sm tracking-wide text-[#171717] uppercase">
            04 / Pipeline Telemetry
          </h3>
        </div>
        <span className="text-[10px] font-pixel bg-[#FFF0A5] px-2 py-0.5 rounded border border-[#171717]">
          {telemetry.modelStatus === 'mediapipe'
            ? 'MEDIAPIPE AI'
            : telemetry.modelStatus === 'optical-fallback'
            ? 'OPTICAL CV'
            : 'INITIALIZING'}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2">
        {/* FPS */}
        <div className="bg-[#FBF4E6] rounded-xl border-2 border-[#171717] p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#666666] uppercase block">Throughput</span>
            <span className="text-xl font-display font-extrabold text-[#171717]">
              {telemetry.fps} <span className="text-xs font-normal text-[#666666]">FPS</span>
            </span>
          </div>
          <Gauge size={20} className="text-[#9A8CE6]" />
        </div>

        {/* Latency */}
        <div className="bg-[#FBF4E6] rounded-xl border-2 border-[#171717] p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#666666] uppercase block">Latency</span>
            <span className="text-xl font-display font-extrabold text-[#171717]">
              {telemetry.latencyMs} <span className="text-xs font-normal text-[#666666]">ms</span>
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#2BD7D0] border border-[#171717] animate-ping" />
        </div>
      </div>

      {/* AI Subsystems Status Pills */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-bold text-[#666666] uppercase tracking-wider block">
          Subsystem Status
        </span>
        <div className="grid grid-cols-4 gap-1.5 text-center font-pixel text-[9px]">
          <div
            className={`py-1 rounded border-2 border-[#171717] ${
              telemetry.cameraActive ? 'bg-[#2BD7D0] text-[#171717] font-bold' : 'bg-gray-100 text-gray-400'
            }`}
          >
            CAM
          </div>
          <div
            className={`py-1 rounded border-2 border-[#171717] ${
              telemetry.faceActive ? 'bg-[#2BD7D0] text-[#171717] font-bold' : 'bg-gray-100 text-gray-400'
            }`}
          >
            FACE
          </div>
          <div
            className={`py-1 rounded border-2 border-[#171717] ${
              telemetry.handActive ? 'bg-[#2BD7D0] text-[#171717] font-bold' : 'bg-gray-100 text-gray-400'
            }`}
          >
            HAND
          </div>
          <div
            className={`py-1 rounded border-2 border-[#171717] ${
              telemetry.mouthActive ? 'bg-[#2BD7D0] text-[#171717] font-bold' : 'bg-gray-100 text-gray-400'
            }`}
          >
            MOUTH
          </div>
        </div>
      </div>
    </div>
  );
};
