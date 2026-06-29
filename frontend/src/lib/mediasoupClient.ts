import { Device } from 'mediasoup-client';

let device: Device | null = null;

export function getDevice(): Device {
  if (!device) {
    device = new Device();
  }
  return device;
}

export function resetDevice(): void {
  device = null;
}
