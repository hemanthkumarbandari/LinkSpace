export interface DeviceInfo {
  deviceId: string;
  label: string;
}

export interface AvailableDevices {
  cameras: DeviceInfo[];
  mics: DeviceInfo[];
  speakers: DeviceInfo[];
}
