// <model-viewer> (Google) özel HTML etiketi için JSX tanımı. Kütüphane public/vendor/model-viewer.min.js'ten,
// AR penceresi açılınca yüklenir (npm'e eklenmedi: projedeki three sürümüyle peer bağımlılık çakışması var).
import type React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean | string;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'ar-placement'?: string;
        'camera-controls'?: boolean | string;
        'auto-rotate'?: boolean | string;
        'touch-action'?: string;
        'shadow-intensity'?: string;
        exposure?: string;
        'environment-image'?: string;
        'camera-orbit'?: string;
        'interaction-prompt'?: string;
      };
    }
  }
}
