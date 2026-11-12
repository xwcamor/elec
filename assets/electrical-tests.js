(() => {
  const configBridge=window.ELEC_CONFIG_BRIDGE;
  if(!configBridge){console.error('ELEC: no se pudo inicializar el módulo de configuración.');return;}
  const $=s=>document.querySelector(s);
  const queryAll=(s,root=document)=>[...root.querySelectorAll(s)];
  const clone=configBridge.clone, api=configBridge.api, readApiResponse=configBridge.readApiResponse;
  const toast=configBridge.toast, esc=configBridge.esc, normalizeConfig=configBridge.normalizeConfig;
  const electricalTestsBlockReason=configBridge.electricalTestsBlockReason;
  const refreshSidebarAccess=configBridge.refreshSidebarAccess, showOnlyMain=configBridge.showOnlyMain;
  const getConfig=()=>configBridge.getElectricalConfig();
  const transformer=new Proxy({}, {get:(_target,key)=>configBridge.getTransformer()?.[key]});
  const localDateTime=function(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16);};
  var activeExecutionId=null, activeExecutionMode='new', activeSpecificCode='', executionConfigContext=null;
  const specificTemplates={
    WINDING_RESISTANCE:{title:'Resistencia de devanados',hint:'Campos LAP: sección AT/BT, TAP, fase o par de bornes, corriente de prueba, temperatura y resistencias medida/referida a 75 °C. La comparación entre fases ≤5% se documenta en observaciones.',prefix:'WR',cols:[['winding','Bobinado (AT/BT)'],['tap','TAP'],['phase','Fase / conexión'],['test_current_a','I de prueba (A)'],['temperature','Temperatura medida (°C)'],['resistance_measured','Resistencia medida'],['resistance_referred_75c','Resistencia referida 75 °C'],['notes','Observación']]},
    INSULATION_RESISTANCE:{title:'Resistencia de aislamiento',hint:'Tres puntos LAP: AT-BT, AT-Masa y BT-Masa. Registra tensión aplicada, lecturas a 15 s, 30 s, 45 s y 1 min.',prefix:'IR',cols:[['point','Punto de aplicación'],['applied_voltage_kv','Voltaje aplicado (kV)'],['reading_15s','Resistencia a 15 s'],['reading_30s','Resistencia a 30 s'],['reading_45s','Resistencia a 45 s'],['reading_1min','Resistencia a 1 min'],['absorption_index','Índice de absorción (1 min / 30 s)'],['reading_unit','Unidad de lectura'],['notes','Observación']]},
    CAPACITANCE:{title:'Capacitancia complementaria',hint:'Ensayo adicional; no aparece como bloque independiente en el protocolo LAP.',prefix:'CAP',cols:[['point','Punto / borne'],['connection','Conexión de prueba'],['test_voltage','Tensión de prueba'],['capacitance','Capacitancia'],['unit','Unidad'],['frequency','Frecuencia'],['temperature','Temperatura °C'],['notes','Observación']]},
    POWER_FACTOR:{title:'Factor de potencia del transformador',hint:'Seis modos LAP. Capacitancia medida = capacitancia de fuente (F) × 10⁹, expresada en nF. Estado CORRECTO si el FP corregido es menor que 1%; en caso contrario, OBSERVADO.',prefix:'PF',cols:[['measurement','Modo de prueba'],['test_voltage','Tensión de prueba (V)'],['power_factor_measured','Factor de Potencia medido (%)'],['power_factor_corrected_20c','Factor de Potencia corregido (%)'],['capacitance_source_f','Capacitancia'],['capacitance_measured','Capacitancia medida (nF)'],['status','Estado']]},
    EXCITATION:{title:'Corriente de excitación',hint:'Selecciona los TAP a ensayar. Registra tensión y frecuencia, más corriente y pérdidas para U-0, V-0 y W-0. La evaluación técnica se confirma por el especialista.',prefix:'EXC',cols:[['tap','TAP'],['test_voltage_kv','Tensión de prueba (kV)'],['frequency_hz','Frecuencia (Hz)'],['current_u_ma','Corriente U-0 (mA)'],['losses_u_w','Pérdidas U-0 (W)'],['current_v_ma','Corriente V-0 (mA)'],['losses_v_w','Pérdidas V-0 (W)'],['current_w_ma','Corriente W-0 (mA)'],['losses_w_w','Pérdidas W-0 (W)'],['evaluation','Estado'],['notes','Observación']]},
    BUSHING:{title:'Factor de potencia y capacitancia de bushings',hint:'Campos LAP por borne: serie, tensión de prueba, FP de placa/medido, capacitancia de placa/medida y variación. La variación se calcula a partir de capacitancias; el FP no tiene umbral automático.',prefix:'BUSH',cols:[['terminal','Borne'],['serial','Serie'],['test_voltage','Tensión de prueba'],['power_factor_plate','FP de placa'],['power_factor_measured','FP medido'],['capacitance_plate','Capacitancia de placa'],['capacitance_measured','Capacitancia medida'],['variation_percent','Variación (%)'],['result','Resultado capacitancia'],['notes','Observación']]},
    SFRA:{title:'Análisis de respuesta al barrido de frecuencia (SFRA)',hint:'Tres configuraciones LAP: AT–BT abierto, BT–AT abierto y AT–BT en cortocircuito. Documenta curva de campo y comparación con fábrica.',prefix:'SFRA',cols:[['connection','Configuración'],['tap','TAP'],['file_reference','Archivo / curva de campo'],['comparison_reference','Curva de referencia (fábrica)'],['comparison_result','Resultado de comparación'],['evaluation','Evaluación manual'],['notes','Observación']]},
    ARRESTER:{title:'Prueba de pararrayos (AT / MT)',hint:'Campos LAP: fase, V. salida, I. salida, modo GST, pérdidas y capacitancia. Los encabezados no fijan unidades; registra las unidades del equipo.',prefix:'ARR',cols:[['section','Sección (AT/MT)'],['phase','Fase / borne'],['output_voltage','V. salida'],['output_current','I. salida'],['test_mode','Modo de prueba (GST)'],['losses_measured','Pérdidas medidas'],['capacitance_measured','Capacitancia medida'],['notes','Observación']]},
    PROTECTIONS:{title:'Verificación de protecciones propias',hint:'Campos LAP: ítem, accesorio, bornes, contacto, condición, ajuste, resultado y observación. No se precargan contactos de otro transformador.',prefix:'PROT',cols:[['item','Ítem'],['accessory','Accesorio'],['terminals','Bornes'],['contact','Contacto'],['condition','Condición'],['setpoint','Ajuste'],['result','Resultado'],['notes','Observación']]}
  };
  const testCatalog = [
    ['TTR','Relación de transformación','Taps, relación teórica/medida y error por fase'],
    ['CAPACITANCE','Capacitancia complementaria','Ensayo adicional, no incluido como bloque independiente en LAP'],
    ['POWER_FACTOR','Factor de potencia del transformador','Modo, tensión, FP medido/corregido y capacitancia'],
    ['EXCITATION','Corriente de excitación','TAP, fase, tensión/frecuencia, corriente y pérdidas'],
    ['WINDING_RESISTANCE','Resistencia de devanados','Medición DC y resistencia referida a 75 °C'],
    ['INSULATION_RESISTANCE','Resistencia de aislamiento','Lecturas por tiempo e índice de absorción'],
    ['SFRA','SFRA','Tres configuraciones de barrido y comparación de curvas'],
    ['BUSHING','Bushings capacitivos','FP y capacitancia de placa/medidos por borne'],
    ['ARRESTER','Pararrayos AT / MT','V. salida, I. salida, GST, pérdidas y capacitancia'],
    ['PROTECTIONS','Protecciones propias','Ítem, accesorio, bornes, contacto, condición y ajuste']
  ];
  // ---------------- Fechas e historial de ejecuciones de pruebas eléctricas ----------------
  // testCatalog se declara al inicio para que el manejador de clics temprano pueda usarlo.

  let testExecutions = [];
  let testCatalogLoaded = false;
  const testPage=$('#testPage'), executionPage=$('#executionPage');
  function openTests(){
    const reason=electricalTestsBlockReason();
    if(reason){refreshSidebarAccess();toast(reason,true);return false;}
    showOnlyMain('testPage');setTestWorkspaceView('summary');loadTestHistory();return true;
  }
  $('#openElectricalTests').addEventListener('click',e=>{e.preventDefault();openTests();});
  $('#backFromTests').addEventListener('click',()=>showOnlyMain('overviewPage'));
  $('#cancelExecution').addEventListener('click',()=>{showOnlyMain('testPage');loadTestHistory();});

  function typeName(code){return (testCatalog.find(x=>x[0]===code)||[])[1]||code||'Prueba';}
  function formatExecutionDate(value){if(!value)return '—';const d=new Date(String(value).replace(' ','T'));return Number.isNaN(d.getTime())?value:d.toLocaleString('es-PE',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}
  function testStats(){
    const total=testExecutions.length;
    const counts={COMPLETE:0,INCOMPLETE:0,DRAFT:0};
    testExecutions.forEach(execution=>{const status=executionDisplayStatus(execution).code;counts[status]=(counts[status]||0)+1;});
    $('#testStats').innerHTML=
      '<div class="test-stat"><small>Registros guardados</small><strong>'+total+'</strong><span>Jornadas de pruebas</span></div>'+
      '<div class="test-stat"><small>Completados</small><strong>'+counts.COMPLETE+'</strong><span>Todos los ensayos finalizados y confirmados</span></div>'+
      '<div class="test-stat"><small>En proceso</small><strong>'+counts.INCOMPLETE+'</strong><span>Con ensayos por completar</span></div>'+
      '<div class="test-stat"><small>Borradores</small><strong>'+counts.DRAFT+'</strong><span>Sin ensayos iniciados</span></div>';
  }
  function renderTestTypes(){
    const host=$('#testTypeGrid');
    if(!host)return;
    host.innerHTML='';
  }
  function renderTestSummary(){
    testStats();
    const latest=testExecutions[0]?.executed_at;
    const host=$('#testSummaryLatest');
    if(host)host.innerHTML='<span>Último registro</span><strong>'+(latest?esc(formatExecutionDate(latest)):'Sin registros')+'</strong>';
    const attention=$('#testAttentionList');
    const pending=testExecutions.filter(execution=>['INCOMPLETE','DRAFT'].includes(executionDisplayStatus(execution).code));
    if(attention){
      attention.innerHTML=pending.length?pending.map(execution=>{
        const names=execution.plan_tests?.length?execution.plan_tests.map(test=>test.name||typeName(test.code)):(execution.test_code==='PLAN'?['Sin ensayos seleccionados']:[execution.test_name||typeName(execution.test_code)]);
        const status=executionDisplayStatus(execution);
        return '<article class="test-attention-row"><div class="test-attention-copy"><b>'+esc(formatExecutionDate(execution.executed_at))+'</b><span>'+esc(names.join(' · '))+'</span></div><span class="execution-status '+status.className+'">'+(status.code==='DRAFT'?'Borrador':'En proceso')+'</span><button class="btn small" data-open-execution="'+execution.id+'">Continuar registro</button></article>';
      }).join(''):'<div class="test-attention-empty">Todos los registros están al día. No hay registros pendientes ni borradores.</div>';

    }
  }

  function renderHistoricalAnalytics(){
    const monthly=new Map(),types=new Map();
    testExecutions.forEach(x=>{
      const d=new Date(String(x.executed_at||'').replace(' ','T'));
      if(!Number.isNaN(d.getTime())){const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');monthly.set(k,(monthly.get(k)||0)+1);}
      const names=x.plan_tests?.length?x.plan_tests:(x.test_code==='PLAN'?[]:[{name:x.test_name||typeName(x.test_code),code:x.test_code}]);
      names.forEach(t=>{const name=t.name||typeName(t.code);types.set(name,(types.get(name)||0)+1);});
    });
    const keys=[...monthly.keys()].sort().slice(-8),max=Math.max(1,...keys.map(k=>monthly.get(k)));
    $('#analyticsPeriod').textContent=keys.length?keys[0]+' — '+keys[keys.length-1]:'Sin datos';
    const chart=$('#monthlyExecutionChart');
    if(!keys.length)chart.innerHTML='<div class="analytics-empty">Registra ejecuciones para visualizar la evolución mensual.</div>';
    else{
      const width=560,height=190,left=30,bottom=32,top=16,plotH=height-top-bottom,slot=(width-left-12)/keys.length,barW=Math.min(42,slot*.58);
      const bars=keys.map((k,i)=>{const val=monthly.get(k),h=val/max*plotH,x=left+i*slot+(slot-barW)/2,y=top+plotH-h;const label=k.slice(5)+'/'+k.slice(2,4);return `<g><rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="#3985c8"/><text x="${x+barW/2}" y="${Math.max(11,y-5)}" text-anchor="middle" font-size="10" fill="currentColor">${val}</text><text x="${x+barW/2}" y="${height-9}" text-anchor="middle" font-size="10" fill="currentColor">${label}</text></g>`;}).join('');
      chart.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Registros por mes">${[0,.5,1].map(v=>`<line x1="${left}" x2="${width-8}" y1="${top+plotH*(1-v)}" y2="${top+plotH*(1-v)}" stroke="#dfe6ee" stroke-dasharray="3 4"/>`).join('')}${bars}</svg>`;
    }
    const list=$('#testTypeAnalytics');
    const total=[...types.values()].reduce((a,b)=>a+b,0);
    list.innerHTML=total?[...types.entries()].sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<div class="type-analytics-row"><div><span>${esc(name)}</span><b>${count}</b></div><div class="type-analytics-track"><i style="width:${Math.round(count/total*100)}%"></i></div></div>`).join(''):'<div class="analytics-empty">Todavía no hay ensayos registrados.</div>';
  }
  function setTestWorkspaceView(view){
    const panels={summary:'#testSummaryPanel',table:'#testHistoryPanel',graph:'#testAnalyticsPanel'};
    Object.entries(panels).forEach(([key,selector])=>{
      $(selector)?.classList.toggle('hidden',key!==view);
    });
    queryAll('[data-test-view]').forEach(button=>{
      const active=button.dataset.testView===view;
      button.classList.toggle('active',active);
      button.setAttribute('aria-selected',active?'true':'false');
    });
    if(view==='summary')renderTestSummary();
    if(view==='table'){renderTestHistory();loadTestHistory();}
    if(view==='graph')renderHistoricalAnalytics();
  }
  queryAll('[data-test-view]').forEach(button=>button.addEventListener('click',()=>setTestWorkspaceView(button.dataset.testView)));

  function executionDisplayStatus(execution){
    const tests=Array.isArray(execution.plan_tests)?execution.plan_tests:[];
    const overall=String(execution.status||'').trim().toUpperCase();
    if(!tests.length){
      if(overall==='COMPLETADA')return {code:'COMPLETE',label:'Completado',className:'done'};
      if(overall==='EN_PROCESO')return {code:'INCOMPLETE',label:'En proceso',className:'incomplete'};
      return {code:'DRAFT',label:'Borrador',className:'draft'};
    }
    const completed=tests.filter(test=>String(test.status||'').trim().toUpperCase()==='COMPLETADA').length;
    if(overall==='COMPLETADA'&&completed===tests.length){
      return {code:'COMPLETE',label:'Completado',className:'done'};
    }
    if(overall==='EN_PROCESO')return {code:'INCOMPLETE',label:'En proceso',className:'incomplete'};
    const hasStarted=tests.some(test=>test.has_data===true||String(test.status||'').trim().toUpperCase()==='COMPLETADA');
    if(hasStarted){
      return {code:'INCOMPLETE',label:'En proceso',className:'incomplete'};
    }
    return {code:'DRAFT',label:'Borrador',className:'draft'};
  }
  function reportFieldLabel(key){
    const labels={measurement:'Modo de prueba',test_voltage:'Tensión de prueba',test_voltage_v:'Tensión de prueba',power_factor_measured:'Factor de potencia medido',power_factor_corrected_20c:'Factor de potencia corregido',capacitance_source_f:'Capacitancia',capacitance_measured:'Capacitancia medida',status:'Estado',tap:'TAP',at:'AT',bt:'BT',theoretical:'Relación teórica',U:'Medida U',V:'Medida V',W:'Medida W',errU:'Error U',errV:'Error V',errW:'Error W',result:'Resultado',notes:'Observación',phase:'Fase',frequency_hz:'Frecuencia',excitation_current:'Corriente de excitación',losses:'Pérdidas',section:'Sección',test_current_a:'Corriente de prueba',temperature_c:'Temperatura',resistance_measured:'Resistencia medida',resistance_referred_75c:'Resistencia referida a 75 °C',point:'Punto de prueba',applied_voltage_kv:'Tensión aplicada',reading_15s:'Lectura 15 s',reading_30s:'Lectura 30 s',reading_45s:'Lectura 45 s',reading_1min:'Lectura 1 min',absorption_index:'Índice de absorción',terminal:'Borne',serial:'Serie',power_factor_plate:'FP de placa',capacitance_plate:'Capacitancia de placa',variation_percent:'Variación',connection:'Conexión',comparison_result:'Comparación',output_voltage:'Tensión de salida',output_current:'Corriente de salida',test_mode:'Modo de prueba',losses_measured:'Pérdidas medidas',accessory:'Accesorio',terminals:'Terminales',contact:'Contacto',condition:'Condición',capacitance_nf:'Capacitancia',test_voltage_kv:'Tensión de prueba'};
    return labels[key]||String(key||'').replace(/_/g,' ').replace(/\\b\\w/g,c=>c.toUpperCase());
  }
  function buildSpecificReportTable(code,measurements,capacitanceUnit='nF'){
    const cfg=specificTemplates[code];
    if(!cfg)return buildReportMeasurementTable(measurements);
    const rows=specificRowsFromMeasurements(measurements,code);
    if(!rows.length)return '<p class="muted">No hay mediciones registradas para este ensayo.</p>';
    const unit=['pF','nF','µF','mF','F'].includes(capacitanceUnit)?capacitanceUnit:'nF';
    const factors={pF:1e3,nF:1,µF:1e-3,mF:1e-6,F:1e-9};
    if(code==='EXCITATION')return '<table class="specific-report-table excitation-report-table"><thead><tr><th rowspan="2">TAP</th><th rowspan="2">Tensión (kV)</th><th rowspan="2">Frecuencia (Hz)</th><th colspan="2">U-0</th><th colspan="2">V-0</th><th colspan="2">W-0</th><th rowspan="2">Estado</th><th rowspan="2">Observación</th></tr><tr><th>Corriente (mA)</th><th>Pérdidas (W)</th><th>Corriente (mA)</th><th>Pérdidas (W)</th><th>Corriente (mA)</th><th>Pérdidas (W)</th></tr></thead><tbody>'+rows.map(raw=>{const row=normalizeSpecificRow(code,raw);return '<tr>'+cfg.cols.map(([key])=>'<td>'+esc(row[key]??'—')+'</td>').join('')+'</tr>';}).join('')+'</tbody></table>';
    const columns=cfg.cols.map(([key,label])=>{
      if(code==='POWER_FACTOR'&&key==='capacitance_measured')return ['capacitance_measured', 'Capacitancia medida ('+unit+')'];
      return [key,label];
    });
    return '<table class="specific-report-table"><thead><tr>'+columns.map(([,label])=>'<th>'+esc(label)+'</th>').join('')+'</tr></thead><tbody>'+
      rows.map(raw=>{
        const row=normalizeSpecificRow(code,raw);
        return '<tr>'+columns.map(([key])=>{
          let value=row[key]??'—';
          if(code==='POWER_FACTOR'&&key==='capacitance_measured'&&String(value).trim()!==''){
            const number=Number(String(value).replace(',','.'));
            value=Number.isFinite(number)?(number*factors[unit]).toFixed(6):value;
          }
          return '<td>'+esc(value)+'</td>';
        }).join('')+'</tr>';
      }).join('')+'</tbody></table>';
  }
  function buildReportMeasurementTable(measurements){
    const rows=(Array.isArray(measurements)?measurements:[]).filter(m=>m&&((m.parameter||'')!==''||(m.value||'')!==''||(m.notes||'')!==''));
    if(!rows.length)return '<p class="muted">No hay mediciones registradas para este ensayo.</p>';
    return '<table><thead><tr><th>Fila</th><th>Medición / parámetro</th><th>Resultado</th><th>Unidad</th><th>Observación</th></tr></thead><tbody>'+rows.map(m=>{
      const parts=String(m.parameter||'').split('|'),rowRef=parts.length>=3?parts[1]:'—',key=parts.length>=3?parts.slice(2).join('|'):String(m.parameter||'Dato');
      return '<tr><td>'+esc(rowRef)+'</td><td>'+esc(reportFieldLabel(key))+'</td><td>'+esc(m.value??'—')+'</td><td>'+esc(m.unit||'—')+'</td><td>'+esc(m.notes||'—')+'</td></tr>';
    }).join('')+'</tbody></table>';
  }
  async function exportExecutionPdf(id){
    const exportButton=$('[data-export-execution="'+id+'"]');
    if(exportButton){exportButton.disabled=true;exportButton.dataset.originalText=exportButton.textContent;exportButton.textContent='Generando PDF…';}
    try{
      const response=await fetch(api('action=test-get&key='+encodeURIComponent(transformer.key)+'&id='+encodeURIComponent(id)),{cache:'no-store'});
      const data=await readApiResponse(response),x=data.item||{};
      const tests=Array.isArray(x.plan?.tests)&&x.plan.tests.length?x.plan.tests:[{code:x.test_code,name:x.test_name||typeName(x.test_code),status:x.status,equipment_name:x.equipment_name,equipment_brand:x.equipment_brand,equipment_model:x.equipment_model,equipment_serial:x.equipment_serial,observations:x.observations,measurements:x.measurements||[]}];
      const t=transformer||{};
      const meta=(label,value)=>'<div class="meta"><small>'+label+'</small><b>'+esc(value||'—')+'</b></div>';
      const testHtml=tests.map((test,index)=>{
        const equipment=[test.equipment_name,test.equipment_brand,test.equipment_model,test.equipment_serial].filter(Boolean).join(' · ');
        const standard=test.standard_reference||x.standard_reference||'';
        const coreTypeLabels={NO_ESPECIFICADO:'No especificado',TRES_COLUMNAS:'Tres columnas',CINCO_COLUMNAS:'Cinco columnas',ACORAZADO:'Acorazado',OTRO:'Otro'};
        const coreType=test.code==='EXCITATION'?coreTypeLabels[test.core_type||'NO_ESPECIFICADO']||'No especificado':'';
        const measurements=Array.isArray(test.measurements)?test.measurements:[];
        return '<section class="test"><div class="test-title"><div><small>ENSAYO '+String(index+1).padStart(2,'0')+'</small><h2>'+esc(test.name||typeName(test.code))+'</h2></div><strong>'+esc(String(test.status||'BORRADOR').replace(/_/g,' '))+'</strong></div>'+
          (standard?'<p class="equipment"><b>Norma / referencia:</b> '+esc(standard)+'</p>':'')+
          (equipment?'<p class="equipment"><b>Equipo:</b> '+esc(equipment)+'</p>':'')+
          (coreType?'<p class="equipment"><b>Tipo de núcleo:</b> '+esc(coreType)+'</p>':'')+
          (specificTemplates[test.code]?buildSpecificReportTable(test.code,measurements,test.capacitance_unit||'nF'):buildReportMeasurementTable(measurements))+
          (test.observations?'<div class="observation"><b>Observaciones del ensayo</b><p>'+esc(test.observations).replace(/\\n/g,'<br>')+'</p></div>':'')+'</section>';
      }).join('');
      const status=String(x.status||'BORRADOR').replace(/_/g,' ');
      const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe de pruebas #'+esc(x.id||id)+'</title><style>'+
        '*{box-sizing:border-box}body{font:12px/1.45 Arial,sans-serif;color:#1f2937;margin:28px}h1{font-size:22px;margin:0 0 4px;color:#17365d}h2{font-size:16px;margin:3px 0 0}.sub{color:#64748b;margin:0 0 20px}.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1e4b75;padding-bottom:14px}.tag{border:1px solid #cbd5e1;border-radius:6px;padding:7px 10px;font-weight:bold}.section{margin:18px 0}.section h3{font-size:13px;color:#1e4b75;margin:0 0 8px;border-bottom:1px solid #dbe3ec;padding-bottom:5px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.meta{border:1px solid #e2e8f0;padding:8px;border-radius:5px;min-height:48px}.meta small{display:block;color:#64748b;font-size:10px;margin-bottom:3px}.test{margin:0 0 12px;break-before:page;page-break-before:always;break-inside:auto;page-break-inside:auto}.test-title{display:flex;justify-content:space-between;align-items:center;background:#f1f5f9;padding:10px;border:1px solid #dbe3ec;border-radius:5px}.test-title small{color:#64748b;font-weight:bold;letter-spacing:.08em}.test-title strong{font-size:10px;border:1px solid #cbd5e1;padding:5px 8px;border-radius:4px}.equipment{margin:8px 0;color:#475569}table{width:100%;border-collapse:collapse;margin-top:9px;font-size:10px}th{background:#eaf0f6;text-align:left;color:#334155}th,td{border:1px solid #d8e0e8;padding:6px;vertical-align:top}tr{page-break-inside:avoid}.observation{margin-top:10px;border-left:3px solid #6b8eae;background:#f8fafc;padding:8px}.observation p{margin:4px 0 0;white-space:normal}.muted{color:#64748b;font-style:italic}.footer{border-top:1px solid #dbe3ec;margin-top:24px;padding-top:8px;color:#64748b;font-size:9px;display:flex;justify-content:space-between}.print-actions{display:flex;align-items:center;gap:12px;margin-top:18px;padding:12px;border:1px solid #dbe3ec;border-radius:6px;background:#f8fafc;color:#64748b;font-size:10px}.print-actions button{border:0;border-radius:5px;background:#1e5e88;color:#fff;padding:9px 13px;font-weight:700;cursor:pointer}@page{size:A4;margin:14mm}@media print{body{margin:0}.test{break-before:page;page-break-before:always;break-inside:auto;page-break-inside:auto;margin:0}.test-title{break-after:avoid-page;page-break-after:avoid}.test table{break-inside:auto;page-break-inside:auto}.test tr{break-inside:avoid;page-break-inside:avoid}.test thead{display:table-header-group}.observation{break-inside:avoid;page-break-inside:avoid}.print-actions{display:none}button{display:none}thead{display:table-header-group}}'+
        '</style></head><body><header class="top"><div><h1>Informe de pruebas eléctricas</h1><p class="sub">Registro #'+esc(x.id||id)+' · '+esc(formatExecutionDate(x.executed_at))+'</p></div><div class="tag">'+esc(status)+'</div></header>'+
        '<section class="section"><h3>Identificación del transformador</h3><div class="grid">'+meta('Código',t.code||t.key)+meta('Marca',t.brand)+meta('Modelo / descripción',t.name)+meta('Potencia',t.power)+meta('Tensión',t.voltage)+meta('Grupo vectorial',t.vector_group)+'</div></section>'+
        '<section class="section"><h3>Datos del registro</h3><div class="grid">'+meta('Fecha de ejecución',formatExecutionDate(x.executed_at))+meta('Responsable / técnico',x.operator_name)+meta('Supervisor',x.supervisor_name)+meta('Temperatura de aceite',x.oil_temperature_c===null?'—':x.oil_temperature_c+' °C')+meta('Temperatura ambiente',x.ambient_temperature_c===null?'—':x.ambient_temperature_c+' °C')+meta('Humedad relativa',x.relative_humidity_percent===null?'—':x.relative_humidity_percent+' %')+'</div></section>'+
        '<section class="section"><h3>Ensayos y resultados</h3>'+testHtml+'</section>'+
        (x.observations?'<section class="section observation"><b>Observaciones generales</b><p>'+esc(x.observations)+'</p></section>':'')+
        '<div class="footer"><span>ELEC · Informe de pruebas eléctricas</span><span>Registro #'+esc(x.id||id)+'</span></div></body></html>';
      const pdfResponse=await fetch(api('action=test-pdf'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({html,filename:'ELEC-registro-'+(x.id||id)+'.pdf'})});
      if(!pdfResponse.ok){
        const raw=await pdfResponse.text();let message='No se pudo generar el PDF en el servidor.';
        try{const payload=JSON.parse(raw);message=payload.message||message;if(payload.detail)message+=' · '+payload.detail;}catch(_){if(raw)message+=' '+raw.slice(0,220);}
        throw new Error(message);
      }
      const blob=await pdfResponse.blob();
      if(!blob.size)throw new Error('El servidor devolvió un PDF vacío.');
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download='ELEC-registro-'+(x.id||id)+'.pdf';
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      toast('PDF generado y descargado correctamente.');
    }catch(error){toast('No se pudo exportar el registro: '+(error.message||error),true);}
    finally{if(exportButton){exportButton.disabled=false;exportButton.textContent=exportButton.dataset.originalText||'Exportar PDF';delete exportButton.dataset.originalText;}}
  }
  function renderTestHistory(){
    testStats();renderTestTypes();
    if(!$('#testAnalyticsPanel')?.classList.contains('hidden'))renderHistoricalAnalytics();
    const q=($('#testHistoryFilter')?.value||'').trim().toLocaleLowerCase();
    const statusFilter=$('#testHistoryStatusFilter')?.value||'ALL';
    const filtered=testExecutions.filter(x=>{
      const names=(x.plan_tests||[]).map(t=>t.name||typeName(t.code)).join(' ')||(x.test_name||typeName(x.test_code));
      const matchesText=names.toLocaleLowerCase().includes(q)||(x.operator_name||'').toLocaleLowerCase().includes(q);
      return matchesText&&(statusFilter==='ALL'||executionDisplayStatus(x).code===statusFilter);
    });
    $('#testHistoryBody').innerHTML=filtered.length?filtered.map(x=>{
      const names=x.plan_tests?.length?x.plan_tests.map(t=>t.name||typeName(t.code)):(x.test_code==='PLAN'?[]:[x.test_name||typeName(x.test_code)]);
      const testCount=names.length;
      const state=executionDisplayStatus(x);
      return '<tr><td><b>'+esc(formatExecutionDate(x.executed_at))+'</b></td><td><b>'+esc(names.join(' · ')||'Sin ensayos seleccionados')+'</b></td><td>'+testCount+'</td><td>'+esc(x.operator_name||'—')+'</td><td><span class="execution-status '+state.className+'">'+state.label+'</span></td><td><div class="test-row-actions"><button class="btn small" data-open-execution="'+x.id+'" title="Abrir este registro">Abrir registro</button><button class="btn small" data-export-execution="'+x.id+'" title="Exportar informe PDF">Exportar PDF</button><button class="btn small danger test-delete-button" data-delete-execution="'+x.id+'" title="Eliminar registro" aria-label="Eliminar registro #'+x.id+'"><svg><use href="#i-trash"/></svg>Eliminar</button></div></td></tr>';
    }).join(''):'<tr><td colspan="6" class="test-empty">'+(testHistoryLoadError?'No se pudo consultar el historial: '+esc(testHistoryLoadError):(testExecutions.length?'No hay registros que coincidan con el filtro.':'No hay registros para este transformador. Los registros se ordenan por fecha, del más reciente al más antiguo.'))+'</td></tr>';

    Array.from(document.querySelectorAll('[data-export-execution]')).forEach(button=>button.addEventListener('click',()=>exportExecutionPdf(Number(button.dataset.exportExecution))));
    Array.from(document.querySelectorAll('[data-delete-execution]')).forEach(button=>button.addEventListener('click',async()=>{
      const id=Number(button.dataset.deleteExecution);
      const visit=testExecutions.find(item=>Number(item.id)===id);
      if(!id||!visit)return;
      const date=formatExecutionDate(visit.executed_at);
      const count=visit.plan_tests?.length||1;
      const confirmed=window.confirm('¿Eliminar el registro #'+id+' del '+date+'? Se eliminarán también sus '+count+' ensayo(s) y todas sus mediciones. Esta acción no se puede deshacer.');
      if(!confirmed)return;
      button.disabled=true;
      button.title='Eliminando…';
      try{
        const response=await fetch(api('action=test-delete'),{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({id:id,transformer_key:transformer.key})
        });
        const result=await readApiResponse(response);
        if(!result.ok)throw new Error(result.message||'No se pudo eliminar el registro.');
        testExecutions=testExecutions.filter(item=>Number(item.id)!==id);
        renderTestHistory();
        toast('Registro #'+id+' eliminado correctamente.');
      }catch(error){
        button.disabled=false;
        button.title='Eliminar registro';
        toast(error.message,true);
      }
    }));
  }
  $('#testHistoryFilter').addEventListener('input',renderTestHistory);
  $('#testHistoryStatusFilter').addEventListener('change',renderTestHistory);
  let testHistoryLoadPromise=null;
  let testHistoryLoadError='';
  async function loadTestHistory(){
    if(testHistoryLoadPromise)return testHistoryLoadPromise;
    if(PILOT.demo){testExecutions=[];testHistoryLoadError='Selecciona un transformador real para consultar su historial.';renderTestHistory();return;}
    if(!PILOT.testsSchemaReady){testExecutions=[];testHistoryLoadError='Faltan las tablas del módulo de pruebas eléctricas.';renderTestHistory();toast('Importa database/schema.sql para habilitar el historial de ejecuciones.',true);return;}
    const operation=(async()=>{
      try{
        const key=String(transformer.key||PILOT.transformer?.key||'').trim();
        if(!key)throw new Error('No se pudo identificar el transformador seleccionado para consultar el historial.');

        // El historial es la fuente principal. No debe depender de que el catálogo responda.
        const listResponse=await fetch(api('action=test-list&key='+encodeURIComponent(key)),{cache:'no-store'});
        const listData=await readApiResponse(listResponse);
        if(!Array.isArray(listData.items))throw new Error('El servidor no devolvió una lista válida de registros.');
        testExecutions=listData.items;
        testHistoryLoadError='';
        renderTestHistory();
        renderTestSummary();
        renderHistoricalAnalytics();

        // El catálogo solo enriquece los nombres; si falla, no ocultamos los registros guardados.
        try{
          const catalogResponse=await fetch(api('action=test-types'),{cache:'no-store'});
          const catalogData=await readApiResponse(catalogResponse);
          if(Array.isArray(catalogData.items)&&catalogData.items.length){
            testCatalog.splice(0,testCatalog.length,...catalogData.items.filter(x=>x.code!=='PLAN').map(x=>[x.code,x.name,'Datos de ensayo']));
            renderTestHistory();
            renderTestSummary();
            renderHistoricalAnalytics();
          }
        }catch(catalogError){console.warn('No se pudo actualizar el catálogo de ensayos:',catalogError);}
      }catch(e){
        testHistoryLoadError=e.message||'No se pudo cargar el historial.';
        renderTestHistory();
        toast(testHistoryLoadError,true);
      }
    })();
    testHistoryLoadPromise=operation;
    try{await operation;}finally{if(testHistoryLoadPromise===operation)testHistoryLoadPromise=null;}
  }
  function clearExecutionForm(){
    activeExecutionId=null;activeExecutionMode='new';activeSpecificCode='';if($('#specificTestRows'))$('#specificTestRows').innerHTML='';
    ['executionOperator','executionSupervisor','executionStandard','executionEquipment','executionEquipmentBrand','executionEquipmentModel','executionEquipmentSerial','executionOilTemp','executionAmbientTemp','executionHumidity','executionObservations'].forEach(id=>$('#'+id).value='');
    $('#executionDate').value=localDateTime();
    renderMeasurementRows([{parameter:'',value:'',unit:'',notes:''},{parameter:'',value:'',unit:'',notes:''},{parameter:'',value:'',unit:'',notes:''}]);renderTtrRows([]);
    $('#executionTitle').textContent='Nuevo registro de pruebas';
    const saveButton=$('#saveExecution');if(saveButton)saveButton.innerHTML='<svg><use href="#i-check"/></svg>Guardar registro';
  }
  function fillTypeOptions(selected){$('#executionType').innerHTML=testCatalog.map(t=>'<option value="'+esc(t[0])+'" '+(t[0]===selected?'selected':'')+'>'+esc(t[1])+'</option>').join('');}
  function startExecution(code){
    const reason=electricalTestsBlockReason();if(reason){toast(reason,true);refreshSidebarAccess();return false;}
    executionConfigContext=clone(getConfig());
    clearExecutionForm();fillTypeOptions(code);toggleTestTemplate();
    $('#executionTitle').textContent='Nuevo registro · '+typeName(code);
    showOnlyMain('executionPage');
  }
  function renderMeasurementRows(rows){
    $('#measurementRows').innerHTML=(rows||[]).map((r,i)=>`<tr><td class="measurement-row-number">${i+1}</td><td><input class="measurement-cell" data-r="${i}" data-c="0" value="${esc(r.parameter||'')}" placeholder="Ej. Tap 1 / U-N"></td><td><input class="measurement-cell numeric" data-r="${i}" data-c="1" value="${esc(r.value??'')}" placeholder="Valor"></td><td><input class="measurement-cell" data-r="${i}" data-c="2" value="${esc(r.unit||'')}" placeholder="Unidad"></td><td><input class="measurement-cell" data-r="${i}" data-c="3" value="${esc(r.notes||'')}" placeholder="Observación"></td><td><button type="button" class="measurement-delete" data-delete-row="${i}" title="Eliminar fila">×</button></td></tr>`).join('');
    queryAll('#measurementRows [data-delete-row]').forEach(b=>b.addEventListener('click',()=>{const a=collectMeasurementRows();a.splice(Number(b.dataset.deleteRow),1);renderMeasurementRows(a);}));
  }
  function collectMeasurementRows(){return queryAll('#measurementRows tr').map(tr=>{const a=queryAll('.measurement-cell',tr);return {parameter:a[0]?.value||'',value:a[1]?.value||'',unit:a[2]?.value||'',notes:a[3]?.value||''};});}
  $('#addMeasurementRow').addEventListener('click',()=>{const a=collectMeasurementRows();a.push({parameter:'',value:'',unit:'',notes:''});renderMeasurementRows(a);const n=queryAll('#measurementRows .measurement-cell').length;$('#measurementRows .measurement-cell')[n-4]?.focus();});
  $('#measurementRows').addEventListener('paste',e=>{
    const target=e.target.closest('.measurement-cell');if(!target)return;
    const text=(e.clipboardData||window.clipboardData).getData('text');if(!text.includes('\t')&&!text.includes('\n'))return;
    e.preventDefault();const lines=text.replace(/\r/g,'').split('\n').filter((x,i,a)=>!(i===a.length-1&&x==='')).map(x=>x.split('\t'));
    const rows=collectMeasurementRows(),startR=Number(target.dataset.r),startC=Number(target.dataset.c),width=4;
    lines.forEach((line,ri)=>{while(rows.length<=startR+ri)rows.push({parameter:'',value:'',unit:'',notes:''});line.forEach((v,ci)=>{if(startC+ci<width)rows[startR+ri][['parameter','value','unit','notes'][startC+ci]]=v.trim();});});renderMeasurementRows(rows);toast('Datos pegados desde Excel.');
  });
  $('#measurementRows').addEventListener('keydown',e=>{
    const el=e.target.closest('.measurement-cell');if(!el)return;
    const r=Number(el.dataset.r),c=Number(el.dataset.c);let nr=r,nc=c;
    if(e.key==='ArrowDown')nr++;else if(e.key==='ArrowUp')nr--;else if(e.key==='ArrowRight'&&el.selectionStart===el.value.length)nc++;else if(e.key==='ArrowLeft'&&el.selectionStart===0)nc--;else if(e.key==='Enter'){e.preventDefault();nr++;}else if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();nc++;if(nc>3){nc=0;nr++;}}else if(e.key==='Tab'&&e.shiftKey){e.preventDefault();nc--;if(nc<0){nc=3;nr=Math.max(0,nr-1);}}else return;
    if(['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(e.key))e.preventDefault();
    const rows=collectMeasurementRows();while(nr>=rows.length)rows.push({parameter:'',value:'',unit:'',notes:''});if(nr<0)nr=0;if(nc<0)nc=0;if(nc>3)nc=3;renderMeasurementRows(rows);$('#measurementRows [data-r="'+nr+'"][data-c="'+nc+'"]')?.focus();
  });
  async function openExistingExecution(id){
    if(PILOT.demo){toast('El historial no está disponible en modo demostración.',true);return;}
    try{
      const r=await fetch(api('action=test-get&key='+encodeURIComponent(transformer.key)+'&id='+id));
      const d=await readApiResponse(r),x=d.item;
      clearExecutionForm();
      activeExecutionId=Number(x.id||id);activeExecutionMode='edit';
      let historicalSnapshot=x.config_snapshot||null;try{if(typeof historicalSnapshot==='string')historicalSnapshot=JSON.parse(historicalSnapshot);}catch(_){historicalSnapshot=null;}
      executionConfigContext=historicalSnapshot?normalizeConfig(historicalSnapshot):clone(getConfig());
      fillTypeOptions(x.test_code);$('#executionType').value=x.test_code;toggleTestTemplate();
      if(x.test_code==='TTR')renderTtrRows(ttrRowsFromMeasurements(x.measurements||[]));
      else if(specificTemplates[x.test_code])renderSpecificRows(specificRowsFromMeasurements(x.measurements||[],x.test_code),x.test_code);
      else renderMeasurementRows(x.measurements||[]);
      $('#executionDate').value=String(x.executed_at||'').replace(' ','T').slice(0,16);
      $('#executionOperator').value=x.operator_name||'';$('#executionSupervisor').value=x.supervisor_name||'';
      $('#executionStandard').value=x.standard_reference||'';$('#executionEquipment').value=x.equipment_name||'';
      $('#executionEquipmentBrand').value=x.equipment_brand||'';$('#executionEquipmentModel').value=x.equipment_model||'';
      $('#executionEquipmentSerial').value=x.equipment_serial||'';$('#executionOilTemp').value=x.oil_temperature_c??'';
      $('#executionAmbientTemp').value=x.ambient_temperature_c??'';$('#executionHumidity').value=x.relative_humidity_percent??'';
      $('#executionObservations').value=x.observations||'';
      $('#executionTitle').textContent='Editar registro #'+activeExecutionId+' · '+(x.test_name||typeName(x.test_code));
      $('#saveExecution').innerHTML='<svg><use href="#i-check"/></svg>Actualizar registro';
      showOnlyMain('executionPage');
    }catch(e){toast(e.message,true);}
  }
  // TTR: fórmulas reproducidas de la hoja de protocolos de referencia.
  // Rt = V_AT(kV) / (V_BT(kV) * sqrt(3)); Error fase = (Rmed - Rt) * 100 / Rmed.
  function ttrRowsFromMeasurements(measurements){
    const byTap={};
    (measurements||[]).forEach(m=>{
      const match=String(m.parameter||'').match(/^TTR\|(\d+)\|(at|bt|theoretical|U|errU|V|errV|W|errW|notes)$/);
      if(!match)return;
      byTap[match[1]]=byTap[match[1]]||{tap:match[1]};
      byTap[match[1]][match[2]]=m.value||m.notes||'';
    });
    return Object.values(byTap).sort((a,b)=>Number(a.tap)-Number(b.tap));
  }
  function ttrNumber(v){const n=Number(String(v??'').trim().replace(',','.'));return Number.isFinite(n)?n:null;}
  function ttrCalc(r){
    const at=ttrNumber(r.at),bt=ttrNumber(r.bt),calculated=(at!==null&&bt!==null&&bt!==0)?at/(bt*Math.sqrt(3)):null,theoretical=calculated!==null?calculated:ttrNumber(r.theoretical);
    const out={...r,theoretical:theoretical===null?'':String(theoretical)};
    ['U','V','W'].forEach(k=>{const m=ttrNumber(r[k]);out['err'+k]=theoretical!==null&&m!==null&&m!==0?String((m-theoretical)*100/m):'';});
    return out;
  }
  function renderTtrRows(rows){
    const body=$('#ttrRows'); if(!body)return;
    body.innerHTML=(rows||[]).map((raw,i)=>{const r=ttrCalc(raw);return `<tr>
      <td><select class="ttr-cell contextual-select" data-r="${i}" data-c="0">${[['','Selecciona TAP'],...configuredTapOptions(),...(r.tap&&!configuredTapOptions().some(([v])=>String(v)===String(r.tap))?[[String(r.tap),String(r.tap)+' · registro anterior']]:[])].map(([v,label])=>'<option value="'+esc(v)+'" '+(String(r.tap||i+1)===String(v)?'selected':'')+'>'+esc(label)+'</option>').join('')}</select></td>
      <td><input class="ttr-cell numeric" data-r="${i}" data-c="1" value="${esc(r.at||'')}"></td>
      <td><input class="ttr-cell numeric" data-r="${i}" data-c="2" value="${esc(r.bt||'')}"></td>
      <td><input class="ttr-cell numeric ttr-calculated" data-r="${i}" data-c="3" value="${esc(r.theoretical||'')}" readonly title="V AT / (V BT × √3)"></td>
      <td><input class="ttr-cell numeric" data-r="${i}" data-c="4" value="${esc(r.U||'')}"></td>
      <td><input class="ttr-cell numeric ttr-calculated" data-r="${i}" data-c="5" value="${esc(r.errU||'')}" readonly title="(Medida U − Rt) × 100 / Medida U"></td>
      <td><input class="ttr-cell numeric" data-r="${i}" data-c="6" value="${esc(r.V||'')}"></td>
      <td><input class="ttr-cell numeric ttr-calculated" data-r="${i}" data-c="7" value="${esc(r.errV||'')}" readonly></td>
      <td><input class="ttr-cell numeric" data-r="${i}" data-c="8" value="${esc(r.W||'')}"></td>
      <td><input class="ttr-cell numeric ttr-calculated" data-r="${i}" data-c="9" value="${esc(r.errW||'')}" readonly></td>
      <td><input class="ttr-cell" data-r="${i}" data-c="10" value="${esc(r.notes||'')}"></td>
    </tr>`;}).join('');
  }
  function collectTtrRows(){
    return queryAll('#ttrRows tr').map(tr=>{const a=queryAll('.ttr-cell',tr);return {tap:a[0]?.value||'',at:a[1]?.value||'',bt:a[2]?.value||'',theoretical:a[3]?.value||'',U:a[4]?.value||'',errU:a[5]?.value||'',V:a[6]?.value||'',errV:a[7]?.value||'',W:a[8]?.value||'',errW:a[9]?.value||'',notes:a[10]?.value||''};}).filter(r=>Object.values(r).some(v=>String(v).trim()!==''));
  }
  function ttrToMeasurements(){
    const out=[];collectTtrRows().map(ttrCalc).forEach(r=>['at','bt','theoretical','U','errU','V','errV','W','errW','notes'].forEach(k=>{const value=r[k]||'';if(value!=='')out.push({parameter:`TTR|${r.tap}|${k}`,value,unit:k.startsWith('err')?'%':(k==='notes'?'':(k==='at'||k==='bt'?'kV':'ratio')),notes:''});}));return out;
  }
  function normalizeSpecificRow(code,row){
    const out={...(row||{})};
    if(code==='INSULATION_RESISTANCE'){
      const raw30=String(out.reading_30s??'').trim().replace(',','.');
      const raw1=String(out.reading_1min??'').trim().replace(',','.');
      const n30=raw30===''?NaN:Number(raw30),n1=raw1===''?NaN:Number(raw1);
      out.absorption_index=raw30!==''&&raw1!==''&&Number.isFinite(n30)&&n30!==0&&Number.isFinite(n1)?String(n1/n30):'';
    }
    if(code==='WINDING_RESISTANCE'){
      out.phase=out.phase||out.terminal_pair||'';
      out.winding=out.winding||out.section||'';
      out.resistance_measured=out.resistance_measured||out.resistance||out.resistance_measured_ohm||'';
      out.resistance_referred_75c=out.resistance_referred_75c||out.resistance_referred_75c_ohm||'';
    }
    if(code==='POWER_FACTOR'){
      out.test_voltage=out.test_voltage||out.test_voltage_v||out.test_voltage_kv||'';
      out.power_factor_measured=out.power_factor_measured||out.power_factor||'';
      out.power_factor_corrected_20c=out.power_factor_corrected_20c||out.power_factor_corrected||'';
      if(out.capacitance_source_f===undefined||out.capacitance_source_f===''){
        const legacyNf=out.capacitance_measured??out.capacitance_nf??out.capacitance;
        if(legacyNf!==undefined&&legacyNf!==null&&String(legacyNf).trim()!=='')out.capacitance_source_f=String(Number(String(legacyNf).replace(',','.'))/1e9);
      }
      const source=String(out.capacitance_source_f??'').trim().replace(',','.');
      const sourceNumber=source===''?NaN:Number(source);
      out.capacitance_measured=Number.isFinite(sourceNumber)?(sourceNumber*1e9).toFixed(6):'';
      const corrected=String(out.power_factor_corrected_20c??'').trim().replace(',','.');
      const correctedNumber=corrected===''?NaN:Number(corrected);
      out.status=Number.isFinite(correctedNumber)?(Math.abs(correctedNumber)<1?'CORRECTO':'OBSERVADO'):'PENDIENTE';
    }
    if(code==='EXCITATION'){
      out.excitation_current=out.excitation_current||out.current||out.output_current_a||'';
      out.losses=out.losses||out.power||out.losses_w||'';
    }
    if(code==='BUSHING'){
      out.test_voltage=out.test_voltage||out.test_voltage_kv||'';
      out.power_factor_measured=out.power_factor_measured||out.power_factor||'';
      out.capacitance_plate=out.capacitance_plate||out.capacitance_plate_pf||'';
      out.capacitance_measured=out.capacitance_measured||out.capacitance||out.capacitance_measured_pf||'';
      out.serial=out.serial||out.serial_number||'';
      const plate=Number(String(out.capacitance_plate??'').trim().replace(',','.'));
      const measured=Number(String(out.capacitance_measured??'').trim().replace(',','.'));
      const variation=String(out.capacitance_measured??'').trim()!==''&&Number.isFinite(plate)&&plate>0&&Number.isFinite(measured)?Math.abs(measured-plate)*100/plate:null;
      out.variation_percent=variation===null?(out.variation_percent||''):String(variation);
      out.result=variation===null?'PENDIENTE':(variation<5?'CONFORME':'OBSERVADO');
    }
    if(code==='ARRESTER'){
      out.output_voltage=out.output_voltage||out.output_voltage_v||out.output_voltage_kv||'';
      out.output_current=out.output_current||out.output_current_a||out.output_current_ma||'';
      out.losses_measured=out.losses_measured||out.losses_measured_w||out.losses_w||'';
      out.capacitance_measured=out.capacitance_measured||out.capacitance_measured_pf||out.capacitance_pf||'';
    }
    return out;
  }
  function specificRowsFromMeasurements(ms,code){
    const cfg=specificTemplates[code];if(!cfg)return[];
    const rows={};
    (ms||[]).forEach(m=>{
      const z=String(m.parameter||'').match(new RegExp('^'+cfg.prefix+'\\|(\\d+)\\|(.+)$'));
      if(z){rows[z[1]]=rows[z[1]]||{};rows[z[1]][z[2]]=m.value??m.notes??'';}
    });
    let list=Object.keys(rows).sort((a,b)=>Number(a)-Number(b)).map(k=>rows[k]);
    if(code==='INSULATION_RESISTANCE'&&list.some(r=>r.from||r.to||r.time||r.reading)){
      const grouped={};
      list.forEach(r=>{
        const key=[r.from||'',r.to||'',r.voltage||'',r.unit||'',r.reading_unit||'',r.temperature||''].join('|');
        const target=grouped[key]||(grouped[key]={point:[r.from,r.to].filter(Boolean).join(' - '),applied_voltage_kv:r.voltage||'',reading_unit:r.reading_unit||r.unit||'',notes:r.notes||''});
        const time=String(r.time||'').trim().toLowerCase().replace(/['’]/g,'');
        if(time==='15'||time==='15s')target.reading_15s=r.reading||'';
        else if(time==='30'||time==='30s')target.reading_30s=r.reading||'';
        else if(time==='45'||time==='45s')target.reading_45s=r.reading||'';
        else if(time==='1'||time==='1m'||time==='60'||time==='60s')target.reading_1min=r.reading||'';
      });
      list=Object.values(grouped);
    }
    if(code==='EXCITATION'&&list.some(r=>r.phase||r.excitation_current||r.current||r.losses||r.power)){const grouped=new Map();list.forEach(r=>{const tap=String(r.tap||'').trim(),phase=String(r.phase||'').toUpperCase().replace(/\s/g,'');if(!tap||!['U-0','V-0','W-0'].includes(phase))return;const g=grouped.get(tap)||{tap,test_voltage_kv:r.test_voltage_kv||r.test_voltage||'',frequency_hz:r.frequency_hz||'',evaluation:'PENDIENTE'};const suffix=phase[0].toLowerCase();g['current_'+suffix+'_ma']=r.excitation_current||r.current||r.output_current_a||'';g['losses_'+suffix+'_w']=r.losses||r.power||r.losses_w||'';grouped.set(tap,g);});if(grouped.size)list=Array.from(grouped.values());}
    if(code==='POWER_FACTOR')list=list.map(r=>({...r,measurement:r.measurement||r.point||'',test_voltage:r.test_voltage||r.test_voltage_v||'',power_factor_measured:r.power_factor_measured||r.power_factor||'',power_factor_corrected_20c:r.power_factor_corrected_20c||r.power_factor_corrected||'',capacitance_source_f:r.capacitance_source_f??r.capacitance_f??'',capacitance_measured:r.capacitance_measured??r.capacitance_nf??r.capacitance??''}));
    if(code==='WINDING_RESISTANCE')list=list.map(r=>({...r,winding:r.winding||r.section||'',phase:r.phase||r.terminal_pair||'',resistance:r.resistance||r.resistance_measured_ohm||'',resistance_referred_75c:r.resistance_referred_75c||r.resistance_referred_75c_ohm||''}));
    if(code==='EXCITATION')list=list.map(r=>({...r,current:r.current||r.output_current_a||'',power:r.power||r.losses_w||''}));
    if(code==='BUSHING')list=list.map(r=>({...r,power_factor:r.power_factor||r.power_factor_measured||'',capacitance:r.capacitance||r.capacitance_measured_pf||'',test_voltage:r.test_voltage||r.test_voltage_kv||'',serial:r.serial||r.serial_number||''}));
    return list.map(r=>normalizeSpecificRow(code,r));
  }
  // El catálogo contextualiza cada ensayo con los elementos reales de la configuración eléctrica.
  const testElementNeeds={
    TTR:['Bobinados AT/BT','Posiciones TAP','Mediciones por fase'],
    WINDING_RESISTANCE:['Bobinados','Bornes o pares de bornes','Posiciones TAP cuando aplique'],
    INSULATION_RESISTANCE:['Pares de bobinados o bobinado a masa'],
    EXCITATION:['Posiciones TAP','Fases / bornes del bobinado'],
    BUSHING:['Bornes con bushing capacitivo'],
    SFRA:['Bobinados / conexiones de ensayo','Posiciones TAP'],
    POWER_FACTOR:['Modos de conexión del ensayo','Datos de placa aplicables'],
    CAPACITANCE:['Bornes o puntos de medición'],
    ARRESTER:['Secciones y fases del equipo ensayado'],
    PROTECTIONS:['Accesorios y bornes del circuito de protección']
  };
  function configuredTapOptions(){
    const config=executionConfigContext||getConfig();
    const positions=(config.tap_changers||[]).flatMap(c=>(c.positions||[]).map(p=>String(p.position_no??'').trim()).filter(Boolean));
    const unique=[...new Set(positions)].sort((a,b)=>Number(a)-Number(b));
    if(unique.length)return unique.map(v=>[v,'TAP '+v]);
    const count=Math.min(150,Math.max(0,Number(transformer.num_taps||0)));
    return Array.from({length:count},(_,i)=>[String(i+1),'TAP '+(i+1)]);
  }
  function configuredWindingOptions(){
    const config=executionConfigContext||getConfig();
    return (config.windings||[]).map((w,i)=>[String(w.name||('Bobinado '+(i+1))),String(w.name||('Bobinado '+(i+1)))]);
  }
  function configuredTerminalOptions(capacitiveOnly=false){
    const config=executionConfigContext||getConfig();
    return (config.windings||[]).flatMap((w,wi)=>(w.terminals||[]).filter(t=>!capacitiveOnly||t.has_capacitive_bushing).map(t=>{
      const code=String(t.code||'').trim(),label=(w.name||('Bobinado '+(wi+1)))+' · '+(code||'Borne sin código');
      return [code,label];
    })).filter(x=>x[0]);
  }
  function contextOptionsForField(code,key){
    if(key==='tap')return configuredTapOptions();
    if(key==='winding'||key==='section'&&code==='WINDING_RESISTANCE')return configuredWindingOptions();
    if(key==='terminal'&&code==='BUSHING')return configuredTerminalOptions(true);
    if(key==='phase'&&(code==='WINDING_RESISTANCE'||code==='EXCITATION'))return configuredTerminalOptions(false);
    if(key==='point'&&code==='CAPACITANCE')return configuredTerminalOptions(false);
    if(key==='point'&&code==='INSULATION_RESISTANCE'){
      const names=configuredWindingOptions().map(x=>x[0]),pairs=[];
      names.forEach((a,i)=>{names.slice(i+1).forEach(b=>pairs.push([a+'-'+b,a+' – '+b]));pairs.push([a+'-Masa',a+' – Masa']);});
      names.forEach(a=>{if(!pairs.some(p=>p[0]===a+'-Masa'))pairs.push([a+'-Masa',a+' – Masa']);});
      return pairs;
    }
    return null;
  }
  function renderContextSelect(code,key,value,rowIndex,columnIndex){
    const options=contextOptionsForField(code,key);if(options===null)return null;
    const placeholder=key==='tap'?'Selecciona TAP':key==='winding'||key==='section'?'Selecciona bobinado':key==='terminal'?'Selecciona borne':key==='phase'?'Selecciona borne/fase':'Selecciona punto';
    const safeOptions=[...options];if(value!==undefined&&value!==null&&String(value)!==''&&!safeOptions.some(([v])=>String(v)===String(value)))safeOptions.push([String(value),String(value)+' · registro anterior']);const opts=[['',placeholder],...safeOptions].map(([v,label])=>'<option value="'+esc(v)+'" '+(String(value??'')===String(v)?'selected':'')+'>'+esc(label)+'</option>').join('');
    const empty=options.length?'':' disabled';
    return '<select class="specific-cell contextual-select" data-r="'+rowIndex+'" data-c="'+columnIndex+'" '+empty+'>'+opts+'</select>';
  }
  function renderSpecificRows(rows,code){
    const cfg=specificTemplates[code];if(!cfg)return;
    $('#specificTestHead').innerHTML='<tr>'+cfg.cols.map(c=>'<th>'+esc(c[1])+'</th>').join('')+'</tr>';
    $('#specificTestRows').innerHTML=(rows||[]).map((raw,i)=>{
      const row=normalizeSpecificRow(code,raw),visible=new Set(cfg.cols.map(c=>c[0]));
      const legacy=Object.entries(row).filter(([key])=>!visible.has(key)).map(([key,value])=>'<input type="hidden" class="specific-legacy-cell" data-key="'+esc(key)+'" value="'+esc(value??'')+'">').join('');
      return '<tr>'+cfg.cols.map(([key],c)=>{
        const readonly=key==='absorption_index'?' readonly title="R a 1 min / R a 30 s"':(code==='BUSHING'&&['variation_percent','result'].includes(key)?' readonly title="Calculado a partir de capacitancia de placa y medida"':(code==='POWER_FACTOR'&&['capacitance_measured','status'].includes(key)?' readonly title="Calculado según el protocolo"':''));
        const contextual=renderContextSelect(code,key,row[key],i,c);
        return '<td>'+(contextual||'<input class="specific-cell '+(readonly?'calculated':'')+'" data-r="'+i+'" data-c="'+c+'" value="'+esc(row[key]??'')+'"'+readonly+'>')+'</td>';
      }).join('')+legacy+'</tr>';
    }).join('');
  }
  function collectSpecificRows(){
    const cfg=specificTemplates[activeSpecificCode];if(!cfg)return[];
    return $('#specificTestRows tr').map(tr=>{const o={};queryAll('.specific-cell',tr).forEach((e,i)=>o[cfg.cols[i][0]]=e.value);queryAll('.specific-legacy-cell',tr).forEach(e=>o[e.dataset.key]=e.value);return normalizeSpecificRow(activeSpecificCode,o);}).filter(r=>Object.entries(r).some(([k,v])=>k!=='absorption_index'&&String(v).trim()!==''));
  }
  function specificToMeasurements(){
    const cfg=specificTemplates[activeSpecificCode],out=[];if(!cfg)return out;
    collectSpecificRows().forEach((r,i)=>Object.entries(r).forEach(([k,v])=>{if(v!==''&&v!==null&&v!==undefined)out.push({parameter:cfg.prefix+'|'+(i+1)+'|'+k,value:String(v),unit:'',notes:''});}));
    return out;
  }
  function toggleTestTemplate(){
    const code=$('#executionType')?.value,isTtr=code==='TTR',isSpecific=!!specificTemplates[code];
    $('#ttrEditor')?.classList.toggle('hidden',!isTtr);
    $('#specificTestEditor')?.classList.toggle('hidden',!isSpecific);
    $('#measurementGenericCard')?.classList.toggle('hidden',isTtr||isSpecific);
    if(activeSpecificCode!==code && $('#specificTestRows'))$('#specificTestRows').innerHTML='';
    activeSpecificCode=isSpecific?code:'';
    if(isSpecific){const cfg=specificTemplates[code];const needs=testElementNeeds[code]||[];$('#specificTestTitle').textContent=cfg.title;$('#specificTestHint').textContent=cfg.hint+' Elementos de configuración utilizados: '+needs.join(' · ')+'.';if(!$('#specificTestRows').children.length){
        let initial=Array.from({length:Math.max(1,(getConfig().windings||[]).length)},()=>({}));
        if(code==='POWER_FACTOR')initial=['CH+CHL','CH','CHL','CL+CLH','CL','CLH'].map(measurement=>({measurement}));
        if(code==='WINDING_RESISTANCE')initial=(getConfig().windings||[]).map(w=>({winding:w.name||'',tap:'',phase:''}));
        if(code==='INSULATION_RESISTANCE'){const points=contextOptionsForField(code,'point')||[];initial=points.map(([point])=>({point}));}
        if(code==='EXCITATION'){const terminals=configuredTerminalOptions(false);initial=terminals.map(([phase])=>({tap:'',phase,frequency_hz:String(transformer.frequency_hz||getConfig().frequency_hz||'')}));}
        if(code==='BUSHING'){const configured=configuredTerminalOptions(true).map(([terminal])=>({terminal,serial:''}));if(configured.length)initial=configured;}
        if(code==='CAPACITANCE')initial=configuredTerminalOptions(false).map(([point])=>({point}));
        renderSpecificRows(initial,code);
        if(code==='POWER_FACTOR'){
          const statuses=initial.map(row=>normalizeSpecificRow('POWER_FACTOR',row).status);
          $('#executionObservations').value=statuses.length===6&&statuses.every(v=>v==='CORRECTO')?'Los valores obtenidos están dentro de lo recomendado según la cláusula 7.2.14 de la norma IEEE Std C57. 152 - 2013. Los valores son aceptables.':(statuses.some(v=>v==='OBSERVADO')?'Se encontraron valores observados':'Pendiente de completar las seis mediciones del ensayo.');
        }
      }}

    if(isTtr && !$('#ttrRows').children.length){
      const taps=configuredTapOptions();
      renderTtrRows(taps.map(([tap])=>({tap})));
    }
  }

  $('#specificAddRows')?.addEventListener('click',()=>renderSpecificRows([...collectSpecificRows(),{},{},{},{},{}],activeSpecificCode));
  $('#specificTestRows')?.addEventListener('input',e=>{
    if(!e.target.matches('.specific-cell'))return;
    const tr=e.target.closest('tr');if(!tr)return;
    if(activeSpecificCode==='INSULATION_RESISTANCE'){
      const raw30=String(tr.querySelector('[data-c="3"]')?.value||'').trim().replace(',','.');
      const raw1=String(tr.querySelector('[data-c="5"]')?.value||'').trim().replace(',','.');
      const r30=raw30===''?NaN:Number(raw30),r1=raw1===''?NaN:Number(raw1),target=tr.querySelector('[data-c="6"]');
      if(target)target.value=raw30!==''&&Number.isFinite(r30)&&r30!==0&&Number.isFinite(r1)?String(r1/r30):'';
    }
    if(activeSpecificCode==='POWER_FACTOR'){
      const rows=collectSpecificRows(),ri=Number(e.target.dataset.r),normalized=normalizeSpecificRow('POWER_FACTOR',rows[ri]||{});rows[ri]=normalized;
      const cap=tr.querySelector('[data-c="5"]'),status=tr.querySelector('[data-c="6"]');if(cap)cap.value=normalized.capacitance_measured||'';if(status)status.value=normalized.status||'PENDIENTE';
      const states=rows.map(r=>normalizeSpecificRow('POWER_FACTOR',r).status);
      $('#executionObservations').value=states.length===6&&states.every(s=>s==='CORRECTO')?'Los valores obtenidos están dentro de lo recomendado según la cláusula 7.2.14 de la norma IEEE Std C57. 152 - 2013. Los valores son aceptables.':(states.some(s=>s==='OBSERVADO')?'Se encontraron valores observados':'Pendiente de completar las seis mediciones del ensayo.');
    }
  });
  $('#specificTestRows')?.addEventListener('paste',e=>{
    const cell=e.target.closest('.specific-cell');if(!cell||!activeSpecificCode)return;
    const text=(e.clipboardData||window.clipboardData).getData('text');if(!text.includes('\t')&&!text.includes('\n'))return;
    e.preventDefault();const cfg=specificTemplates[activeSpecificCode],rows=collectSpecificRows(),r0=+cell.dataset.r,c0=+cell.dataset.c;
    text.replace(/\r/g,'').split('\n').filter((x,i,a)=>!(i===a.length-1&&x==='')).forEach((line,ri)=>{while(rows.length<=r0+ri)rows.push({});line.split('\t').forEach((v,ci)=>{if(c0+ci<cfg.cols.length)rows[r0+ri][cfg.cols[c0+ci][0]]=v.trim();});});
    renderSpecificRows(rows,activeSpecificCode);
  });
  $('#specificTestRows')?.addEventListener('keydown',e=>{
    const el=e.target.closest('.specific-cell');if(!el||!activeSpecificCode)return;
    const max=specificTemplates[activeSpecificCode].cols.length;let r=+el.dataset.r,c=+el.dataset.c;
    if(e.key==='Enter'||e.key==='ArrowDown'){e.preventDefault();r++;}
    else if(e.key==='ArrowUp'){e.preventDefault();r--;}
    else if(e.key==='ArrowRight'&&(!(el instanceof HTMLInputElement)||el.selectionStart===el.value.length)){e.preventDefault();c++;}
    else if(e.key==='ArrowLeft'&&(!(el instanceof HTMLInputElement)||el.selectionStart===0)){e.preventDefault();c--;}
    else if(e.key==='Tab'){e.preventDefault();c+=e.shiftKey?-1:1;}
    else return;
    if(c>=max){c=0;r++;}if(c<0){c=max-1;r=Math.max(0,r-1);}r=Math.max(0,r);
    const rows=collectSpecificRows();while(r>=rows.length)rows.push({});
    renderSpecificRows(rows,activeSpecificCode);$(`#specificTestRows [data-r="${r}"][data-c="${c}"]`)?.focus();
  });
  $('#executionType').addEventListener('change',()=>{toggleTestTemplate();});
  $('#ttrAddRows').addEventListener('click',()=>{
    const rows=collectTtrRows();const start=rows.length?Math.max(...rows.map(r=>Number(r.tap)||0))+1:1;
    for(let i=0;i<5;i++)rows.push({tap:start+i});
    renderTtrRows(rows);
  });
  $('#ttrRows').addEventListener('input',e=>{
    if(!e.target.matches('.ttr-cell')||[3,5,7,9].includes(Number(e.target.dataset.c)))return;
    const row=e.target.closest('tr');if(!row)return;
    const cells=queryAll('.ttr-cell',row);
    const values={tap:cells[0]?.value||'',at:cells[1]?.value||'',bt:cells[2]?.value||'',theoretical:'',U:cells[4]?.value||'',errU:'',V:cells[6]?.value||'',errV:'',W:cells[8]?.value||'',errW:'',notes:cells[10]?.value||''};
    const calculated=ttrCalc(values);
    [[3,'theoretical'],[5,'errU'],[7,'errV'],[9,'errW']].forEach(([index,key])=>{if(cells[index])cells[index].value=calculated[key]||'';});
  });
  $('#ttrRows').addEventListener('paste',e=>{
    const cell=e.target.closest('.ttr-cell');if(!cell)return;
    const text=(e.clipboardData||window.clipboardData).getData('text');if(!text.includes('\t')&&!text.includes('\n'))return;
    e.preventDefault();const lines=text.replace(/\r/g,'').split('\n').filter((x,i,a)=>!(i===a.length-1&&x==='')).map(x=>x.split('\t'));
    const rows=collectTtrRows(),r0=Number(cell.dataset.r),c0=Number(cell.dataset.c),keys=['tap','at','bt','theoretical','U','errU','V','errV','W','errW','notes'];
    lines.forEach((line,ri)=>{while(rows.length<=r0+ri)rows.push({tap:rows.length+1});line.forEach((v,ci)=>{if(c0+ci<11 && ![3,5,7,9].includes(c0+ci))rows[r0+ri][keys[c0+ci]]=v.trim();});});
    renderTtrRows(rows.map(ttrCalc));
  });
  $('#ttrRows').addEventListener('keydown',e=>{
    const el=e.target.closest('.ttr-cell');if(!el)return;
    let r=Number(el.dataset.r),c=Number(el.dataset.c);
    if(e.key==='Enter'||e.key==='ArrowDown'){e.preventDefault();r++;}
    else if(e.key==='ArrowUp'){e.preventDefault();r--;}
    else if(e.key==='ArrowRight'&&(!(el instanceof HTMLInputElement)||el.selectionStart===el.value.length)){e.preventDefault();c++;}
    else if(e.key==='ArrowLeft'&&(!(el instanceof HTMLInputElement)||el.selectionStart===0)){e.preventDefault();c--;}
    else if(e.key==='Tab'){e.preventDefault();c+=e.shiftKey?-1:1;}
    else return;
    if(c>10){c=0;r++;}if(c<0){c=10;r=Math.max(0,r-1);}r=Math.max(0,r);
    while([3,5,7,9].includes(c))c++;
    if(c>10){c=0;r++;}
    const rows=collectTtrRows();while(r>=rows.length)rows.push({tap:rows.length+1});renderTtrRows(rows);
    $(`#ttrRows [data-r="${r}"][data-c="${c}"]`)?.focus();
  });

  async function saveExecution(){
    const date=$('#executionDate').value;if(!date){toast('Selecciona la fecha y hora en que se realizó la prueba.',true);$('#executionDate').focus();return;}
    const isEditing=activeExecutionId!==null;
    const code=$('#executionType').value;
    const measurements=code==='TTR'?ttrToMeasurements():(specificTemplates[code]?specificToMeasurements():collectMeasurementRows());
    const payload={id:activeExecutionId,transformer_key:transformer.key,test_code:code,executed_at:date,status:'BORRADOR',operator_name:$('#executionOperator').value,supervisor_name:$('#executionSupervisor').value,standard_reference:$('#executionStandard').value,equipment_name:$('#executionEquipment').value,equipment_brand:$('#executionEquipmentBrand').value,equipment_model:$('#executionEquipmentModel').value,equipment_serial:$('#executionEquipmentSerial').value,oil_temperature_c:$('#executionOilTemp').value,ambient_temperature_c:$('#executionAmbientTemp').value,relative_humidity_percent:$('#executionHumidity').value,observations:$('#executionObservations').value,measurements};
    const btn=$('#saveExecution');btn.disabled=true;btn.textContent=isEditing?'Actualizando...':'Guardando...';
    try{
      if(PILOT.demo)throw new Error('Selecciona un transformador real antes de guardar.');
      if(!PILOT.testsSchemaReady)throw new Error('Prepara las tablas de pruebas eléctricas antes de guardar ejecuciones.');
      const r=await fetch(api('action=test-save'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const d=await readApiResponse(r);
      toast((isEditing?'Registro actualizado':'Prueba guardada')+' · Registro #'+d.result.id+' · '+formatExecutionDate(d.result.executed_at));
      showOnlyMain('testPage');await loadTestHistory();
    }catch(e){toast(e.message,true);}
    finally{btn.disabled=false;btn.innerHTML=activeExecutionMode==='edit'?'<svg><use href="#i-check"/></svg>Actualizar registro':'<svg><use href="#i-check"/></svg>Guardar registro';}
  }
  $('#saveExecution').addEventListener('click',saveExecution);

  // Inicio de una ejecución: solo el módulo de pruebas escucha esta acción.
  document.addEventListener('click', event => {
    const target=event.target instanceof Element?event.target:event.target?.parentElement;
    const trigger=target?.closest('#newTestExecution');
    if(!trigger)return;
    event.preventDefault();
    try{startExecution('TTR');}
    catch(error){console.error('No se pudo iniciar el registro de pruebas:',error);toast(error.message||'No se pudo abrir el registro de pruebas.',true);}
  });


window.ELEC_PLAN_BRIDGE = {
    getTransformer: function(){ return configBridge.getTransformer(); },
    getElectricalConfig: function(){ return configBridge.getElectricalConfig(); },
    reloadTestHistory: function(){ return loadTestHistory(); },
    api: function(query){ return api(query); },
    readApiResponse: function(response){ return readApiResponse(response); },
    showPage: function(pageId){
      document.body.classList.toggle('config-focus',pageId==='configPage');
      document.body.classList.toggle('test-page-focus',pageId==='testPage');
      document.body.classList.toggle('test-form-focus',pageId==='executionPage'||pageId==='planPage');
      ['overviewPage','configPage','testPage','executionPage','planPage'].forEach(function(id){
        const node=document.getElementById(id);if(node)node.classList.toggle('hidden',id!==pageId);
      });
    },
    navigatePage: function(targetId){
      if(targetId==='openConfig')configBridge.openConfig();
      else if(targetId==='backOverview')configBridge.backOverview();
      else if(targetId==='openElectricalTests'||targetId==='backFromTests')openTests();
    },
    notify: function(message,isError){ toast(message,!!isError); },
    demo: function(){ return !!PILOT.demo; },
    testsReady: function(){ return !!PILOT.testsSchemaReady; },
    canRunTests: function(){ return !electricalTestsBlockReason(); },
    testAccessReason: function(){ return electricalTestsBlockReason(); }
  };
})();
