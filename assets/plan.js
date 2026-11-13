(() => {
  const bridge=window.ELEC_PLAN_BRIDGE;if(!bridge)return;
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const catalog=[
    ['TTR','Relación de transformación','TAP, relación teórica y error porcentual por fase'],
    ['POWER_FACTOR','Factor de potencia del transformador','Modo, tensión, FP medido/corregido y capacitancia'],
    ['EXCITATION','Corriente de excitación','TAP, fase, tensión/frecuencia, corriente y pérdidas'],
    ['WINDING_RESISTANCE','Resistencia de devanados','Secciones AT/BT, corriente de prueba y resistencia a 75 °C'],
    ['INSULATION_RESISTANCE','Resistencia de aislamiento','Tres puntos y lecturas a 15, 30, 45 y 60 segundos'],
    ['BUSHING','FP y capacitancia de bushings','Borne, serie, placa y medición individual'],
    ['SFRA','SFRA','Tres conexiones y comparación de curvas'],
    ['ARRESTER','Pararrayos AT / MT','Fase, salidas, modo GST, pérdidas y capacitancia'],
    ['PROTECTIONS','Protecciones propias','Ítem, accesorio, bornes, contacto, condición y ajuste'],
    ['CAPACITANCE','Capacitancia complementaria','Ensayo adicional no incluido como bloque independiente en LAP']
  ];
  const templates={
    WINDING_RESISTANCE:{prefix:'WR',cols:[['section','Devanado (AT / BT)'],['tap','TAP'],['phase','Fase / conexión'],['test_current_a','I de prueba (A)'],['temperature_c','Temperatura medida (°C)'],['resistance_measured','Resistencia medida'],['resistance_referred_75c','Resistencia referida 75 °C'],['status','Estado']]},
    INSULATION_RESISTANCE:{prefix:'IR',cols:[['point','Punto de aplicación'],['applied_voltage_kv','Voltaje aplicado (kV)'],['reading_15s','Resistencia a 15 s'],['reading_30s','Resistencia a 30 s'],['reading_45s','Resistencia a 45 s'],['reading_1min','Resistencia a 1 min'],['absorption_index','Índice de absorción (1 min / 30 s)'],['reading_unit','Unidad de resistencia'],['status','Estado']]},
    POWER_FACTOR:{prefix:'PF',cols:[['measurement','Modo de prueba'],['test_voltage','Tensión de prueba (V)'],['power_factor_measured','Factor de Potencia medido (%)'],['power_factor_corrected_20c','Factor de Potencia corregido (%)'],['capacitance_source_f','Capacitancia'],['capacitance_measured','Capacitancia medida'],['status','Estado']]},
    EXCITATION:{prefix:'EXC',cols:[['tap','TAP'],['test_voltage_kv','Tensión de prueba (kV)'],['frequency_hz','Frecuencia (Hz)'],['current_u_ma','Corriente U-0 (mA)'],['losses_u_w','Pérdidas U-0 (W)'],['current_v_ma','Corriente V-0 (mA)'],['losses_v_w','Pérdidas V-0 (W)'],['current_w_ma','Corriente W-0 (mA)'],['losses_w_w','Pérdidas W-0 (W)'],['evaluation','Estado']]},
    BUSHING:{prefix:'BUSH',cols:[['terminal','Borne'],['serial','Serie'],['test_voltage','Tensión de prueba'],['power_factor_plate','FP de placa'],['power_factor_measured','FP medido'],['capacitance_plate','Capacitancia de placa'],['capacitance_measured','Capacitancia medida'],['variation_percent','Variación (%)'],['status','Estado']]},
    SFRA:{prefix:'SFRA',cols:[['connection','Configuración'],['tap','TAP'],['file_reference','Archivo / curva de campo'],['reference_curve','Curva de referencia (fábrica)'],['comparison_result','Resultado de comparación'],['result','Estado']]},
    ARRESTER:{prefix:'ARR',cols:[['section','Sección (AT / MT)'],['phase','Fase'],['output_voltage','V. salida'],['output_current','I. salida'],['test_mode','Modo de prueba (GST)'],['losses_measured','Pérdidas medidas'],['capacitance_measured','Capacitancia medida'],['status','Estado']]},
    PROTECTIONS:{prefix:'PROT',cols:[['item','Ítem'],['accessory','Accesorio'],['terminals','Bornes'],['contact','Contacto'],['condition','Condición'],['setpoint','Ajuste'],['status','Estado']]},
    CAPACITANCE:{prefix:'CAP',cols:[['point','Punto / borne'],['connection','Conexión de prueba'],['test_voltage_kv','Tensión de prueba (kV)'],['capacitance_nf','Capacitancia (nF)'],['frequency_hz','Frecuencia (Hz)'],['temperature_c','Temperatura (°C)'],['status','Estado']]}
  };
  let items=[],editingId=null,editingStatus='BORRADOR',sessionId=null,activeTestIndex=0,currentPlanStep='shared';
  let autoSaveTimer=null,savePromise=null,savePending=false,editRevision=0,savedRevision=0;
  function hasUnsavedChanges(){return editingId!==null&&editRevision>savedRevision;}
  function setSaveStatus(message,state){
    const node=$('#planSaveStatus');if(!node)return;
    node.dataset.state=state||'idle';
    node.title=String(message||'');
    const label=node.querySelector('span');if(label)label.textContent=message;
  }
  function scheduleAutoSave(delay){
    if(autoSaveTimer)clearTimeout(autoSaveTimer);
    // La preparación es temporal: nunca crea registros en segundo plano.
    if(editingId===null){setSaveStatus('Preparación · todavía no se guarda','idle');return;}
    if(!$('#planDate').value){setSaveStatus('Falta la fecha de realización para guardar','warning');return;}
    setSaveStatus('Cambios pendientes · se guardarán automáticamente','pending');
    autoSaveTimer=setTimeout(()=>savePlan(true),delay??900);
  }
  function markPlanChanged(delay){editRevision++;scheduleAutoSave(delay);}
  window.addEventListener('beforeunload',event=>{
    if(hasUnsavedChanges()||savePromise){event.preventDefault();event.returnValue='';}
  });
  function typeName(code){return (catalog.find(x=>x[0]===code)||[])[1]||code;}
  function api(q){return bridge.api(q);}
  async function json(response){return bridge.readApiResponse(response);}
  function toast(message,bad){bridge.notify(message,!!bad);}
  function transformer(){return bridge.getTransformer();}
  function columns(code){return code==='TTR'?[['tap','TAP'],['at','AT (kV)'],['bt','BT (kV)'],['theoretical','Relación teórica'],['U','U-0 / w-u'],['V','V-0 / u-v'],['W','W-0 / v-w'],['errU','e1 (%)'],['errV','e2 (%)'],['errW','e3 (%)'],['status','Resultado']]:(templates[code]?.cols||[]);}
  function filteredColumns(code){return columns(code);}
  function number(v){const s=String(v??'').trim().replace(',','.');if(!s)return null;const n=Number(s);return Number.isFinite(n)?n:null;}
  function normalize(code,row){
    const r={...(row||{})};
    const aliases={
      POWER_FACTOR:{test_voltage:['test_voltage_v','test_voltage_kv'],capacitance_source_f:['capacitance_f'],capacitance_measured:['capacitance_nf','capacitance']},
      EXCITATION:{excitation_current:['current','output_current_a'],losses:['power','losses_w']},
      WINDING_RESISTANCE:{resistance_measured:['resistance_measured_ohm','resistance'],resistance_referred_75c:['resistance_referred_75c_ohm']},
      BUSHING:{test_voltage:['test_voltage_kv'],power_factor_measured:['power_factor'],capacitance_plate:['capacitance_plate_pf'],capacitance_measured:['capacitance_measured_pf','capacitance'],serial:['serial_number']},
      ARRESTER:{output_voltage:['output_voltage_kv','output_voltage_v'],output_current:['output_current_ma','output_current_a'],losses_measured:['losses_w','losses_measured_w'],capacitance_measured:['capacitance_pf','capacitance_measured_pf']}
    };
    Object.entries(aliases[code]||{}).forEach(([target,legacy])=>{if(!Object.prototype.hasOwnProperty.call(r,target)){const value=legacy.map(key=>r[key]).find(isFilled);if(value!==undefined)r[target]=value;}});
    if(code==='INSULATION_RESISTANCE'){const a=number(r.reading_30s),b=number(r.reading_1min);r.absorption_index=a!==null&&a!==0&&b!==null?String(b/a):'';if(!isFilled(r.status))r.status='PENDIENTE';}
    if(code==='ARRESTER'&&!isFilled(r.status))r.status='PENDIENTE';
    if(code==='CAPACITANCE'&&!isFilled(r.status))r.status='PENDIENTE';
    if(code==='WINDING_RESISTANCE'&&!isFilled(r.status))r.status='PENDIENTE';
    if(code==='POWER_FACTOR'){
      if(!Object.prototype.hasOwnProperty.call(r,'capacitance_source_f')){const legacy=number(r.capacitance_measured??r.capacitance_nf??r.capacitance);if(legacy!==null)r.capacitance_source_f=String(legacy/1e9);}
      const source=number(r.capacitance_source_f);r.capacitance_measured=source===null?'':(source*1e9).toFixed(6);
      const corrected=number(r.power_factor_corrected_20c);r.status=corrected===null?'PENDIENTE':(Math.abs(corrected)<1?'CORRECTO':'OBSERVADO');
    }
    if(code==='TTR'){
      if(!isFilled(r.status)&&isFilled(r.result))r.status=r.result;
      const a=number(r.at),b=number(r.bt),theo=a!==null&&b!==null&&b!==0?a/(b*Math.sqrt(3)):number(r.theoretical);
      r.theoretical=theo===null?'':String(theo);
      const errors=['U','V','W'].map(k=>{const m=number(r[k]);const error=theo!==null&&m!==null&&m!==0?(m-theo)*100/m:null;r['err'+k]=error===null?'':String(error);return error;});
      r.status=errors.every(v=>v!==null)?(errors.every(v=>Math.abs(v)<=0.5)?'CORRECTO':'OBSERVADO'):'PENDIENTE';
    }
    if(code==='BUSHING'){
      if(!isFilled(r.status)&&isFilled(r.result))r.status=r.result;
      const plate=number(r.capacitance_plate),measured=number(r.capacitance_measured);
      const variation=plate!==null&&plate>0&&measured!==null?Math.abs(measured-plate)*100/plate:null;
      r.variation_percent=variation===null?'':String(variation);
      r.status=variation===null?'PENDIENTE':(variation<5?'CONFORME':'OBSERVADO');
    }
    return r;
  }
  function powerFactorObservation(rows){
    const statuses=(rows||[]).map(row=>normalize('POWER_FACTOR',row).status);
    if(statuses.length>0&&statuses.every(s=>s==='CORRECTO'))return 'Los valores obtenidos están dentro de lo recomendado según la cláusula 7.2.14 de la norma IEEE Std C57. 152 - 2013. Los valores son aceptables.';
    if(statuses.some(s=>s==='OBSERVADO'))return 'Se encontraron valores observados';
    return 'Pendiente de completar las seis mediciones del ensayo.';
  }
  function observationSummary(item){
    const states=(item.rows||[]).map(row=>{
      const normalized=normalize(item.code,row);
      return String(normalized.status??normalized.evaluation??normalized.result??'').trim().toUpperCase();
    });
    if(!states.length||states.some(state=>!state||state==='PENDIENTE'))return 'Pendiente de completar o evaluar el ensayo.';
    if(states.some(state=>state==='OBSERVADO'))return 'Se encontraron valores observados.';
    if(states.some(state=>state==='NO CONCLUYENTE'))return 'El ensayo presenta resultados no concluyentes.';
    if(states.every(state=>['CORRECTO','CONFORME','NO APLICA'].includes(state)))return 'Todos los valores conforme.';
    return 'Pendiente de revisar los resultados del ensayo.';
  }
  function refreshObservationLive(card,item){
    const textarea=card?.querySelector('textarea[data-meta="observations"]');
    if(!textarea)return;
    const current=textarea.value.trim();
    const previous=item._autoObservationText||'';
    const knownAuto=['Todos los valores conforme','Todos los valores conforme.','Se encontraron valores observados','Se encontraron valores observados.','Pendiente de completar o evaluar el ensayo.','El ensayo presenta resultados no concluyentes.','Pendiente de revisar los resultados del ensayo.'];
    if(current&&current!==previous&&!knownAuto.includes(current))return;
    const next=observationSummary(item);
    textarea.value=next;
    item.observations=next;
    item._autoObservationText=next;
  }
  const capacitanceUnits={pF:1e3,nF:1,µF:1e-3,mF:1e-6,F:1e-9};
  function capacitanceDisplay(value,unit){const n=number(value);return n===null?'':(n*(capacitanceUnits[unit]||1)).toFixed(6);}
  function refreshPowerFactorLive(card,item){
    if(!card||!item||item.code!=='POWER_FACTOR')return;
    item.rows=(item.rows||[]).map(row=>normalize('POWER_FACTOR',row));
    item.autoObservation=powerFactorObservation(item.rows);
    item.rows.forEach((row,index)=>['capacitance_measured','status'].forEach(key=>{
      const output=card.querySelector('[data-row="'+index+'"][data-col="'+key+'"]');
      if(output){const display=key==='capacitance_measured'?capacitanceDisplay(row[key],item.capacitance_unit||'nF'):(row[key]??'');if(output.value!==String(display))output.value=display;}
    }));
    const observation=card.querySelector('[data-auto-observation]');
    if(observation)observation.textContent=item.autoObservation;
  }
  function defaults(code){
    if(code==='TTR'){const t=transformer(),n=Math.max(5,Number(t.num_taps||0));return Array.from({length:Math.min(n,100)},(_,i)=>({tap:String(i+1)}));}
    if(code==='POWER_FACTOR')return ['CH+CHL','CH','CHL','CL+CLH','CL','CLH'].map(measurement=>({measurement}));
    if(code==='INSULATION_RESISTANCE')return ['AT-BT','AT-Masa','BT-Masa'].map(point=>({point}));
    if(code==='WINDING_RESISTANCE')return [{status:'PENDIENTE'},{status:'PENDIENTE'}];
    if(code==='EXCITATION'){const frequency=String(transformer().frequency_hz||'');return [{tap:'',test_voltage_kv:'',frequency_hz:frequency,evaluation:'PENDIENTE'}];}
    if(code==='BUSHING'){
      const config=bridge.getElectricalConfig();
      const terminals=(config?.windings||[]).flatMap(w=>w.terminals||[]).filter(t=>t.has_capacitive_bushing).map(t=>({terminal:t.code||'',serial:t.bushing?.serial_number||''}));
      return terminals.length?terminals:[{}];
    }
    if(code==='SFRA')return [{connection:'AT vs BT (abierto)',tap:''},{connection:'BT vs AT (abierto)',tap:''},{connection:'AT vs BT (corto circuito)',tap:''}];
    if(code==='ARRESTER')return [...['1U','1V','1W'].map(phase=>({section:'AT',phase,test_mode:'GST'})),...['2U','2V','2W','2N'].map(phase=>({section:'MT',phase,test_mode:'GST'}))];
    if(code==='PROTECTIONS')return [{}];
    return [{},{}];
  }
  function rowsFromMeasurements(code,ms){
    const prefix=code==='TTR'?'TTR':(templates[code]?.prefix||code),data={};
    (ms||[]).forEach(m=>{const z=String(m.parameter||'').match(new RegExp('^'+prefix+'\\|(\\d+)\\|(.+)$'));if(z){data[z[1]]=data[z[1]]||{};data[z[1]][z[2]]=m.value??m.notes??'';}});
    let rows=Object.keys(data).sort((a,b)=>Number(a)-Number(b)).map(k=>data[k]);
    if(code==='INSULATION_RESISTANCE'&&rows.some(r=>r.from||r.to||r.time||r.reading)){
      const grouped={};rows.forEach(r=>{const k=[r.from||'',r.to||'',r.voltage||'',r.unit||'',r.reading_unit||''].join('|');const g=grouped[k]||(grouped[k]={point:[r.from,r.to].filter(Boolean).join(' - '),applied_voltage_kv:r.voltage||'',reading_unit:r.reading_unit||r.unit||''});const t=String(r.time||'').toLowerCase().replace(/['’]/g,'');if(t==='15'||t==='15s')g.reading_15s=r.reading||'';if(t==='30'||t==='30s')g.reading_30s=r.reading||'';if(t==='45'||t==='45s')g.reading_45s=r.reading||'';if(t==='1'||t==='1m'||t==='60'||t==='60s')g.reading_1min=r.reading||'';});rows=Object.values(grouped);
    }
    if(code==='POWER_FACTOR')rows=rows.map(r=>({...r,measurement:r.measurement||r.point||'',test_voltage_v:r.test_voltage_v||r.test_voltage||'',power_factor_measured:r.power_factor_measured||r.power_factor||'',power_factor_corrected_20c:r.power_factor_corrected_20c||r.power_factor_corrected||'',capacitance_nf:r.capacitance_nf||r.capacitance||''}));
    if(code==='BUSHING')rows=rows.map(r=>({...r,terminal:r.terminal||r.point||'',serial:r.serial||r.serial_number||'',power_factor_measured:r.power_factor_measured||r.power_factor||'',capacitance_measured_pf:r.capacitance_measured_pf||r.capacitance||''}));
    if(code==='WINDING_RESISTANCE')rows=rows.map(r=>({...r,section:r.section||r.winding||'',phase:r.phase||r.terminal_pair||'',temperature_c:r.temperature_c||r.temperature||'',resistance_measured_ohm:r.resistance_measured_ohm||r.resistance||'',resistance_referred_75c_ohm:r.resistance_referred_75c_ohm||r.resistance_referred_75c||''}));
    if(code==='EXCITATION'&&rows.some(r=>r.phase||r.excitation_current||r.current||r.losses||r.power)){const grouped=new Map();rows.forEach(r=>{const tap=String(r.tap||'').trim(),phase=String(r.phase||'').toUpperCase().replace(/\s/g,'');if(!tap||!['U-0','V-0','W-0'].includes(phase))return;const g=grouped.get(tap)||{tap,test_voltage_kv:r.test_voltage_kv||r.test_voltage||'',frequency_hz:r.frequency_hz||'',evaluation:'PENDIENTE'};const suffix=phase[0].toLowerCase();g['current_'+suffix+'_ma']=r.excitation_current||r.current||r.output_current_a||'';g['losses_'+suffix+'_w']=r.losses||r.power||r.losses_w||'';grouped.set(tap,g);});if(grouped.size)rows=Array.from(grouped.values());}
    return rows.map(r=>normalize(code,r));
  }
  function measurementsFromRows(item){
    const prefix=item.code==='TTR'?'TTR':(templates[item.code]?.prefix||item.code),out=[];
    (item.rows||[]).map(r=>normalize(item.code,r)).forEach((row,i)=>{
      Object.entries(row).forEach(([key,value])=>{
        if(value!==''&&value!==null&&value!==undefined)out.push({parameter:prefix+'|'+(item.code==='TTR'?(row.tap||i+1):(i+1))+'|'+key,value:String(value),unit:'',notes:''});
      });
    });
    return out;
  }
  function makeItem(code,old){old=old||{};return {id:old.id||null,code,name:typeName(code),status:old.status||'BORRADOR',standard_reference:old.standard_reference||'',equipment_name:old.equipment_name||'',equipment_brand:old.equipment_brand||'',equipment_model:old.equipment_model||'',equipment_serial:old.equipment_serial||'',core_type:old.core_type||'NO_ESPECIFICADO',capacitance_unit:old.capacitance_unit||'nF',observations:old.observations||'',rows:old.rows||defaults(code)};}
  const requiredByTest={
    TTR:['tap','at','bt','U','V','W','status'],
    POWER_FACTOR:['measurement','test_voltage','power_factor_measured','power_factor_corrected_20c','capacitance_source_f','status'],
    EXCITATION:['tap','test_voltage_kv','frequency_hz','current_u_ma','losses_u_w','current_v_ma','losses_v_w','current_w_ma','losses_w_w','evaluation'],
    WINDING_RESISTANCE:['section','tap','phase','test_current_a','temperature_c','resistance_measured','resistance_referred_75c','status'],
    INSULATION_RESISTANCE:['point','applied_voltage_kv','reading_15s','reading_30s','reading_45s','reading_1min','status'],
    BUSHING:['terminal','serial','test_voltage','power_factor_plate','power_factor_measured','capacitance_plate','capacitance_measured','variation_percent','status'],
    SFRA:['connection','tap','comparison_result','result'],
    ARRESTER:['section','phase','output_voltage','output_current','test_mode','losses_measured','capacitance_measured','status'],
    PROTECTIONS:['accessory','terminals','contact','condition','status'],
    CAPACITANCE:['point','connection','test_voltage_kv','capacitance_nf','status']
  };
  const numericByTest={
    TTR:['at','bt','U','V','W'],
    POWER_FACTOR:['test_voltage','power_factor_measured','power_factor_corrected_20c','capacitance_source_f'],
    EXCITATION:['test_voltage_kv','frequency_hz','current_u_ma','losses_u_w','current_v_ma','losses_v_w','current_w_ma','losses_w_w'],
    WINDING_RESISTANCE:['test_current_a','temperature_c','resistance_measured','resistance_referred_75c'],
    INSULATION_RESISTANCE:['applied_voltage_kv','reading_15s','reading_30s','reading_45s','reading_1min'],
    BUSHING:['test_voltage','power_factor_plate','power_factor_measured','capacitance_plate','capacitance_measured','variation_percent'],
    ARRESTER:['output_voltage','output_current','losses_measured','capacitance_measured'],
    CAPACITANCE:['test_voltage_kv','capacitance_nf']
  };
  const requiredEquipment=['equipment_name','equipment_brand','equipment_model','equipment_serial'];
  const equipmentLabels={equipment_name:'equipo',equipment_brand:'marca del equipo',equipment_model:'modelo',equipment_serial:'serie'};
  const generalLabels={date:'fecha de realización',operator:'responsable / técnico',supervisor:'supervisor'};
  function isFilled(value){return value!==null&&value!==undefined&&String(value).trim()!=='';}
  function requiredValueFilled(key,value,code){
    if(['result','evaluation','status'].includes(key)&&String(value??'').trim().toUpperCase()==='PENDIENTE')return false;
    if((numericByTest[code]||[]).includes(key))return number(value)!==null;
    return isFilled(value);
  }
  function missingForRow(code,row){
    const required=requiredByTest[code]||columns(code).map(c=>c[0]).filter(k=>!['notes','absorption_index','theoretical','errU','errV','errW'].includes(k));
    const labels=Object.fromEntries(columns(code).map(c=>[c[0],c[1]]));
    const normalized=normalize(code,row);
    return required.filter(key=>!requiredValueFilled(key,normalized?.[key],code)).map(key=>labels[key]||key);
  }
  function itemMetrics(item){
    const rows=Array.isArray(item.rows)?item.rows:[];
    const metaMissing=requiredEquipment.filter(key=>!isFilled(item[key])).map(key=>equipmentLabels[key]);
    const required=requiredByTest[item.code]||filteredColumns(item.code).map(c=>c[0]).filter(k=>!['notes','absorption_index','theoretical','errU','errV','errW'].includes(k));
    let total=requiredEquipment.length,filled=requiredEquipment.length-metaMissing.length;
    const rowStates=rows.map((row,index)=>{
      const missing=missingForRow(item.code,row),rowFilled=required.length-missing.length;
      total+=required.length;filled+=rowFilled;
      const any=filteredColumns(item.code).some(([key])=>isFilled(row?.[key]));
      return {index,missing,filled:rowFilled,total:required.length,any,state:missing.length===0?'complete':(any?'partial':'empty')};
    });
    const missing=[...metaMissing];
    rowStates.forEach(row=>{if(row.missing.length)missing.push('Fila '+(row.index+1)+': '+row.missing.slice(0,5).join(', ')+(row.missing.length>5?'…':''));});
    if(!rows.length)missing.push('Agrega al menos una fila de medición');
    const complete=rows.length>0&&missing.length===0;
      const anyData=filled>0||rows.some(r=>filteredColumns(item.code).some(([key])=>isFilled(r?.[key])));
    const state=complete?'complete':(anyData?'partial':'empty');
    return {total,filled,percent:total?Math.round(filled/total*100):0,missing,metaMissing,rowStates,complete,anyData,state};
  }
  function generalMissing(){
    const missing=[];
    if(!isFilled($('#planDate').value))missing.push(generalLabels.date);
    if(!isFilled($('#planOperator').value))missing.push(generalLabels.operator);
    if(!isFilled($('#planSupervisor').value))missing.push(generalLabels.supervisor);
    return missing;
  }
  function planMetrics(){
    const general=generalMissing(),perItem=items.map(item=>({item,metrics:itemMetrics(item)}));
    const total=3+(items.length?0:1)+perItem.reduce((n,x)=>n+x.metrics.total,0);
    const filled=3-general.length+perItem.reduce((n,x)=>n+x.metrics.filled,0);
    const percent=total?Math.round(filled/total*100):0;
    const ready=perItem.filter(x=>x.metrics.complete).length;
    const completed=ready;
    const missing=[];
    general.forEach(x=>missing.push('Datos generales: falta '+x));
    perItem.forEach(({item,metrics})=>{
      metrics.missing.slice(0,5).forEach(msg=>missing.push(item.name+': '+msg));
      if(metrics.missing.length>5)missing.push(item.name+': y '+(metrics.missing.length-5)+' pendientes más');
      item.status=metrics.complete?'COMPLETADA':'BORRADOR';
    });
    if(!items.length)missing.unshift('Selecciona al menos un ensayo');
    return {general,perItem,total,filled,percent,ready,completed,missing,complete:!general.length&&items.length>0&&perItem.every(x=>x.metrics.complete)};
  }
  function refreshResultsSummary(){
    const meta=$('#planResultsAccordionMeta'),statusNode=$('#planResultsAccordionStatus');
    if(!meta||!statusNode)return;
    const states=items.map(item=>itemMetrics(item));
    const complete=states.filter(metric=>metric.complete).length;
    const incomplete=states.filter(metric=>metric.anyData&&!metric.complete).length;
    const unstarted=states.length-complete-incomplete;
    const pending=incomplete+unstarted;
    meta.textContent=items.length+' '+(items.length===1?'ensayo seleccionado':'ensayos seleccionados')+' · '+complete+' completos · '+pending+' por completar';
    statusNode.textContent=pending===0&&items.length>0?'Todos completos':pending+' pendientes';
    statusNode.dataset.state=pending===0&&items.length>0?'complete':(incomplete?'incomplete':'unstarted');
  }
  function refreshCardStatus(card,item){
    if(!card||!item)return;
    const metrics=itemMetrics(item);
    const state=metrics.complete?'complete':(metrics.anyData?'incomplete':'empty');
    card.dataset.state=state;
    const badge=card.querySelector('.plan-card-state');
    if(badge){badge.dataset.state=state;badge.textContent=metrics.complete?'Completo':(metrics.anyData?'Faltan datos':'Sin iniciar');}
    const progress=card.querySelector('[data-card-progress]');
    if(progress)progress.textContent=metrics.filled+'/'+metrics.total+' campos · '+metrics.percent+'%';
    if(state==='incomplete')card.open=true;
    refreshFieldStyles(card,item,metrics);
  }
  function refreshFieldStyles(card,item,metrics){
    card.querySelectorAll('.plan-cell').forEach(input=>{
      const row=Number(input.dataset.row),field=input.dataset.col,required=(requiredByTest[item.code]||[]).includes(field);
      const valid=requiredValueFilled(field,input.value,item.code);
      input.classList.toggle('is-filled',valid);
      input.classList.toggle('is-missing',required&&!valid);
      if(valid){input.removeAttribute('aria-invalid');delete input.dataset.validationAttempted;}else if(input.dataset.validationAttempted!=='true'){input.removeAttribute('aria-invalid');}
      if(input.classList.contains('plan-result-select'))input.dataset.state=String(input.value||'PENDIENTE').toLowerCase();
      if(field==='result'||(item.code==='TTR'&&field==='status')||(field==='status'&&['POWER_FACTOR','BUSHING','ARRESTER','CAPACITANCE'].includes(item.code))){
        const state=String(input.value||'').trim().toUpperCase();
        input.classList.toggle('result-good',['CORRECTO','CONFORME'].includes(state));
        input.classList.toggle('result-bad',state==='OBSERVADO');
        input.classList.toggle('result-pending',!state||state==='PENDIENTE');
      }
    });
    requiredEquipment.forEach(key=>{
      const input=card.querySelector('[data-meta="'+key+'"]');if(!input)return;
      input.classList.toggle('is-filled',isFilled(input.value));
      input.classList.toggle('is-missing',!isFilled(input.value));
      input.closest('label')?.classList.toggle('meta-complete',isFilled(input.value));
      input.closest('label')?.classList.toggle('meta-pending',!isFilled(input.value));
      if(isFilled(input.value)){input.removeAttribute('aria-invalid');delete input.dataset.validationAttempted;}else if(input.dataset.validationAttempted!=='true'){input.removeAttribute('aria-invalid');}
    });
    card.querySelectorAll('tbody tr[data-row-state]').forEach((tr,index)=>{tr.dataset.rowState=metrics.rowStates[index]?.state||'empty';});
    const progress=card.querySelector('[data-card-progress]');
    if(progress)progress.textContent=metrics.filled+'/'+metrics.total+' campos mínimos · '+metrics.percent+'%';
    const rowSummary=card.querySelector('[data-row-summary]');
    if(rowSummary){
      const complete=metrics.rowStates.filter(x=>x.state==='complete').length;
      const partial=metrics.rowStates.filter(x=>x.state==='partial').length;
      const empty=metrics.rowStates.filter(x=>x.state==='empty').length;
      rowSummary.textContent=complete+' completas · '+partial+' en curso · '+empty+' sin datos';
    }
  }
  function updatePlanStepper(m){
    const visitStarted=!!($('#planDate').value||$('#planOperator').value.trim()||$('#planSupervisor').value.trim());
    const sharedState=m.general.length===0?'complete':(visitStarted?'partial':'missing');
    const selectionState=items.length?'complete':'missing';
    const resultMetrics=m.perItem.map(entry=>entry.metrics);
    const resultsState=!items.length?'missing':(resultMetrics.every(metric=>metric.complete)?'complete':(resultMetrics.some(metric=>metric.anyData)?'partial':'missing'));
    const reviewState=m.complete?'complete':(items.length?'partial':'missing');
    const states={shared:sharedState,selection:selectionState,results:resultsState,review:reviewState};
    const labels={
      shared:sharedState==='complete'?'Completo':(sharedState==='partial'?'En curso':'Pendiente'),
      selection:items.length?items.length+' '+(items.length===1?'seleccionado':'seleccionados'):'Pendiente',
      results:resultsState==='complete'?'Completo':(resultsState==='partial'?'En curso':'Pendiente'),
      review:reviewState==='complete'?'Listo':(items.length?'Por revisar':'Pendiente')
    };
    const titles={shared:'Datos generales',selection:'Ensayos',results:'Resultados',review:'Revisión'};
    Object.entries(states).forEach(([key,state])=>{
      const step=$('#planStepper [data-plan-step="'+key+'"]');
      if(!step)return;
      step.dataset.state=state;
      step.classList.toggle('active',key===currentPlanStep);
      if(key===currentPlanStep)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');
      const icon=step.querySelector('.ui-step-icon');if(icon)icon.dataset.state=state;
      const status=step.querySelector('[data-step-status]');if(status)status.textContent=labels[key];
      step.setAttribute('aria-label',titles[key]+' · '+labels[key]);
      step.title=titles[key]+' · '+labels[key];
    });
    const stepKeys=['shared','selection','results','review'];
    document.querySelectorAll('#planStepper .plan-step-connector').forEach((line,index)=>{
      const previous=states[stepKeys[index]];
      line.dataset.state=previous==='complete'?'complete':(stepKeys[index]===currentPlanStep?'active':'pending');
    });
  }
  function renderPlanFeedback(){
    const m=planMetrics();
    ['planDate','planOperator','planSupervisor'].forEach(id=>{const field=$('#'+id);if(!field)return;const missing=!isFilled(field.value);field.classList.toggle('is-missing',missing);if(!missing){field.removeAttribute('aria-invalid');delete field.dataset.validationAttempted;}else if(field.dataset.validationAttempted!=='true'){field.removeAttribute('aria-invalid');}field.closest('label')?.classList.toggle('meta-pending',missing);field.closest('label')?.classList.toggle('meta-complete',!missing);});
    updatePlanStepper(m);
    const next=$('#planStepNext');
    if(next){
      const blocked=(currentPlanStep==='shared'&&m.general.length>0)||(currentPlanStep==='selection'&&items.length===0)||(currentPlanStep==='results'&&(!items.length||items.some(item=>!itemMetrics(item).complete)));
      // Mantener el botón accionable: la navegación valida y muestra el aviso
      // correspondiente en lugar de bloquear el clic silenciosamente.
      next.disabled=false;
      next.title=blocked?(currentPlanStep==='shared'?'Completa fecha, responsable/técnico y supervisor.':currentPlanStep==='selection'?'Selecciona al menos un ensayo.':'Completa todos los campos obligatorios de cada ensayo.'):'';
    }
    refreshResultsSummary();
    if(currentPlanStep==='review')renderPlanReview();
  }
  function refreshPlanFeedback(){
    // Cada campo actualiza su propia tarjeta; evita reconstruir el catálogo
    // y recorrer todas las grillas en cada pulsación.
    renderPlanFeedback();
  }

    const planStepKeys=['shared','selection','results','review'];
  const planStepLabels={shared:'Datos generales',selection:'Ensayos a realizar',results:'Registro de resultados',review:'Revisión del registro'};
  function firstIncompleteTest(){
    return items.findIndex(item=>!itemMetrics(item).complete);
  }
  function focusFirstInvalidTest(index){
    const item=items[index];if(!item)return;
    const card=$('#planTestCards [data-test-index="'+index+'"]');if(card)card.open=true;
    const metrics=itemMetrics(item);
    let target=null;
    const missingMeta=requiredEquipment.find(key=>!isFilled(item[key]));
    if(missingMeta)target=card?.querySelector('[data-meta="'+missingMeta+'"]');
    if(!target){
      const rowIndex=metrics.rowStates.findIndex(row=>row.missing.length>0);
      if(rowIndex>=0){
        const row=item.rows[rowIndex]||{};
        const required=requiredByTest[item.code]||filteredColumns(item.code).map(column=>column[0]);
        const key=required.find(field=>!requiredValueFilled(field,normalize(item.code,row)?.[field],item.code));
        if(key)target=card?.querySelector('.plan-cell[data-row="'+rowIndex+'"][data-col="'+key+'"]');
      }
    }
    if(card)card.scrollIntoView({behavior:'smooth',block:'center'});
    if(target){target.dataset.validationAttempted='true';target.setAttribute('aria-invalid','true');target.focus({preventScroll:true});}
  }

  function validatePlanStep(step){
    if(step==='shared'){
      const missing=generalMissing();
      if(missing.length){
        const ids={ 'fecha de realización':'planDate', 'responsable / técnico':'planOperator', 'supervisor':'planSupervisor' };
        const field=$('#'+(ids[missing[0]]||'planDate'));
        if(field){field.dataset.validationAttempted='true';field.setAttribute('aria-invalid','true');field.focus();}
        toast('Completa los datos obligatorios: '+missing.join(', ')+'.',true);
        return false;
      }
    }
    if(step==='selection'&&!items.length){
      toast('Selecciona al menos un ensayo antes de continuar.',true);
      return false;
    }
    if(step==='results'){
      const pending=items.filter(item=>!itemMetrics(item).complete);
      if(!items.length){
        toast('Selecciona al menos un ensayo antes de continuar.',true);
        return false;
      }
      if(pending.length){
        const names=pending.slice(0,3).map(item=>item.name);
        const extra=pending.length>3?' y '+(pending.length-3)+' más':'';
        toast('Completa los ensayos pendientes: '+names.join(', ')+extra+'.',true);
        const first=firstIncompleteTest();
        if(first>=0)focusFirstInvalidTest(first);
        return false;
      }
    }
    return true;
  }
  function setPlanStep(step){
    if(!planStepKeys.includes(step))return false;
    const currentIndex=planStepKeys.indexOf(currentPlanStep);
    const targetIndex=planStepKeys.indexOf(step);
    // Permite abrir cualquier etapa posterior cuando todas las etapas
    // anteriores superan su validación, sin exigir clics repetidos en Continuar.
    if(targetIndex>currentIndex){
      for(let index=0;index<targetIndex;index++){
        if(!validatePlanStep(planStepKeys[index]))return false;
      }
    }
    if((step==='results'||step==='review')&&!items.length){
      toast('Añade al menos un ensayo antes de continuar.',true);
      step='selection';
    }
    currentPlanStep=step;
    document.querySelectorAll('#planPage [data-plan-panel]').forEach(panel=>{panel.hidden=panel.dataset.planPanel!==step;});
    document.querySelectorAll('#planStepper [data-plan-step]').forEach(button=>{
      const active=button.dataset.planStep===step;
      button.classList.toggle('active',active);
      if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    });
    const index=planStepKeys.indexOf(step),back=$('#planStepBack'),next=$('#planStepNext'),hint=$('#planStepHint');
    if(back){back.hidden=index===0;back.disabled=false;back.textContent=step==='review'?'Volver a resultados':'Anterior';}
    if(next)next.textContent=step==='results'?'Revisar registro':(step==='review'?'Finalizar registro':'Continuar');
    if(editingId!==null&&hasUnsavedChanges())scheduleAutoSave(200);
    if(hint)hint.textContent='Paso '+(index+1)+' de 4';
    renderPlanFeedback();
    if(step==='review')renderPlanReview();
    return true;
  }
  async function ensureExecutionStarted(){
    if(editingId!==null)return true;
    if(!items.length){toast('Selecciona al menos un ensayo antes de crear el registro.',true);setPlanStep('selection');return false;}
    const message='Se creará el registro de esta ejecución con los ensayos seleccionados. Desde la confirmación, los cambios se guardarán automáticamente.';
    let accepted=false;
    if(window.Swal){
      const result=await window.Swal.fire({
        icon:'info',
        title:'¿Crear registro y continuar?',
        text:message,
        showCancelButton:true,
        confirmButtonText:'Confirmar y continuar',
        cancelButtonText:'Volver a revisar',
        reverseButtons:true,
        focusCancel:true,
        allowOutsideClick:false,
        customClass:{popup:'trafodex-confirm-modal',confirmButton:'trafodex-confirm-button',cancelButton:'trafodex-cancel-button'},
        buttonsStyling:true
      });
      accepted=!!result.isConfirmed;
    }else{
      accepted=window.confirm(message+'\\n\\n¿Confirmas la creación del registro y el inicio del autoguardado?');
    }
    if(!accepted)return false;
    const started=await startPlan();
    return !!started&&editingId!==null;
  }
  async function movePlanStep(offset){
    const current=planStepKeys.indexOf(currentPlanStep),next=Math.max(0,Math.min(planStepKeys.length-1,current+offset));
    if(next>=2&&!items.length){toast('Selecciona al menos un ensayo para continuar.',true);setPlanStep('selection');return;}
    if(next>=2&&editingId===null){
      if(!await ensureExecutionStarted())return;
    }
    setPlanStep(planStepKeys[next]);
  }
  function renderPlanReview(){
    const host=$('#planReviewSummary');if(!host)return;
    const m=planMetrics();
    const rows=items.map((item,index)=>{
      const metrics=itemMetrics(item),label=metrics.complete?'Completo':(metrics.anyData?'En curso':'Pendiente');
      return '<li><span class="plan-review-index">'+String(index+1).padStart(2,'0')+'</span><div><b>'+esc(item.name)+'</b><small>'+item.rows.length+' fila(s) · '+metrics.percent+'% de campos mínimos</small></div><strong data-state="'+metrics.state+'">'+label+'</strong></li>';
    }).join('');
    host.innerHTML='<div class="plan-review-metrics"><div><b>'+items.length+'</b><span>Ensayos</span></div><div><b>'+m.percent+'%</b><span>Avance general</span></div><div><b>'+m.missing.length+'</b><span>Pendientes</span></div></div><ul class="plan-review-list">'+rows+'</ul><p class="plan-review-note">'+(m.complete?'Todos los ensayos están completos. Confirma el registro para cerrarlo.':'Los cambios se guardan automáticamente. Completa los ensayos pendientes y luego confirma el registro.')+'</p>'+(m.missing.length?'<details class="plan-review-pending"><summary>Ver datos pendientes</summary><ul>'+m.missing.slice(0,12).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>':'');
  }
  function renderTestNav(){
    const host=$('#planTestNav');if(!host)return;
    host.innerHTML=items.map((item,index)=>{
      const metrics=itemMetrics(item),status=metrics.complete?'Completo':(metrics.anyData?metrics.percent+'%':'Por llenar');
      const stateClass=metrics.complete?'is-complete':(metrics.anyData?'is-incomplete':'is-unstarted');
      const stateLabel=metrics.complete?'Completo':(metrics.anyData?'Incompleto':'Sin iniciar');
      return '<button type="button" class="plan-test-tab '+stateClass+' '+(index===activeTestIndex?'active':'')+'" data-plan-test-index="'+index+'" aria-pressed="'+(index===activeTestIndex?'true':'false')+'" aria-label="'+esc(item.name)+' — '+stateLabel+'"><span>'+String(index+1).padStart(2,'0')+'</span><b>'+esc(item.name)+'</b><small>'+status+'</small></button>';
    }).join('');
  }
  function renderPicker(){
    const host=$('#planTestPicker');
    const selected=new Set(items.map(item=>String(item.code).toUpperCase()));
    if(host){
      host.innerHTML=catalog.map(([code,name,description])=>{
        const checked=selected.has(code.toUpperCase());
        return '<label class="plan-picker-option '+(checked?'is-selected':'')+'" for="plan-pick-'+esc(code)+'">'+
          '<input type="checkbox" id="plan-pick-'+esc(code)+'" value="'+esc(code)+'" '+(checked?'checked':'')+'>'+
          '<span class="plan-picker-check" aria-hidden="true"><svg><use href="#i-check"/></svg></span>'+
          '<span class="plan-picker-copy"><b>'+esc(name)+'</b><small>'+esc(description)+'</small></span>'+
          '<span class="plan-picker-state">'+(checked?'Añadido':'Añadir')+'</span>'+
        '</label>';
      }).join('');
    }
    const count=$('#planPickerCount');
    if(count)count.textContent=items.length+' seleccionado'+(items.length===1?'':'s');
    $('#planSelectionStatus').textContent=items.length?'':'Aún no has añadido ensayos al registro.';
  }
  function changePickedTest(code,checked){
    const index=items.findIndex(item=>String(item.code).toUpperCase()===String(code).toUpperCase());
    if(checked&&index<0){
      items.push(makeItem(code));
      activeTestIndex=items.length-1;
    }else if(!checked&&index>=0){
      if(items.length===1){
        toast('El registro debe conservar al menos un ensayo. Añade otro antes de retirar este.',true);
        renderPicker();
        return;
      }
      items.splice(index,1);
      activeTestIndex=Math.min(activeTestIndex,items.length-1);
    }else return;
    render();
    markPlanChanged(350);
  }
  function renderCards(){
    const host=$('#planTestCards');
    if(!items.length){host.innerHTML='<div class="empty-state">Selecciona pruebas para que aparezcan aquí sus formularios.</div>';return;}
    activeTestIndex=Math.max(0,Math.min(activeTestIndex,items.length-1));
    host.innerHTML=items.map((item,idx)=>{
      const fieldList=filteredColumns(item.code),required=requiredByTest[item.code]||[],metrics=itemMetrics(item);
      const head=item.code==='EXCITATION'?'<tr><th rowspan="2">TAP</th><th rowspan="2">Tensión de prueba (kV)</th><th rowspan="2">Frecuencia (Hz)</th><th colspan="2">U-0</th><th colspan="2">V-0</th><th colspan="2">W-0</th><th rowspan="2">Estado</th><th rowspan="2">Acción</th></tr><tr><th>Corriente (mA)</th><th>Pérdidas (W)</th><th>Corriente (mA)</th><th>Pérdidas (W)</th><th>Corriente (mA)</th><th>Pérdidas (W)</th></tr>':item.code==='TTR'?'<tr><th rowspan="2">TAP</th><th rowspan="2">AT (kV)</th><th rowspan="2">BT (kV)</th><th rowspan="2">Relación teórica</th><th colspan="3">Relación Medida</th><th colspan="3">Error Porcentual</th><th rowspan="2">Resultado</th><th rowspan="2">Acción</th></tr><tr><th>U-0<br>/ w-u</th><th>V-0<br>/ u-v</th><th>W-0<br>/ v-w</th><th>e1 %</th><th>e2 %</th><th>e3 %</th></tr>':'<tr>'+fieldList.map(f=>{let label=esc(f[1]);if(item.code==='POWER_FACTOR'&&f[0]==='power_factor_measured')label='Factor de Potencia medido (%)';if(item.code==='POWER_FACTOR'&&f[0]==='power_factor_corrected_20c')label='Factor de Potencia corregido (%)';if(item.code==='POWER_FACTOR'&&f[0]==='capacitance_measured')label='Capacitancia medida (<select class="plan-unit-select" data-meta="capacitance_unit" aria-label="Unidad de capacitancia">'+['pF','nF','µF','mF','F'].map(u=>'<option value="'+u+'" '+((item.capacitance_unit||'nF')===u?'selected':'')+'>'+u+'</option>').join('')+'</select>)';return '<th>'+label+(required.includes(f[0])?'<i class="required-mark" title="Campo requerido">*</i>':'')+'</th>';}).join('')+'<th class="plan-row-action-head">Acción</th></tr>';
      const tableHead=head;
      if(item.code==='POWER_FACTOR')item.autoObservation=powerFactorObservation(item.rows);
       const body=item.rows.map((raw,ri)=>{
        const row=normalize(item.code,raw),rowMetrics=metrics.rowStates[ri]||{any:false,state:'empty'};if(item.code==='POWER_FACTOR')row.capacitance_measured=capacitanceDisplay(row.capacitance_measured,item.capacitance_unit||'nF');
        return '<tr data-row-state="'+rowMetrics.state+'">'+fieldList.map(([key])=>{
          const calc=['absorption_index','theoretical','errU','errV','errW'].includes(key)||(item.code==='TTR'&&key==='status')||(item.code==='BUSHING'&&['variation_percent','status'].includes(key))||(item.code==='POWER_FACTOR'&&['capacitance_measured','status'].includes(key)),must=required.includes(key),value=row[key]??'';
          const filled=requiredValueFilled(key,value),missing=must&&!filled;
          if(item.code==='EXCITATION'&&key==='tap'){const config=bridge.getElectricalConfig()||{},positions=[...new Set((config.tap_changers||[]).flatMap(c=>(c.positions||[]).map(x=>String(x.position_no??'').trim()).filter(Boolean)))].sort((a,b)=>Number(a)-Number(b));const options=positions.length?positions:Array.from({length:Math.min(150,Math.max(0,Number(transformer().num_taps||0)))},(_,i)=>String(i+1));const opts=options.map(v=>'<option value="'+esc(v)+'" '+(String(value)===String(v)?'selected':'')+'>TAP '+esc(v)+'</option>').join('');return '<td><select class="plan-cell" data-row="'+ri+'" data-col="tap"><option value="">Selecciona TAP</option>'+opts+(value&&!options.includes(String(value))?'<option selected value="'+esc(value)+'">'+esc(value)+' · registro anterior</option>':'')+'</select></td>';}
          if(['result','evaluation','status'].includes(key)&&!calc){
            const options=['PENDIENTE','CONFORME','OBSERVADO','NO CONCLUYENTE','NO APLICA'],current=String(value||'PENDIENTE').toUpperCase();
            const extra=options.includes(current)?'':'<option value="'+esc(value)+'" selected>'+esc(value)+'</option>';
            return '<td><select class="plan-cell plan-result-select '+(filled?'is-filled':'is-missing')+'" data-row="'+ri+'" data-col="'+key+'" data-state="'+(filled?current.toLowerCase():'pending')+'" '+(must?'data-required="1"':'')+'>'+extra+options.map(option=>'<option value="'+option+'" '+(current===option?'selected':'')+'>'+option+'</option>').join('')+'</select></td>';
          }
          return '<td><input class="plan-cell '+(calc?'calculated':'')+(filled?' is-filled':'')+(missing?' is-missing':'')+'" data-row="'+ri+'" data-col="'+key+'" value="'+esc(value)+'" '+(must?'data-required="1"':'')+(calc?' readonly title="Campo calculado según el protocolo"':'')+(must&&!filled?' aria-label="'+esc(fieldList.find(f=>f[0]===key)?.[1]||key)+' pendiente"':'')+'></td>';
        }).join('')+'<td class="plan-row-action"><button type="button" class="plan-remove-row ui-row-delete" data-remove-row="'+ri+'" data-test-index="'+idx+'" '+(item.rows.length<=1?'disabled':'')+' title="'+(item.rows.length<=1?'Debe conservarse al menos una fila':'Eliminar fila '+(ri+1))+'" aria-label="Eliminar fila '+(ri+1)+'"><svg aria-hidden="true"><use href="#i-trash"/></svg></button></td></tr>';
      }).join('');
      let hint='';
      if(item.code==='POWER_FACTOR')hint='<div class="plan-reference-note"><b>Cálculo y aceptación:</b> capacitancia medida (nF) = capacitancia de fuente (F) × 10⁹. Estado CORRECTO cuando el FP corregido es menor que 1%; en caso contrario, OBSERVADO. Criterio del protocolo: cláusula 7.2.14 de IEEE Std C57.152-2013.</div><div class="plan-reference-note" data-auto-observation>'+esc(item.autoObservation||powerFactorObservation(item.rows))+'</div>';
      if(item.code==='INSULATION_RESISTANCE')hint='<div class="plan-reference-note"><b>Referencia técnica:</b> referencia IEEE C57.152-2013, cláusula 7.2.13. El libro no muestra un umbral numérico de aceptación para estas lecturas; registra el resultado tras aplicar el criterio aprobado.</div>';
      if(item.code==='TTR')hint='<div class="plan-reference-note"><b>Evaluación automática según protocolo:</b> relación teórica = AT / (BT × √3); error por fase = (medida − teórica) × 100 / medida. Resultado CORRECTO cuando los tres errores están dentro de ±0,5%.</div>';
      if(item.code==='BUSHING')hint='<div class="plan-reference-note"><b>Evaluación automática según protocolo:</b> variación absoluta de capacitancia = |medida − placa| / placa × 100. CONFORME cuando la variación es menor a 5%. el FP se evalúa por separado, porque el libro no fija un umbral numérico para ese factor.</div>';
      if(item.code==='WINDING_RESISTANCE')hint='<div class="plan-reference-note"><b>Referencia técnica:</b> el comparativo entre fases debe ser ≤5% (IEEE C57.152-2013, cláusula 7.2.7). El archivo no documenta con claridad la fórmula comparativa; por eso el resultado se registra manualmente y no se calcula con la columna auxiliar defectuosa del Excel.</div>';
      if(item.code==='ARRESTER')hint='<div class="plan-reference-note"><b>Referencia técnica:</b> comparar las mediciones con los valores de fábrica. Si no existen, usar esta ejecución como referencia histórica; no se fija un límite absoluto en este formulario.</div>';
      if(item.code==='SFRA')hint='<div class="plan-reference-note"><b>Referencia técnica:</b> la conclusión se obtiene comparando las gráficas de campo con las de planta. La evaluación es manual; el protocolo no define un umbral numérico.</div>';
      const generatedObservation=observationSummary(item);
      const knownAutoObservations=['Todos los valores conforme','Todos los valores conforme.','Se encontraron valores observados','Se encontraron valores observados.','Pendiente de completar o evaluar el ensayo.','El ensayo presenta resultados no concluyentes.','Pendiente de revisar los resultados del ensayo.'];
      if(!String(item.observations||'').trim()||knownAutoObservations.includes(String(item.observations).trim())){
        item.observations=generatedObservation;
        item._autoObservationText=generatedObservation;
      }else item._autoObservationText='';
      const previousCard=host.querySelector('.plan-test-card[data-test-index="'+idx+'"]');
      const hasPreviousState=!!previousCard;
      const shouldOpen=hasPreviousState?previousCard.open:true;
      return '<details class="plan-test-card" data-test-index="'+idx+'" data-state="'+metrics.state+'" '+(shouldOpen?'open':'')+'>'+
        '<summary class="plan-test-card-head"><span class="plan-test-index">'+String(idx+1).padStart(2,'0')+'</span><span class="plan-test-heading"><b>'+esc(item.name)+'</b><small data-card-progress>'+metrics.filled+'/'+metrics.total+' campos · '+metrics.percent+'%</small></span><span class="plan-card-state" data-state="'+metrics.state+'">'+(metrics.complete?'Completo':metrics.anyData?'En curso':'Pendiente')+'</span><span class="plan-card-chevron">⌄</span></summary>'+
        '<div class="plan-test-body">'+
        '<section class="plan-test-meta-card"><div class="plan-test-meta-card-head"><b>Equipo y referencia</b></div>'+
        '<div class="plan-test-meta-grid">'+
        '<label data-meta-wrap="equipment_name"><span>Equipo <i class="required-mark">*</i></span><input required aria-required="true" data-meta="equipment_name" value="'+esc(item.equipment_name)+'" placeholder="Instrumento"></label>'+
        '<label data-meta-wrap="equipment_brand"><span>Marca <i class="required-mark">*</i></span><input required aria-required="true" data-meta="equipment_brand" value="'+esc(item.equipment_brand)+'" placeholder="Marca"></label>'+
        '<label data-meta-wrap="equipment_model"><span>Modelo <i class="required-mark">*</i></span><input required aria-required="true" data-meta="equipment_model" value="'+esc(item.equipment_model)+'" placeholder="Modelo"></label>'+
        '<label data-meta-wrap="equipment_serial"><span>N.º de serie <i class="required-mark">*</i></span><input required aria-required="true" data-meta="equipment_serial" value="'+esc(item.equipment_serial)+'" placeholder="Serie"></label>'+(item.code==='EXCITATION'?'<label data-meta-wrap="core_type">Tipo de núcleo (opcional)<select data-meta="core_type"><option value="NO_ESPECIFICADO" '+(item.core_type==='NO_ESPECIFICADO'?'selected':'')+'>No especificado</option><option value="TRES_COLUMNAS" '+(item.core_type==='TRES_COLUMNAS'?'selected':'')+'>Tres columnas</option><option value="CINCO_COLUMNAS" '+(item.core_type==='CINCO_COLUMNAS'?'selected':'')+'>Cinco columnas</option><option value="ACORAZADO" '+(item.core_type==='ACORAZADO'?'selected':'')+'>Acorazado</option><option value="OTRO" '+(item.core_type==='OTRO'?'selected':'')+'>Otro</option></select></label>':'')+'</div></section>'+hint+
        '<div class="plan-table-toolbar"><div><b>Mediciones del ensayo</b><small><i class="required-mark">*</i> Campo requerido · Puedes pegar desde Excel.</small><small class="plan-row-summary" data-row-summary></small></div><button class="btn small secondary-action" type="button" data-add-row="'+idx+'">+ Fila</button></div>'+
        '<div class="measurement-sheet-wrap plan-grid-wrap"><table class="measurement-sheet plan-sheet"><thead>'+tableHead+'</thead><tbody>'+body+'</tbody></table></div>'+
        '<details class="plan-optional-details plan-observation-details"><summary><span>Observaciones del ensayo</span><small>Notas e incidencias</small></summary><label class="plan-test-observations"><textarea data-meta="observations" rows="2" placeholder="Resultados, incidencias y comentarios">'+esc(item.observations)+'</textarea></label></details>'+
        '<div class="plan-card-actions"><button type="button" class="text-action" data-remove-test="'+idx+'">Retirar este ensayo</button></div></div></details>';
    }).join('');
    host.querySelectorAll('.plan-observation-details').forEach(details=>{details.open=true;const summary=details.querySelector('summary');if(summary){summary.setAttribute('aria-disabled','true');summary.addEventListener('click',event=>event.preventDefault());summary.addEventListener('keydown',event=>event.preventDefault());}});
    refreshResultsSummary();
    items.forEach((item,index)=>{const card=host.querySelector('[data-test-index="'+index+'"]');if(card)refreshFieldStyles(card,item,itemMetrics(item));});
  }
  function render(){renderPicker();renderCards();renderPlanFeedback();renderPlanReview();}
  function clear(){
    if(autoSaveTimer)clearTimeout(autoSaveTimer);
    items=[];editingId=null;editingStatus='BORRADOR';sessionId=null;activeTestIndex=0;currentPlanStep='shared';savePending=false;editRevision=0;savedRevision=0;
    const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('#planDate').value=d.toISOString().slice(0,16);
    ['planOperator','planSupervisor','planOilTemp','planAmbientTemp','planHumidity','planObservations'].forEach(id=>$('#'+id).value='');
    $('#planTitle').textContent='Nuevo registro de pruebas';
    setSaveStatus('Preparación · todavía no se guarda','idle');
    render();
  }
  function start(code){
    if(bridge.canRunTests&&!bridge.canRunTests()){toast(bridge.testAccessReason?.()||'Primero guarda la Configuración eléctrica.',true);return;}
    clear();if(code){items.push(makeItem(code));activeTestIndex=0;}render();bridge.showPage('planPage');setPlanStep(code?'results':'shared');
    setSaveStatus('Preparación · todavía no se guarda','idle');
  }
  function toggle(code){
    const index=items.findIndex(x=>x.code===code);
    if(index>=0){
      if(items.length===1){toast('El plan debe conservar al menos una prueba.',true);return;}
      items.splice(index,1);
    }else {items.push(makeItem(code));activeTestIndex=items.length-1;}
    activeTestIndex=Math.max(0,Math.min(activeTestIndex,items.length-1));
    render();markPlanChanged(350);
  }
  async function flushPlanBeforeLeave(){
    if(autoSaveTimer)clearTimeout(autoSaveTimer);
    if(editingId===null){
      return editRevision===0||window.confirm('Esta preparación todavía no se ha iniciado y no está guardada. ¿Deseas salir y descartar los datos?');
    }
    for(let attempt=0;attempt<3&&hasUnsavedChanges()&&items.length;attempt++){
      if(autoSaveTimer)clearTimeout(autoSaveTimer);
      const saved=await savePlan(true);
      if(!saved)break;
    }
    if(hasUnsavedChanges()){
      return window.confirm('No se pudo confirmar el guardado de los últimos cambios. ¿Deseas salir de todas formas?');
    }
    return true;
  }
  async function leavePlan(){
    if(!await flushPlanBeforeLeave())return;
    bridge.showPage('testPage');
    await bridge.reloadTestHistory();
  }
    async function edit(id){
    if(bridge.canRunTests&&!bridge.canRunTests()){toast(bridge.testAccessReason?.()||'Primero guarda la Configuración eléctrica.',true);return;}
    if(bridge.demo()){toast('El historial no está disponible en modo demostración.',true);return;}
    try{
      const res=await fetch(api('action=test-get&key='+encodeURIComponent(transformer().key)+'&id='+id)),data=await json(res),x=data.item;
      clear();editingId=Number(x.id||id);editingStatus=String(x.status||'BORRADOR').toUpperCase()==='COMPLETADA'?'EN_PROCESO':String(x.status||'BORRADOR').toUpperCase();sessionId=x.plan?.session_id||null;
      $('#planDate').value=String(x.executed_at||'').replace(' ','T').slice(0,16);
      $('#planOperator').value=x.operator_name||'';$('#planSupervisor').value=x.supervisor_name||'';
      $('#planOilTemp').value=x.oil_temperature_c??'';$('#planAmbientTemp').value=x.ambient_temperature_c??'';
      $('#planHumidity').value=x.relative_humidity_percent??'';$('#planObservations').value=x.observations||'';
      if(Array.isArray(x.plan?.tests)&&x.plan.tests.length){
        const loaded=x.plan.tests.map(t=>makeItem(t.code,{...t,rows:rowsFromMeasurements(t.code,t.measurements||[])}));
        const grouped=new Map();
        loaded.forEach(incoming=>{
          const code=String(incoming.code||'').toUpperCase();
          if(!grouped.has(code)){grouped.set(code,incoming);return;}
          const existing=grouped.get(code);
          existing.rows.push(...incoming.rows);
          ['standard_reference','equipment_name','equipment_brand','equipment_model','equipment_serial'].forEach(key=>{if(!existing[key]&&incoming[key])existing[key]=incoming[key];});
          if(incoming.observations)existing.observations=[existing.observations,incoming.observations].filter(Boolean).join('\n');
        });
        items=Array.from(grouped.values());
        if(items.length<loaded.length)toast('Este registro tenía ensayos repetidos; sus mediciones se reunieron en un solo formulario por tipo de prueba.');
      }else if(x.test_code&&x.test_code!=='PLAN')items=[makeItem(x.test_code,{status:x.status,standard_reference:x.standard_reference,equipment_name:x.equipment_name,equipment_brand:x.equipment_brand,equipment_model:x.equipment_model,equipment_serial:x.equipment_serial,rows:rowsFromMeasurements(x.test_code,x.measurements||[])})];
      editRevision=0;savedRevision=0;
      activeTestIndex=0;render();$('#planTitle').textContent='Registro de pruebas #'+editingId;
      setSaveStatus(String(x.status||'').toUpperCase()==='COMPLETADA'?'Registro completado · al editarlo volverá a En proceso':'Cambios guardados · puedes continuar el registro','saved');
      bridge.showPage('planPage');setPlanStep(items.length?'results':'shared');
    }catch(e){toast(e.message,true);}
  }

  async function savePlan(automatic,confirmCompletion,startRequested){
    if(savePromise){savePending=true;return savePromise;}
    if(editingId===null&&!startRequested){
      setSaveStatus('Preparación · confirma la creación del registro para activar el autoguardado','idle');
      if(!automatic)toast('Primero confirma la creación del registro. La preparación todavía no se guarda.',true);
      return false;
    }
    if(confirmCompletion&&editingId===null){toast('Primero confirma la creación del registro.',true);return false;}
    const seenCodes=new Set();
    const duplicate=items.find(item=>{
      const code=String(item.code||'').trim().toUpperCase();
      if(seenCodes.has(code))return true;
      seenCodes.add(code);return false;
    });
    if(duplicate){
      const name=duplicate.name||duplicate.code;
      setSaveStatus('Hay un ensayo duplicado en el registro','warning');
      if(!automatic)toast('«'+name+'» ya está incluido en este registro. Cada ensayo solo puede agregarse una vez por jornada.',true);
      return false;
    }
    const date=$('#planDate').value;
    if(!date){
      setSaveStatus('Falta la fecha de realización para guardar','warning');
      if(!automatic)toast('Selecciona la fecha de realización.',true);
      return false;
    }
    const revisionAtStart=editRevision;
    const tests=items.map(item=>({
      id:item.id,code:item.code,name:item.name,
      status:itemMetrics(item).complete?'COMPLETADA':'BORRADOR',
      capacitance_unit:item.capacitance_unit||'nF',
      standard_reference:item.standard_reference,
      equipment_name:item.equipment_name,equipment_brand:item.equipment_brand,
      equipment_model:item.equipment_model,equipment_serial:item.equipment_serial,core_type:item.core_type||'NO_ESPECIFICADO',
      observations:item.observations,measurements:measurementsFromRows(item)
    }));
    const metrics=planMetrics();
    const complete=metrics.complete;
    if(confirmCompletion&&!complete){setSaveStatus('Hay datos pendientes por completar','warning');toast('Completa todos los ensayos antes de confirmar el registro.',true);return false;}
    const hasWork=items.some(item=>itemMetrics(item).anyData||!!(item.standard_reference||item.equipment_name||item.equipment_brand||item.equipment_model||item.equipment_serial||item.observations))||!!($('#planOperator').value.trim()||$('#planSupervisor').value.trim()||$('#planOilTemp').value||$('#planAmbientTemp').value||$('#planHumidity').value||$('#planObservations').value.trim());
    const targetStatus=confirmCompletion?'COMPLETADA':(startRequested?'EN_PROCESO':(editingId!==null?editingStatus:(hasWork?'EN_PROCESO':'BORRADOR')));
    if(['EN_PROCESO','COMPLETADA'].includes(targetStatus)){
      const missingGeneral=generalMissing();
      if(missingGeneral.length){
        const message='No se guardaron los cambios. Completa: '+missingGeneral.join(', ')+'.';
        setSaveStatus(message,'warning');
        if(!automatic)toast(message,true);
        return false;
      }
      if(!items.length){
        const message='No se puede mantener una jornada iniciada sin al menos un ensayo seleccionado.';
        setSaveStatus(message,'warning');
        if(!automatic)toast(message,true);
        return false;
      }
    }
    const payload={
      id:editingId,transformer_key:transformer().key,test_code:'PLAN',
      executed_at:date,status:targetStatus,
      operator_name:$('#planOperator').value,supervisor_name:$('#planSupervisor').value,
      oil_temperature_c:$('#planOilTemp').value,ambient_temperature_c:$('#planAmbientTemp').value,
      relative_humidity_percent:$('#planHumidity').value,observations:$('#planObservations').value,
      measurements:[],plan:{version:1,session_id:sessionId,tests}
    };
        setSaveStatus('Guardando cambios...','saving');
    const operation=(async()=>{
      try{
        if(bridge.demo())throw new Error('Selecciona un transformador real antes de guardar.');
        if(!bridge.testsReady())throw new Error('Prepara las tablas de pruebas eléctricas antes de guardar.');
        const response=await fetch(api('action=test-save'),{
          method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)
        });
        const data=await json(response);
        if(!data.result?.id)throw new Error('El servidor no confirmó el ID del registro guardado.');
        editingId=Number(data.result.id);
        editingStatus=String(payload.status||'BORRADOR').toUpperCase();
        savedRevision=revisionAtStart;
        $('#planTitle').textContent='Registro de pruebas #'+editingId;
        if(startRequested){setSaveStatus('Registro creado · autoguardado activo','saved');toast('Registro #'+editingId+' creado. El autoguardado está activo.');}
        else setSaveStatus(confirmCompletion?'Registro completado':(complete?'Todos los ensayos completos · confirma el registro':'Cambios guardados automáticamente'),'saved');
        if(confirmCompletion){toast('Registro de pruebas #'+editingId+' completado correctamente.');await bridge.reloadTestHistory();bridge.showPage('testPage');}
        else if(!automatic&&!startRequested){toast('Cambios guardados.');}
        return true;
      }catch(error){
        setSaveStatus('No se guardó: '+(error.message||'Revisa la conexión y vuelve a intentar.'),'error');
        if(!automatic)toast(error.message,true);
        return false;
      }
    })();
    savePromise=operation;
    let result=false;
    try{result=await operation;}
    finally{
      if(savePromise===operation)savePromise=null;
      if(savePending||hasUnsavedChanges()){
        savePending=false;
        if(autoSaveTimer)clearTimeout(autoSaveTimer);
        scheduleAutoSave(250);
      }
    }
    return result;
  }
  async function startPlan(){
    if(editingId!==null)return saveNow(false);
    if(!validatePlanStep('shared')||!validatePlanStep('selection'))return false;
    return savePlan(false,false,true);
  }
  async function saveNow(confirmCompletion){
    if(autoSaveTimer)clearTimeout(autoSaveTimer);
    return savePlan(false,!!confirmCompletion,false);
  }
  document.addEventListener('click',e=>{
    const target=e.target instanceof Element?e.target:null;if(!target)return;
    const planActive=!$('#planPage').classList.contains('hidden');
    const navBtn=target.closest('#openConfig,#backOverview,#openElectricalTests,#backFromTests');
    if(planActive&&navBtn){
      e.preventDefault();e.stopImmediatePropagation();
      flushPlanBeforeLeave().then(ok=>{if(ok)bridge.navigatePage(navBtn.id);});
      return;
    }
    const newBtn=target.closest('#newTestExecution'),pick=target.closest('[data-new-test]'),editBtn=target.closest('[data-open-execution]');
    if(!newBtn&&!pick&&!editBtn)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(editBtn)edit(Number(editBtn.dataset.openExecution));else if(pick)start(pick.dataset.newTest);else start(null);
  },true);
  $('#cancelPlan').addEventListener('click',leavePlan);
  $('#planPage').addEventListener('focusout',()=>{if(editingId!==null&&hasUnsavedChanges())scheduleAutoSave(250);});
  $('#planStepper').addEventListener('click',async e=>{
    const step=e.target.closest('[data-plan-step]');
    if(!step)return;
    const target=step.dataset.planStep;
    const targetIndex=planStepKeys.indexOf(target);
    const currentIndex=planStepKeys.indexOf(currentPlanStep);
    if(targetIndex>currentIndex&&targetIndex>=2&&editingId===null){
      // Valida todas las etapas anteriores antes de crear el registro.
      // Así no se genera un registro si se intenta saltar directamente a Revisión
      // con resultados todavía incompletos.
      for(let index=0;index<targetIndex;index++){
        if(!validatePlanStep(planStepKeys[index]))return;
      }
      if(!await ensureExecutionStarted())return;
    }
    setPlanStep(target);
  });
  $('#planStepBack').addEventListener('click',()=>movePlanStep(-1));
  $('#planStepNext').addEventListener('click',()=>{if($('#planStepNext').disabled)return;currentPlanStep==='review'?saveNow(true):movePlanStep(1);});
  $('#planTestPicker').addEventListener('change',e=>{
    const input=e.target.closest('input[type="checkbox"]');
    if(!input)return;
    changePickedTest(input.value,input.checked);
  });
  $('#planTestCards').addEventListener('click',e=>{
    const del=e.target.closest('[data-remove-test]');
    if(del){
      if(items.length===1){toast('El plan debe conservar al menos una prueba.',true);return;}
      const removedIndex=Number(del.dataset.removeTest);items.splice(removedIndex,1);activeTestIndex=Math.min(activeTestIndex,items.length-1);render();markPlanChanged(350);return;
    }
    const removeRow=e.target.closest('[data-remove-row]');
    if(removeRow){const index=Number(removeRow.dataset.testIndex),row=Number(removeRow.dataset.removeRow),item=items[index];if(!item)return;if(item.rows.length<=1){toast('El ensayo debe conservar al menos una fila.',true);return;}item.rows.splice(row,1);if(item.code==='POWER_FACTOR')item.autoObservation=powerFactorObservation(item.rows);renderCards();refreshPlanFeedback();markPlanChanged(350);return;}
    const add=e.target.closest('[data-add-row]');
    if(add){const item=items[Number(add.dataset.addRow)];if(item){if(item.code==='EXCITATION')item.rows.push({tap:'',test_voltage_kv:'',frequency_hz:String(transformer().frequency_hz||''),evaluation:'PENDIENTE'});else if(item.code==='WINDING_RESISTANCE')item.rows.push({status:'PENDIENTE'});else item.rows.push({});}renderCards();refreshPlanFeedback();markPlanChanged(350);}
  });
  $('#planTestCards').addEventListener('input',e=>{
    const card=e.target.closest('[data-test-index]');if(!card)return;const item=items[Number(card.dataset.testIndex)];if(!item)return;
    if(e.target.dataset.meta){if(e.target.dataset.meta==='status')return;item[e.target.dataset.meta]=e.target.value;if(item.code==='POWER_FACTOR'&&e.target.dataset.meta==='capacitance_unit')refreshPowerFactorLive(card,item);refreshCardStatus(card,item);refreshPlanFeedback();return;}
    if(!e.target.classList.contains('plan-cell'))return;
    const row=Number(e.target.dataset.row),key=e.target.dataset.col;item.rows[row]=item.rows[row]||{};item.rows[row][key]=e.target.value;
    const nr=normalize(item.code,item.rows[row]);
     if(item.code==='POWER_FACTOR'){
       item.rows[row]=nr;
       refreshPowerFactorLive(card,item);
     }
    if(item.code==='INSULATION_RESISTANCE'&&['reading_30s','reading_1min'].includes(key)){item.rows[row]=nr;const out=card.querySelector('[data-row="'+row+'"][data-col="absorption_index"]');if(out)out.value=nr.absorption_index;}
    if(item.code==='TTR'&&['at','bt','U','V','W'].includes(key)){item.rows[row]=nr;['theoretical','errU','errV','errW','status'].forEach(k=>{const out=card.querySelector('[data-row="'+row+'"][data-col="'+k+'"]');if(out)out.value=nr[k]||'';});}
    if(item.code==='BUSHING'&&['capacitance_plate_pf','capacitance_measured_pf'].includes(key)){item.rows[row]=nr;['variation_percent','status'].forEach(k=>{const out=card.querySelector('[data-row="'+row+'"][data-col="'+k+'"]');if(out)out.value=nr[k]||'';});}
    refreshObservationLive(card,item);
    refreshCardStatus(card,item);
    refreshPlanFeedback();
  });
  $('#planTestCards').addEventListener('change',e=>{
    const card=e.target.closest('[data-test-index]');if(!card)return;
    const item=items[Number(card.dataset.testIndex)];if(!item)return;
    if(e.target.dataset.meta||e.target.classList.contains('plan-cell')){if(item.code==='POWER_FACTOR')refreshPowerFactorLive(card,item);if(e.target.dataset.meta)item[e.target.dataset.meta]=e.target.value;else if(e.target.classList.contains('plan-cell')){const row=Number(e.target.dataset.row),key=e.target.dataset.col;item.rows[row]=item.rows[row]||{};item.rows[row][key]=e.target.value;}if(!e.target.dataset.meta&&item.code==='POWER_FACTOR'){item.autoObservation=powerFactorObservation(item.rows);const note=card.querySelector('[data-auto-observation]');if(note)note.textContent=item.autoObservation;}if(e.target.dataset.meta==='observations'){item._autoObservationText='';}else refreshObservationLive(card,item);refreshCardStatus(card,item);refreshPlanFeedback();markPlanChanged(350);}
  });
    $('#planPage').addEventListener('input',e=>{
    if(['planDate','planOperator','planSupervisor'].includes(e.target.id))refreshPlanFeedback();
    markPlanChanged();
  });
  $('#planPage').addEventListener('change',e=>{
    if(['planDate','planOperator','planSupervisor'].includes(e.target.id))refreshPlanFeedback();
  });
  // Navegación tipo hoja de cálculo en todas las tablas del plan.
  $('#planTestCards').addEventListener('keydown',e=>{
    const cell=e.target.closest('.plan-cell');if(!cell)return;
    const card=cell.closest('[data-test-index]');if(!card)return;
    const item=items[Number(card.dataset.testIndex)];if(!item)return;
    const fields=filteredColumns(item.code),row=Number(cell.dataset.row),col=fields.findIndex(([key])=>key===cell.dataset.col);
    if(col<0)return;
    let nextRow=row,nextCol=col,handled=true;
    if(e.key==='Enter'||e.key==='ArrowDown')nextRow++;
    else if(e.key==='ArrowUp')nextRow--;
    else if(e.key==='ArrowRight'){
      if(!cell.readOnly&&cell instanceof HTMLInputElement&&cell.selectionStart!==cell.value.length)return;
      nextCol++;
    }else if(e.key==='ArrowLeft'){
      if(!cell.readOnly&&cell instanceof HTMLInputElement&&cell.selectionStart!==0)return;
      nextCol--;
    }else if(e.key==='Tab')nextCol+=e.shiftKey?-1:1;
    else handled=false;
    if(!handled)return;
    e.preventDefault();
    if(nextCol>=fields.length){nextCol=0;nextRow++;}
    if(nextCol<0){nextCol=fields.length-1;nextRow=Math.max(0,nextRow-1);}
    nextRow=Math.max(0,nextRow);
    if(nextRow>=item.rows.length)return;
    renderCards();refreshPlanFeedback();
    const target=$('#planTestCards [data-test-index="'+Number(card.dataset.testIndex)+'"] [data-row="'+nextRow+'"][data-col="'+fields[nextCol][0]+'"]');
    target?.focus();
  });
  $('#planTestCards').addEventListener('paste',e=>{
    const cell=e.target.closest('.plan-cell');if(!cell||cell.readOnly)return;
    const text=(e.clipboardData||window.clipboardData).getData('text');if(!text.includes('\t')&&!text.includes('\n'))return;
    e.preventDefault();const card=cell.closest('[data-test-index]'),item=items[Number(card.dataset.testIndex)],fields=filteredColumns(item.code),r0=Number(cell.dataset.row),c0=fields.findIndex(c=>c[0]===cell.dataset.col);
    text.replace(/\r/g,'').split('\n').filter((v,i,a)=>!(i===a.length-1&&v==='')).forEach((line,ri)=>{while(item.rows.length<=r0+ri)item.rows.push({});line.split('\t').forEach((v,ci)=>{const f=fields[c0+ci];if(f&&!['absorption_index','theoretical','errU','errV','errW'].includes(f[0])&&!(item.code==='TTR'&&f[0]==='status')&&!(item.code==='BUSHING'&&['variation_percent','status'].includes(f[0])))item.rows[r0+ri][f[0]]=v.trim();});item.rows[r0+ri]=normalize(item.code,item.rows[r0+ri]);});
    renderCards();refreshPlanFeedback();markPlanChanged(350);toast('Bloque pegado desde Excel.');
  });
})();
