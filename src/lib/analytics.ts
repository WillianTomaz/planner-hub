export const GA_ID = 'G-W1T2C9910H';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * initGA garante que a função gtag exista e configura o GA4.
 * Se o snippet do `index.html` já foi adicionado, essa função é uma no-op para
 * não duplicar a configuração — ainda assim estabelece typings para TS.
 */
export const initGA = (installScript = false) => {
  window.dataLayer = window.dataLayer || [];

  // Se pedir para injetar o script dinamicamente (opcional), faça isso.
  if (installScript && typeof document !== 'undefined') {
    const id = `gtag-js-${GA_ID}`;
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      s.id = id;
      document.head.appendChild(s);
    }
  }

  // Garante a função gtag para chamadas subsequentes
  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      // push the args array so downstream consumers can read the payload
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    // Desabilitamos page_view automático para SPAs e enviamos manualmente
    window.gtag('config', GA_ID, { send_page_view: false });
  }
};

/** Envia page_view para o GA4 */
export const pageview = (path: string) => {
  try {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_location: window.location.href,
      });
    }
  } catch (e) {
    // silencioso em produção
    console.error('GA pageview error', e);
  }
};

/** Envia evento customizado */
export const event = (name: string, params: Record<string, unknown> = {}) => {
  try {
    if (window.gtag) {
      window.gtag('event', name, params);
    }
  } catch (e) {
    console.error('GA event error', e);
  }
};