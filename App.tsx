import React, { useState } from 'react';

export default function App() {
  // Moneda de entrada seleccionada ('USDT' | 'USD' | 'Bs')
  const [entryCurrency, setEntryCurrency] = useState<'USDT' | 'USD' | 'Bs'>('USD');
  const [selectedBank, setSelectedBank] = useState('BDV');
  const [inputAmount, setInputAmount] = useState<number | string>(500);

  // Tasas de cambio
  const [bcvRate, setBcvRate] = useState<number | string>(879.1225);
  const [montoRate, setMontoRate] = useState<number | string>(1005.36);
  const [generalRate, setGeneralRate] = useState<number | string>(1007.00);
  const [activeRate, setActiveRate] = useState<number | string>(1005.36);
  const [onlyVerified, setOnlyVerified] = useState(true);

  // Comisiones del ciclo (%)
  const [buyFee, setBuyFee] = useState<number | string>(0.5);       // 0.5% BDV
  const [bdvSendFee, setBdvSendFee] = useState<number | string>(2.5); // 2.5% Salida BDV
  const [binanceFee, setBinanceFee] = useState<number | string>(4.1); // 4.1% Recarga Binance

  // Convertir valores a número seguro
  const amountVal = Number(inputAmount) || 0;
  const bcvVal = Number(bcvRate) || 0;
  const activeP2pVal = Number(activeRate) || 0;
  const buyFeeVal = Number(buyFee) || 0;
  const bdvFeeVal = Number(bdvSendFee) || 0;
  const binanceFeeVal = Number(binanceFee) || 0;

  // --- LÓGICA DE CÁLCULO MÚLTIPLE ---
  let calculatedUsd = 0;
  let totalBsSpent = 0;

  const effectiveBcvRate = bcvVal * (1 + buyFeeVal / 100);

  if (entryCurrency === 'USD') {
    calculatedUsd = amountVal;
    totalBsSpent = amountVal * effectiveBcvRate;
  } else if (entryCurrency === 'Bs') {
    totalBsSpent = amountVal;
    calculatedUsd = effectiveBcvRate > 0 ? amountVal / effectiveBcvRate : 0;
  } else {
    // Si entra por USDT directamente
    const rawBs = amountVal * activeP2pVal;
    totalBsSpent = rawBs;
    calculatedUsd = effectiveBcvRate > 0 ? rawBs / effectiveBcvRate : 0;
  }

  // 1. Salida BDV (-2.5%)
  const usdAfterBdv = calculatedUsd * (1 - bdvFeeVal / 100);

  // 2. Entrada Binance (-4.1%)
  const netUsdtInBinance = usdAfterBdv * (1 - binanceFeeVal / 100);

  // 3. Bolívares finales tras la venta P2P
  const totalBsEarned = netUsdtInBinance * activeP2pVal;

  // Ganancia / Rendimiento NETA
  const profitBs = totalBsEarned - totalBsSpent;
  const profitUsdt = activeP2pVal > 0 ? profitBs / activeP2pVal : 0;

  // Manejo flexible de input (borrado de cero e inserción directa)
  const handleChange = (setter: React.Dispatch<React.SetStateAction<number | string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setter(val === '' ? '' : val);
  };

  return (
    <div style={{ backgroundColor: '#0b0e11', color: '#eaecef', minHeight: '100vh', padding: '15px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* TARJETA PRINCIPAL TIPO V2.1 */}
      <div style={{ backgroundColor: '#181a20', padding: '20px', borderRadius: '16px', border: '1px solid #2b313a', maxWidth: '520px', margin: '0 auto' }}>
        
        {/* ENCABEZADO */}
        <h2 style={{ color: '#f0b90b', textAlign: 'center', marginTop: 0, marginBottom: '15px', fontSize: '20px' }}>
          Calcula tus pedaleos
        </h2>

        {/* SELECCIÓN DE BANCO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: '#848e9c', fontWeight: 'bold' }}>BANCO</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '15px' }}>
          {['BDV', 'BBVA', 'Mercantil', 'Banesco'].map((bank) => (
            <button
              key={bank}
              onClick={() => setSelectedBank(bank)}
              style={{
                backgroundColor: selectedBank === bank ? '#2b2f36' : '#181a20',
                color: selectedBank === bank ? '#f0b90b' : '#848e9c',
                border: selectedBank === bank ? '1px solid #f0b90b' : '1px solid #2b313a',
                padding: '8px 4px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {bank}
            </button>
          ))}
        </div>

        {/* PESTAÑAS MONEDA DE ENTRADA */}
        <span style={{ fontSize: '11px', color: '#848e9c', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>MONEDA DE ENTRADA</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '15px' }}>
          {[
            { id: 'USDT', label: '₮ USDT' },
            { id: 'USD', label: '💵 USD comprador' },
            { id: 'Bs', label: '🇻🇪 Bs disponibles' }
          ].map((curr) => (
            <button
              key={curr.id}
              onClick={() => setEntryCurrency(curr.id as 'USDT' | 'USD' | 'Bs')}
              style={{
                backgroundColor: entryCurrency === curr.id ? '#0b0e11' : '#181a20',
                color: entryCurrency === curr.id ? '#2563eb' : '#848e9c',
                border: entryCurrency === curr.id ? '1px solid #2563eb' : '1px solid #2b313a',
                padding: '10px 4px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              {curr.label}
            </button>
          ))}
        </div>

        {/* FILA DE MONTO Y CONVERSIONES INTEGRADAS */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#848e9c', marginBottom: '6px' }}>
            <span>DATOS DE OPERACIÓN</span>
            <span>BCV: <strong style={{ color: '#f0b90b' }}>{bcvVal} Bs</strong></span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', backgroundColor: '#0b0e11', padding: '10px', borderRadius: '10px', border: '1px solid #2b313a', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#848e9c', display: 'block' }}>MONTO ({entryCurrency})</span>
              <input
                type="number"
                step="any"
                value={inputAmount}
                onChange={handleChange(setInputAmount)}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 'bold', outline: 'none' }}
              />
            </div>
            <div style={{ borderLeft: '1px solid #2b313a', paddingLeft: '8px' }}>
              <span style={{ fontSize: '10px', color: '#0ecb81', fontWeight: 'bold', display: 'block' }}>BS INTERVENCIÓN</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0ecb81' }}>{totalBsSpent.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs</span>
            </div>
            <div style={{ borderLeft: '1px solid #2b313a', paddingLeft: '8px' }}>
              <span style={{ fontSize: '10px', color: '#00c0ef', fontWeight: 'bold', display: 'block' }}>USDT (P2P)</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#00c0ef' }}>{netUsdtInBinance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* AJUSTE DE COMISIONES DEL CICLO */}
        <div style={{ border: '1px solid #2b313a', borderRadius: '8px', padding: '10px', backgroundColor: '#0b0e11', marginBottom: '15px' }}>
          <span style={{ fontSize: '10px', color: '#848e9c', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>COMISIONES DEL CICLO (%)</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            <div>
              <span style={{ fontSize: '9px', color: '#848e9c' }}>COMPRA (%)</span>
              <input type="number" step="any" value={buyFee} onChange={handleChange(setBuyFee)} onFocus={(e) => e.target.select()} style={{ width: '100%', backgroundColor: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', padding: '4px', fontSize: '11px' }} />
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#848e9c' }}>ENVÍO BDV (%)</span>
              <input type="number" step="any" value={bdvSendFee} onChange={handleChange(setBdvSendFee)} onFocus={(e) => e.target.select()} style={{ width: '100%', backgroundColor: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', padding: '4px', fontSize: '11px' }} />
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#848e9c' }}>BINANCE (%)</span>
              <input type="number" step="any" value={binanceFee} onChange={handleChange(setBinanceFee)} onFocus={(e) => e.target.select()} style={{ width: '100%', backgroundColor: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', padding: '4px', fontSize: '11px' }} />
            </div>
          </div>
        </div>

        {/* SECCIÓN DE OFERTAS P2P */}
        <div style={{ border: '1px solid #2b313a', borderRadius: '10px', padding: '12px', backgroundColor: '#0b0e11', marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f0b90b' }}>TASAS P2P</span>
            <label style={{ fontSize: '10px', color: '#848e9c', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
              />
              Solo verificados Binance 🟡
            </label>
          </div>

          {/* OPCIÓN 1: TASA PARA TU MONTO */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#f0b90b', fontWeight: 'bold' }}>TASA PARA TU MONTO</div>
              <div style={{ fontSize: '10px', color: '#848e9c' }}>{selectedBank}, Bank Transfer</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                step="any"
                value={montoRate}
                onChange={handleChange(setMontoRate)}
                onFocus={(e) => e.target.select()}
                style={{ width: '80px', backgroundColor: '#181a20', border: '1px solid #2b313a', color: '#f0b90b', fontWeight: 'bold', padding: '4px', borderRadius: '4px', textAlign: 'right' }}
              />
              <button
                onClick={() => setActiveRate(montoRate)}
                style={{ backgroundColor: Number(activeRate) === Number(montoRate) ? '#f0b90b' : '#2b313a', color: Number(activeRate) === Number(montoRate) ? '#000' : '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
              >
                Usar
              </button>
            </div>
          </div>

          <hr style={{ borderColor: '#2b313a', margin: '6px 0' }} />

          {/* OPCIÓN 2: MERCADO GENERAL */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#0ecb81', fontWeight: 'bold' }}>MERCADO GENERAL</div>
              <div style={{ fontSize: '10px', color: '#848e9c' }}>{selectedBank}, Bank Transfer</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0ecb81' }}>{Number(generalRate).toFixed(2)} Bs</span>
              <button
                onClick={() => setActiveRate(generalRate)}
                style={{ backgroundColor: Number(activeRate) === Number(generalRate) ? '#0ecb81' : '#2b313a', color: Number(activeRate) === Number(generalRate) ? '#000' : '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
              >
                Usar
              </button>
            </div>
          </div>
        </div>

        {/* GANANCIA Y RESUMEN FINAL (PNL) */}
        <div style={{ backgroundColor: profitBs >= 0 ? '#0b291b' : '#361718', border: `1px solid ${profitBs >= 0 ? '#0ecb81' : '#f6465d'}`, padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: profitBs >= 0 ? '#0ecb81' : '#f6465d', fontWeight: 'bold' }}>
            {profitBs >= 0 ? 'GANANCIA NETO ESTIMADA (PNL)' : 'PÉRDIDA ESTIMADA'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'extrabold', color: profitBs >= 0 ? '#0ecb81' : '#f6465d', margin: '4px 0' }}>
            +{profitBs.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs
          </div>
          <div style={{ fontSize: '12px', color: '#eaecef', fontWeight: 'bold' }}>
            ≈ +{profitUsdt.toFixed(2)} USDT
          </div>
        </div>

      </div>
    </div>
  );
}
