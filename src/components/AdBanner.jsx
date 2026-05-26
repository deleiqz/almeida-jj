import { useEffect, useRef } from 'react';

/**
 * Componente de anúncio Google AdSense
 * Renderiza um bloco de anúncio responsivo nas páginas públicas.
 * Não aparece nas páginas internas do sistema (dashboard, etc).
 */
const AdBanner = ({ style = {}, format = 'auto', slot = '' }) => {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Evita push duplicado no mesmo elemento
    if (pushed.current) return;
    try {
      if (window.adsbygoogle && adRef.current) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (err) {
      // AdSense pode falhar silenciosamente em dev/localhost
      console.log('AdSense não carregado (normal em dev):', err.message);
    }
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      overflow: 'hidden', 
      margin: '20px 0',
      borderRadius: '12px',
      minHeight: '90px',
      ...style 
    }}>
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5994593914144478"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
