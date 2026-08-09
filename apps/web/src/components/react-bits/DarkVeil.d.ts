import type { JSX } from 'react';

declare const DarkVeil: (props: {
  hueShift?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  speed?: number;
  scanlineFrequency?: number;
  warpAmount?: number;
  resolutionScale?: number;
}) => JSX.Element;

export default DarkVeil;
