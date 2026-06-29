'use client';

import { Label } from '@/components/ui/label';
import type { DeviceInfo } from '@/types/media.types';

interface DeviceSelectorProps {
  label: string;
  devices: DeviceInfo[];
  value: string;
  onChange: (deviceId: string) => void;
}

export function DeviceSelector({
  label,
  devices,
  value,
  onChange,
}: DeviceSelectorProps) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 flex h-10 w-full rounded-lg border border-sky-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        {devices.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
}
