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
    ['CAPACITANCE','Capacitancia complementaria (fuera de LAP)','Ensayo adicional no incluido como bloque independiente en LAP']
  ];
  const templates={
    WINDING_RESISTANCE:{prefix:'WR',cols:[['section','Devanado (AT / BT)'],['tap','TAP'],['phase','Fase / conexión'],['test_current_a','I de prueba (A)'],['temperature_c','Temperatura medida (°C)'],['resistance_measured','Resistencia medida'],['resistance_referred_75c','Resistencia referida 75 °C'],['notes','Observación']]},
    INSULATION_RESISTANCE:{prefix:'IR',cols:[['point','Punto de aplicación'],['applied_voltage_kv','Voltaje aplicado (kV)'],['reading_15s','Resistencia a 15 s'],['reading_30s','Resistencia a 30 s'],['reading_45s','Resistencia a 45 s'],['reading_1min','Resistencia a 1 min'],['absorption_index','Índice de absorción (1 min / 30 s)'],['reading_unit','Unidad de resistencia'],['notes','Observación']]},
    POWER_FACTOR:{prefix:'PF',cols:[['measurement','Modo de medición'],['test_voltage','Tensión de prueba'],['power_factor_measured','FP medido'],['power_factor_corrected_20c','FP corregido a 20 °C'],['capacitance_measured','Capacitancia medida'],['notes','Observación']]},
    EXCITATION:{prefix:'EXC',cols:[['tap','TAP'],['phase','Fase'],['frequency_hz','Frecuencia (Hz)'],['excitation_current','Corriente de excitación'],['losses','Pérdidas'],['notes','Observación']]},
    BUSHING:{prefix:'BUSH',cols:[['terminal','Borne'],['serial','Serie'],['test_voltage','Tensión de prueba'],['power_factor_plate','FP de placa'],['power_factor_measured','FP medido'],['capacitance_plate','Capacitancia de placa'],['capacitance_measured','Capacitancia medida'],['variation_percent','Variación (%)'],['result','Resultado capacitancia'],['notes','Observación']]},
    SFRA:{prefix:'SFRA',cols:[['connection','Configuración'],['tap','TAP'],['file_reference','Archivo / curva de campo'],['reference_curve','Curva de referencia (fábrica)'],['comparison_result','Resultado de comparación'],['result','Evaluación manual'],['notes','Observación']]},
    ARRESTER:{prefix:'ARR',cols:[['section','Sección (AT / MT)'],['phase','Fase'],['output_voltage','V. salida'],['output_current','I. salida'],['test_mode','Modo de prueba (GST)'],['losses_measured','Pérdidas medidas'],['capacitance_measured','Capacitancia medida'],['notes','Observación']]},
    PROTECTIONS:{prefix:'PROT',cols:[['item','Ítem'],['accessory','Accesorio'],['terminals','Bornes'],['contact','Contacto'],['condition','Condición'],['setpoint','Ajuste'],['result','Resultado'],['notes','Observación']]},
    CAPACITANCE:{prefix:'CAP',cols:[['point','Punto / borne'],['connection','Conexión de prueba'],['test_voltage_kv','Tensión de prueba (kV)'],['capacitance_nf','Capacitancia (nF)'],['frequency_hz','Frecuencia (Hz)'],['temperature_c','Temperatura (°C)'],['result','Resultado'],['notes','Observación']]}
  };
  let items=[],editingId=null,sessionId=null,activeTestIndex=0,currentPlanStep='shared';
  let autoSaveTimer=null,savePromise=null,savePending=false,editRevision=0,savedRevision=0;
  function hasUnsavedChanges(){return editRevision>savedRevision;}
  function setSaveStatus(message,state){
    const node=$('#planSaveStatus');if(!node)return;
    node.dataset.state=state||'idle';
    const label=node.querySelector('span');if(label)label.textContent=message;
  }
  function scheduleAutoSave(delay){
    if(autoSaveTimer)clearTimeout(autoSaveTimer);
    if(!items.length){setSaveStatus('Selecciona una prueba para iniciar el guardado automático','idle');return;}
    if(!$('#planDate').value){setSaveStatus('Falta la fecha de visita para guardar','warning');return;}
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
  function columns(code){return code==='TTR'?[['tap','TAP'],['at','AT (kV)'],['bt','BT (kV)'],['theoretical','Relación teórica'],['U','Medida U-0 / w-u'],['errU','Error U (%)'],['V','Medida V-0 / u-v'],['errV','Error V (%)'],['W','Medida W-0 / v-w'],['errW','Error W (%)'],['result','Resultado'],['notes','Observación']]:(templates[code]?.cols||[]);}
  function number(v){const s=String(v??'').trim().replace(',','.');if(!s)return null;const n=Number(s);return Number.isFinite(n)?n:null;}
  function normalize(code,row){
    const r={...(row||{})};
    const aliases={
      POWER_FACTOR:{test_voltage:['test_voltage_v','test_voltage_kv'],capacitance_measured:['capacitance_nf','capacitance']},
      EXCITATION:{excitation_current:['current','output_current_a'],losses:['power','losses_w']},
      WINDING_RESISTANCE:{resistance_measured:['resistance_measured_ohm','resistance'],resistance_referred_75c:['resistance_referred_75c_ohm']},
      BUSHING:{test_voltage:['test_voltage_kv'],power_factor_measured:['power_factor'],capacitance_plate:['capacitance_plate_pf'],capacitance_measured:['capacitance_measured_pf','capacitance'],serial:['serial_number']},
      ARRESTER:{output_voltage:['output_voltage_kv','output_voltage_v'],output_current:['output_current_ma','output_current_a'],losses_measured:['losses_w','losses_measured_w'],capacitance_measured:['capacitance_pf','capacitance_measured_pf']}
    };
    Object.entries(aliases[code]||{}).forEach(([target,legacy])=>{if(!isFilled(r[target])){const value=legacy.map(key=>r[key]).find(isFilled);if(value!==undefined)r[target]=value;}});
    if(code==='INSULATION_RESISTANCE'){const a=number(r.reading_30s),b=number(r.reading_1min);r.absorption_index=a!==null&&a!==0&&b!==null?String(b/a):'';}
    if(code==='TTR'){
      const a=number(r.at),b=number(r.bt),theo=a!==null&&b!==null&&b!==0?a/(b*Math.sqrt(3)):number(r.theoretical);
      r.theoretical=theo===null?'':String(theo);
      const errors=['U','V','W'].map(k=>{const m=number(r[k]);const error=theo!==null&&m!==null&&m!==0?(m-theo)*100/m:null;r['err'+k]=error===null?'':String(error);return error;});
      r.result=errors.every(v=>v!==null)?(errors.every(v=>Math.abs(v)<=0.5)?'CORRECTO':'FUERA DE TOLERANCIA'):'PENDIENTE';
    }
    if(code==='BUSHING'){
      const plate=number(r.capacitance_plate),measured=number(r.capacitance_measured);
      const variation=plate!==null&&plate>0&&measured!==null?Math.abs(measured-plate)*100/plate:null;
      r.variation_percent=variation===null?'':String(variation);
      r.result=variation===null?'PENDIENTE':(variation<5?'CONFORME':'OBSERVADO');
    }
    return r;
  }
  function defaults(code){
    if(code==='TTR'){const t=transformer(),n=Math.max(5,Number(t.num_taps||0));return Array.from({length:Math.min(n,100)},(_,i)=>({tap:String(i+1)}));}
    if(code==='POWER_FACTOR')return ['CH+CHL','CH','CHL','CL+CLH','CL','CLH'].map(measurement=>({measurement}));
    if(code==='INSULATION_RESISTANCE')return ['AT-BT','AT-Masa','BT-Masa'].map(point=>({point}));
    if(code==='WINDING_RESISTANCE')return [{},{}];
    if(code==='EXCITATION'){const frequency=String(transformer().frequency_hz||'');return ['U-0','V-0','W-0'].map(phase=>({tap:'',phase,frequency_hz:frequency}));}
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
  function makeItem(code,old){old=old||{};return {id:old.id||null,code,name:typeName(code),status:old.status||'BORRADOR',standard_reference:old.standard_reference||'',equipment_name:old.equipment_name||'',equipment_brand:old.equipment_brand||'',equipment_model:old.equipment_model||'',equipment_serial:old.equipment_serial||'',observations:old.observations||'',rows:old.rows||defaults(code)};}
  const requiredByTest={
    TTR:['tap','at','bt','U','V','W','result'],
    POWER_FACTOR:['measurement','test_voltage','power_factor_measured','power_factor_corrected_20c'],
    EXCITATION:['tap','phase','frequency_hz','excitation_current','losses'],
    WINDING_RESISTANCE:['section','tap','phase','test_current_a','temperature_c','resistance_measured','resistance_referred_75c'],
    INSULATION_RESISTANCE:['point','applied_voltage_kv','reading_15s','reading_30s','reading_45s','reading_1min'],
    BUSHING:['terminal','serial','test_voltage','power_factor_plate','power_factor_measured','capacitance_plate','capacitance_measured','variation_percent'],
    SFRA:['connection','tap','comparison_result','result'],
    ARRESTER:['section','phase','output_voltage','output_current','test_mode','losses_measured','capacitance_measured'],
    PROTECTIONS:['accessory','terminals','contact','condition','result'],
    CAPACITANCE:['point','connection','test_voltage_kv','capacitance_nf']
  };
  const requiredEquipment=[];
  const equipmentLabels={equipment_name:'equipo',equipment_brand:'marca del equipo',equipment_model:'modelo',equipment_serial:'serie'};
  const generalLabels={date:'fecha de la prueba',operator:'responsable / técnico'};
  function isFilled(value){return value!==null&&value!==undefined&&String(value).trim()!=='';}
  function requiredValueFilled(key,value){
    if(['result','evaluation'].includes(key)&&String(value??'').trim().toUpperCase()==='PENDIENTE')return false;
    return isFilled(value);
  }
  function missingForRow(code,row){
    const required=requiredByTest[code]||columns(code).map(c=>c[0]).filter(k=>!['notes','absorption_index','theoretical','errU','errV','errW'].includes(k));
    const labels=Object.fromEntries(columns(code).map(c=>[c[0],c[1]]));
    const normalized=normalize(code,row);
    return required.filter(key=>!requiredValueFilled(key,normalized?.[key])).map(key=>labels[key]||key);
  }
  function itemMetrics(item){
    const rows=Array.isArray(item.rows)?item.rows:[];
    const metaMissing=requiredEquipment.filter(key=>!isFilled(item[key])).map(key=>equipmentLabels[key]);
    const required=requiredByTest[item.code]||columns(item.code).map(c=>c[0]).filter(k=>!['notes','absorption_index','theoretical','errU','errV','errW'].includes(k));
    let total=requiredEquipment.length,filled=requiredEquipment.length-metaMissing.length;
    const rowStates=rows.map((row,index)=>{
      const missing=missingForRow(item.code,row),rowFilled=required.length-missing.length;
      total+=required.length;filled+=rowFilled;
      const any=columns(item.code).some(([key])=>isFilled(row?.[key]));
      return {index,missing,filled:rowFilled,total:required.length,any,state:missing.length===0?'complete':(any?'partial':'empty')};
    });
    const missing=[...metaMissing];
    rowStates.forEach(row=>{if(row.missing.length)missing.push('Fila '+(row.index+1)+': '+row.missing.slice(0,5).join(', ')+(row.missing.length>5?'…':''));});
    if(!rows.length)missing.push('Agrega al menos una fila de medición');
    const complete=rows.length>0&&missing.length===0;
    const anyData=filled>0||rows.some(r=>columns(item.code).some(([key])=>isFilled(r?.[key])));
    const state=complete?'complete':(anyData?'partial':'empty');
    return {total,filled,percent:total?Math.round(filled/total*100):0,missing,metaMissing,rowStates,complete,anyData,state};
  }
  function generalMissing(){
    const missing=[];
    if(!isFilled($('#planDate').value))missing.push(generalLabels.date);
    if(!isFilled($('#planOperator').value))missing.push(generalLabels.operator);
    if(!isFilled($('#planSupervisor').value))missing.push(generalLabels.supervisor||'supervisor');
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
    general.forEach(x=>missing.push('Datos de visita: falta '+x));
    perItem.forEach(({item,metrics})=>{
      metrics.missing.slice(0,5).forEach(msg=>missing.push(item.name+': '+msg));
      if(metrics.missing.length>5)missing.push(item.name+': y '+(metrics.missing.length-5)+' pendientes más');
      item.status=metrics.complete?'COMPLETADA':'BORRADOR';
    });
    if(!items.length)missing.unshift('Selecciona por lo menos una prueba');
    return {general,perItem,total,filled,percent,ready,completed,missing,complete:!general.length&&items.length>0&&perItem.every(x=>x.metrics.complete)};
  }
  function refreshFieldStyles(card,item,metrics){
    card.querySelectorAll('.plan-cell').forEach(input=>{
      const row=Number(input.dataset.row),field=input.dataset.col,required=(requiredByTest[item.code]||[]).includes(field);
      const valid=requiredValueFilled(field,input.value);
      input.classList.toggle('is-filled',valid);
      input.classList.toggle('is-missing',required&&!valid&&metrics.rowStates[row]?.any);
      if(input.classList.contains('plan-result-select'))input.dataset.state=String(input.value||'PENDIENTE').toLowerCase();
      if(field==='result'){
        const state=String(input.value||'').trim().toUpperCase();
        input.classList.toggle('result-good',['CORRECTO','CONFORME'].includes(state));
        input.classList.toggle('result-bad',['OBSERVADO','FUERA DE TOLERANCIA'].includes(state));
        input.classList.toggle('result-pending',!state||state==='PENDIENTE');
      }
    });
    requiredEquipment.forEach(key=>{
      const input=card.querySelector('[data-meta="'+key+'"]');if(!input)return;
      input.classList.toggle('is-filled',isFilled(input.value));
      input.classList.toggle('is-missing',!isFilled(input.value));
      input.closest('label')?.classList.toggle('meta-complete',isFilled(input.value));
      input.closest('label')?.classList.toggle('meta-pending',!isFilled(input.value));
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
    Object.entries(states).forEach(([key,state])=>{
      const step=$('#planStepper [data-plan-step="'+key+'"]');
      if(!step)return;
      step.dataset.state=state;
      step.classList.toggle('active',key===currentPlanStep);
      if(key===currentPlanStep)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');
      const number=step.querySelector('.plan-step-number');
      if(number)number.dataset.state=state;
    });
  }
  function renderPlanFeedback(){
    const host=$('#planProgressPanel');if(!host)return;
    const m=planMetrics(),allReady=m.general.length===0&&m.perItem.length>0&&m.perItem.every(x=>x.metrics.complete);
    const headline=m.complete?'Información completa':(allReady?'Los formularios están listos':'Faltan datos por completar');
    const state=m.complete?'success':(allReady?'info':'warning'),messages=m.missing.slice(0,7);
    host.dataset.state=state;
    host.innerHTML='<div class="plan-progress-main"><div class="plan-progress-copy"><div class="plan-progress-heading"><span class="plan-alert-icon">'+(state==='success'?'✓':state==='warning'?'!':'i')+'</span><div><strong>'+headline+'</strong><small>'+(items.length?m.ready+' de '+items.length+' formularios con campos mínimos completos':'Selecciona las pruebas que vas a realizar')+'</small></div></div><div class="plan-progress-track"><span style="width:'+m.percent+'%"></span></div><small class="plan-progress-number">'+m.filled+' de '+m.total+' campos mínimos · '+m.percent+'%</small></div><div class="plan-progress-side"><b>'+m.percent+'%</b><span>avance</span></div></div>'+
      (messages.length?'<div class="plan-alert-details"><b>Datos pendientes por completar</b><ul>'+messages.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+(m.missing.length>messages.length?'<small>Y '+(m.missing.length-messages.length)+' pendientes más.</small>':'')+'</div>':'<div class="plan-alert-clear">✓ No hay campos obligatorios pendientes. Los datos están guardados.</div>')+
      '<div class="plan-color-legend"><span><i class="legend-filled"></i> Verde: dato registrado</span><span><i class="legend-missing"></i> Ámbar: falta completar</span><span><i class="legend-calculated"></i> Gris: cálculo automático</span></div>';
    ['planDate','planOperator','planSupervisor'].forEach(id=>{const field=$('#'+id);if(!field)return;const missing=!isFilled(field.value);field.classList.toggle('is-missing',missing);field.classList.remove('is-filled');field.closest('label')?.classList.toggle('meta-pending',missing);field.closest('label')?.classList.remove('meta-complete');});
    updatePlanStepper(m);
    renderPlanReview();
  }
  function refreshPlanFeedback(){
    items.forEach((item,index)=>{
      const card=$('#planTestCards [data-test-index="'+index+'"]');
      const metrics=itemMetrics(item);
      item.status=metrics.complete?'COMPLETADA':'BORRADOR';
      if(card)refreshFieldStyles(card,item,metrics);
    });
    renderPlanFeedback();
    renderPicker();
  }

    const planStepKeys=['shared','selection','results','review'];
  const planStepLabels={shared:'Datos generales',selection:'Selección de ensayos',results:'Mediciones',review:'Resumen'};
  function firstIncompleteTest(){
    return items.findIndex(item=>!itemMetrics(item).complete);
  }
  function setPlanStep(step){
    if(!planStepKeys.includes(step))return;
    if((step==='results'||step==='review')&&!items.length){toast('Añade al menos un ensayo antes de continuar.',true);step='selection';}
    // No se permite abandonar Resultados por ensayo hasta completar todos los
    // campos obligatorios de cada prueba seleccionada. El guardado automático
    // de borradores sigue habilitado para no perder avances.
    if(step==='review'&&currentPlanStep==='results'){
      const incomplete=firstIncompleteTest();
      if(incomplete>=0){
        const item=items[incomplete],metrics=itemMetrics(item);
        activeTestIndex=incomplete;
        renderCards();
        refreshPlanFeedback();
        const firstMissing=metrics.missing[0]||'Completa los campos obligatorios y sus mediciones.';
        toast('No puedes continuar todavía. Falta completar «'+item.name+'»: '+firstMissing+'.',true);
        return false;
      }
    }
    currentPlanStep=step;
    document.querySelectorAll('#planPage [data-plan-panel]').forEach(panel=>{panel.hidden=panel.dataset.planPanel!==step;});
    document.querySelectorAll('#planStepper [data-plan-step]').forEach(button=>{
      const active=button.dataset.planStep===step;
      button.classList.toggle('active',active);
      if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    });
    const index=planStepKeys.indexOf(step),back=$('#planStepBack'),next=$('#planStepNext'),hint=$('#planStepHint');
    if(back)back.disabled=index===0;
    if(next)next.textContent=step==='review'?'Guardar plan':'Continuar';
    if(hint)hint.textContent='Etapa '+(index+1)+' de 4 · '+planStepLabels[step];
    if(step==='review')renderPlanReview();
    return true;
  }
  function movePlanStep(offset){
    const current=planStepKeys.indexOf(currentPlanStep),next=Math.max(0,Math.min(planStepKeys.length-1,current+offset));
    if(next>=2&&!items.length){toast('Selecciona al menos un ensayo para continuar.',true);setPlanStep('selection');return;}
    setPlanStep(planStepKeys[next]);
  }
  function renderPlanReview(){
    const host=$('#planReviewSummary');if(!host)return;
    const m=planMetrics();
    const rows=items.map((item,index)=>{
      const metrics=itemMetrics(item),label=metrics.complete?'Completo':(metrics.anyData?'En curso':'Pendiente');
      return '<li><span class="plan-review-index">'+String(index+1).padStart(2,'0')+'</span><div><b>'+esc(item.name)+'</b><small>'+item.rows.length+' fila(s) · '+metrics.percent+'% de campos mínimos</small></div><strong data-state="'+metrics.state+'">'+label+'</strong></li>';
    }).join('');
    host.innerHTML='<div class="plan-review-metrics"><div><b>'+items.length+'</b><span>Ensayos</span></div><div><b>'+m.percent+'%</b><span>Avance general</span></div><div><b>'+m.missing.length+'</b><span>Pendientes</span></div></div><ul class="plan-review-list">'+rows+'</ul><p class="plan-review-note">'+(m.complete?'Los datos mínimos están completos. Puedes guardar el registro.':'Puedes guardar como borrador y continuar después. Los campos pendientes se conservan.')+'</p>'+(m.missing.length?'<details class="plan-review-pending"><summary>Ver datos pendientes</summary><ul>'+m.missing.slice(0,12).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>':'');
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
    const complete=items.filter(x=>itemMetrics(x).complete).length;
    const names=items.map(x=>x.name).join(' · ');
    $('#planSelectionStatus').textContent=items.length
      ?items.length+' ensayo(s) en el plan · '+complete+' completos'+(names?' — '+names:'')
      :'Aún no has añadido ensayos al plan.';
  }
  function changePickedTest(code,checked){
    const index=items.findIndex(item=>String(item.code).toUpperCase()===String(code).toUpperCase());
    if(checked&&index<0){
      items.push(makeItem(code));
      activeTestIndex=items.length-1;
    }else if(!checked&&index>=0){
      if(items.length===1){
        toast('El plan debe conservar al menos un ensayo. Añade otro antes de quitar este.',true);
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
    if(!items.length){host.innerHTML='<div class="empty-state">Selecciona pruebas para que aparezcan aquí sus formularios.</div>';$('#planTestNav').innerHTML='';return;}
    activeTestIndex=Math.max(0,Math.min(activeTestIndex,items.length-1));
    host.innerHTML=items.map((item,idx)=>{
      const fieldList=columns(item.code),required=requiredByTest[item.code]||[],metrics=itemMetrics(item);
      const head='<tr>'+fieldList.map(f=>'<th>'+esc(f[1])+(required.includes(f[0])?'<i class="required-mark" title="Campo requerido">*</i>':'')+'</th>').join('')+'</tr>';
      const body=item.rows.map((raw,ri)=>{
        const row=normalize(item.code,raw),rowMetrics=metrics.rowStates[ri]||{any:false,state:'empty'};
        return '<tr data-row-state="'+rowMetrics.state+'">'+fieldList.map(([key])=>{
          const calc=['absorption_index','theoretical','errU','errV','errW'].includes(key)||(item.code==='TTR'&&key==='result')||(item.code==='BUSHING'&&['variation_percent','result'].includes(key)),must=required.includes(key),value=row[key]??'';
          const filled=requiredValueFilled(key,value),missing=must&&!filled&&rowMetrics.any;
          if(['result','evaluation'].includes(key)&&!calc){
            const options=['PENDIENTE','CONFORME','OBSERVADO','NO APLICA'],current=String(value||'PENDIENTE').toUpperCase();
            const extra=options.includes(current)?'':'<option value="'+esc(value)+'" selected>'+esc(value)+'</option>';
            return '<td><select class="plan-cell plan-result-select '+(filled?'is-filled':'is-missing')+'" data-row="'+ri+'" data-col="'+key+'" data-state="'+(filled?current.toLowerCase():'pending')+'" '+(must?'data-required="1"':'')+'>'+extra+options.map(option=>'<option value="'+option+'" '+(current===option?'selected':'')+'>'+option+'</option>').join('')+'</select></td>';
          }
          return '<td><input class="plan-cell '+(calc?'calculated':'')+(filled?' is-filled':'')+(missing?' is-missing':'')+'" data-row="'+ri+'" data-col="'+key+'" value="'+esc(value)+'" '+(must?'data-required="1"':'')+(calc?' readonly title="Campo calculado según el protocolo"':'')+(must&&!filled?' aria-label="'+esc(fieldList.find(f=>f[0]===key)?.[1]||key)+' pendiente"':'')+'></td>';
        }).join('')+'</tr>';
      }).join('');
      let hint='';
      if(item.code==='POWER_FACTOR')hint='<div class="plan-reference-note"><b>Referencia técnica:</b> seis modos CH+CHL, CH, CHL, CL+CLH, CL y CLH. El archivo registra FP medido y corregido a 20 °C, pero no fija un límite numérico de aceptación; el resultado se evalúa según el criterio técnico aplicable.</div>';
      if(item.code==='INSULATION_RESISTANCE')hint='<div class="plan-reference-note"><b>Referencia técnica:</b> referencia IEEE C57.152-2013, cláusula 7.2.13. El libro no muestra un umbral numérico de aceptación para estas lecturas; registra el resultado tras aplicar el criterio aprobado.</div>';
      if(item.code==='TTR')hint='<div class="plan-reference-note"><b>Evaluación automática según protocolo:</b> relación teórica = AT / (BT × √3); error por fase = (medida − teórica) × 100 / medida. Resultado CORRECTO cuando los tres errores están dentro de ±0,5%.</div>';
      if(item.code==='BUSHING')hint='<div class="plan-reference-note"><b>Evaluación automática según protocolo:</b> variación absoluta de capacitancia = |medida − placa| / placa × 100. CONFORME cuando la variación es menor a 5%. el FP se evalúa por separado, porque el libro no fija un umbral numérico para ese factor.</div>';
      if(item.code==='WINDING_RESISTANCE')hint='<div class="plan-reference-note"><b>Referencia técnica:</b> el comparativo entre fases debe ser ≤5% (IEEE C57.152-2013, cláusula 7.2.7). El archivo no documenta con claridad la fórmula comparativa; por eso el resultado se registra manualmente y no se calcula con la columna auxiliar defectuosa del Excel.</div>';
      if(item.code==='ARRESTER')hint='<div class="plan-reference-note"><b>Referencia técnica:</b> comparar las mediciones con los valores de fábrica. Si no existen, usar esta ejecución como referencia histórica; no se fija un límite absoluto en este formulario.</div>';
      if(item.code==='SFRA')hint='<div class="plan-reference-note"><b>Referencia técnica:</b> la conclusión se obtiene comparando las gráficas de campo con las de planta. La evaluación es manual; el protocolo no define un umbral numérico.</div>';
      const openIndexes=[...host.querySelectorAll('.plan-test-card[open]')].map(node=>Number(node.dataset.testIndex));
      const shouldOpen=openIndexes.length?openIndexes.includes(idx):idx===0;
      return '<details class="plan-test-card" data-test-index="'+idx+'" data-state="'+metrics.state+'" '+(shouldOpen?'open':'')+'>'+
        '<summary class="plan-test-card-head"><span class="plan-test-index">'+String(idx+1).padStart(2,'0')+'</span><span class="plan-test-heading"><b>'+esc(item.name)+'</b><small data-card-progress>'+metrics.filled+'/'+metrics.total+' campos · '+metrics.percent+'%</small></span><span class="plan-card-state" data-state="'+metrics.state+'">'+(metrics.complete?'Completo':metrics.anyData?'En curso':'Pendiente')+'</span><span class="plan-card-chevron">⌄</span></summary>'+
        '<div class="plan-test-body">'+
        '<details class="plan-optional-details plan-test-meta-details"><summary><span>Equipo y referencia</span><small>Instrumento, marca, modelo, serie y norma</small></summary>'+
        '<div class="plan-test-meta-grid"><label>Norma / referencia<input data-meta="standard_reference" value="'+esc(item.standard_reference)+'" placeholder="Norma o protocolo"></label>'+
        '<label data-meta-wrap="equipment_name">Equipo<input data-meta="equipment_name" value="'+esc(item.equipment_name)+'" placeholder="Instrumento"></label>'+
        '<label data-meta-wrap="equipment_brand">Marca<input data-meta="equipment_brand" value="'+esc(item.equipment_brand)+'" placeholder="Marca"></label>'+
        '<label data-meta-wrap="equipment_model">Modelo<input data-meta="equipment_model" value="'+esc(item.equipment_model)+'" placeholder="Modelo"></label>'+
        '<label data-meta-wrap="equipment_serial">N.º de serie<input data-meta="equipment_serial" value="'+esc(item.equipment_serial)+'" placeholder="Serie"></label></div></details>'+hint+
        '<div class="plan-table-toolbar"><div><b>Mediciones del ensayo</b><small><i class="required-mark">*</i> Campo requerido · Puedes pegar desde Excel.</small><small class="plan-row-summary" data-row-summary></small></div><button class="btn small secondary-action" type="button" data-add-row="'+idx+'">+ Fila</button></div>'+
        '<div class="measurement-sheet-wrap plan-grid-wrap"><table class="measurement-sheet plan-sheet"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>'+
        '<details class="plan-optional-details plan-observation-details"><summary><span>Observaciones del ensayo</span><small>Notas e incidencias</small></summary><label class="plan-test-observations"><textarea data-meta="observations" rows="2" placeholder="Resultados, incidencias y comentarios">'+esc(item.observations)+'</textarea></label></details>'+
        '<div class="plan-card-actions"><button type="button" class="text-action" data-remove-test="'+idx+'">Retirar este ensayo</button></div></div></details>';
    }).join('');
    host.querySelectorAll('[data-test-index]').forEach(card=>{
      const active=Number(card.dataset.testIndex)===activeTestIndex;
      card.hidden=!active;
      if(active)card.open=true;
    });
    const accordion=$('#planResultsAccordion'),meta=$('#planResultsAccordionMeta'),statusNode=$('#planResultsAccordionStatus');
    const states=items.map(item=>itemMetrics(item));
    const complete=states.filter(metric=>metric.complete).length;
    const incomplete=states.filter(metric=>metric.anyData&&!metric.complete).length;
    const unstarted=states.length-complete-incomplete;
    if(meta)meta.textContent=items.length+' '+(items.length===1?'ensayo seleccionado':'ensayos seleccionados')+' · '+complete+' completos · '+(incomplete+unstarted)+' por completar';
    if(statusNode){statusNode.textContent=incomplete+unstarted===0?'Todos completos':(incomplete+unstarted)+' pendientes';statusNode.dataset.state=incomplete?'incomplete':(unstarted?'unstarted':'complete');}
    if(accordion&&accordion.dataset.userToggled!=='1')accordion.open=(incomplete+unstarted)>0;
    renderTestNav();
    items.forEach((item,index)=>{const card=host.querySelector('[data-test-index="'+index+'"]');if(card)refreshFieldStyles(card,item,itemMetrics(item));});
  }
  function render(){renderPicker();renderCards();renderPlanFeedback();renderPlanReview();}
  function clear(){
    if(autoSaveTimer)clearTimeout(autoSaveTimer);
    items=[];editingId=null;sessionId=null;activeTestIndex=0;currentPlanStep='shared';savePending=false;editRevision=0;savedRevision=0;const resultsAccordion=$('#planResultsAccordion');if(resultsAccordion){resultsAccordion.dataset.userToggled='0';resultsAccordion.open=true;}
    const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('#planDate').value=d.toISOString().slice(0,16);
    ['planOperator','planSupervisor','planOilTemp','planAmbientTemp','planHumidity','planObservations'].forEach(id=>$('#'+id).value='');
    $('#planTitle').textContent='Nuevo registro de pruebas';
    $('#saveTestPlan').innerHTML='<svg><use href="#i-check"/></svg>Guardar ahora';
    setSaveStatus('Se guardará automáticamente al modificar datos','idle');
    render();
  }
  function start(code){
    if(bridge.canRunTests&&!bridge.canRunTests()){toast(bridge.testAccessReason?.()||'Primero guarda la Configuración eléctrica.',true);return;}
    clear();if(code){items.push(makeItem(code));activeTestIndex=0;}render();bridge.showPage('planPage');setPlanStep(code?'results':'shared');
    if(code)markPlanChanged(350);
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
      clear();editingId=Number(x.id||id);sessionId=x.plan?.session_id||null;
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
      $('#saveTestPlan').innerHTML='<svg><use href="#i-check"/></svg>Guardar ahora';
      setSaveStatus('Datos guardados · puedes continuar completando el plan','saved');
      bridge.showPage('planPage');setPlanStep('results');
    }catch(e){toast(e.message,true);}
  }

  async function savePlan(automatic){
    if(savePromise){savePending=true;return savePromise;}
    const seenCodes=new Set();
    const duplicate=items.find(item=>{
      const code=String(item.code||'').trim().toUpperCase();
      if(seenCodes.has(code))return true;
      seenCodes.add(code);return false;
    });
    if(duplicate){
      const name=duplicate.name||duplicate.code;
      setSaveStatus('Hay un ensayo duplicado en el plan','warning');
      if(!automatic)toast('«'+name+'» ya está incluido. Cada tipo de prueba solo puede agregarse una vez por visita.',true);
      return false;
    }
    const date=$('#planDate').value;
    if(!items.length){
      setSaveStatus('Selecciona al menos una prueba para guardar','warning');
      if(!automatic)toast('Añade al menos una prueba al plan.',true);
      return false;
    }
    if(!date){
      setSaveStatus('Falta la fecha de visita para guardar','warning');
      if(!automatic)toast('Selecciona la fecha de visita.',true);
      return false;
    }
    const revisionAtStart=editRevision;
    const tests=items.map(item=>({
      id:item.id,code:item.code,name:item.name,
      status:itemMetrics(item).complete?'COMPLETADA':'BORRADOR',
      standard_reference:item.standard_reference,
      equipment_name:item.equipment_name,equipment_brand:item.equipment_brand,
      equipment_model:item.equipment_model,equipment_serial:item.equipment_serial,
      observations:item.observations,measurements:measurementsFromRows(item)
    }));
    const complete=generalMissing().length===0&&items.every(item=>itemMetrics(item).complete);
    const payload={
      id:editingId,transformer_key:transformer().key,test_code:'PLAN',
      executed_at:date,status:complete?'COMPLETADA':'BORRADOR',
      operator_name:$('#planOperator').value,supervisor_name:$('#planSupervisor').value,
      oil_temperature_c:$('#planOilTemp').value,ambient_temperature_c:$('#planAmbientTemp').value,
      relative_humidity_percent:$('#planHumidity').value,observations:$('#planObservations').value,
      measurements:[],plan:{version:1,session_id:sessionId,tests}
    };
    const btn=$('#saveTestPlan');
    if(btn){btn.disabled=true;btn.innerHTML='<svg><use href="#i-check"/></svg>Guardando...';}
    setSaveStatus('Guardando cambios...','saving');
    const operation=(async()=>{
      try{
        if(bridge.demo())throw new Error('Selecciona un transformador real antes de guardar.');
        if(!bridge.testsReady())throw new Error('Prepara las tablas de pruebas eléctricas antes de guardar.');
        const response=await fetch(api('action=test-save'),{
          method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)
        });
        const data=await json(response);
        if(!data.result?.id)throw new Error('El servidor no confirmó el ID del plan guardado.');
        editingId=Number(data.result.id);
        savedRevision=revisionAtStart;
        $('#planTitle').textContent='Plan de pruebas #'+editingId;
        const pending=planMetrics().missing.length;
        setSaveStatus(
          pending?'Guardado automáticamente · faltan '+pending+' datos por completar':'Todos los datos están guardados',
          'saved'
        );
        if(!automatic){
          toast(pending
            ?'Cambios guardados. Quedan '+pending+' datos pendientes; puedes continuar después.'
            :'Todos los datos del plan están guardados.');
        }
        return true;
      }catch(error){
        setSaveStatus('No se pudo guardar · revisa la conexión y vuelve a intentar','error');
        if(!automatic)toast(error.message,true);
        return false;
      }finally{
        if(btn){btn.disabled=false;btn.innerHTML='<svg><use href="#i-check"/></svg>Guardar ahora';}
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
  async function saveNow(){
    if(autoSaveTimer)clearTimeout(autoSaveTimer);
    return savePlan(false);
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
  $('#saveTestPlan').addEventListener('click',saveNow);
  $('#planStepper').addEventListener('click',e=>{
    const step=e.target.closest('[data-plan-step]');
    if(step)setPlanStep(step.dataset.planStep);
  });
  $('#planStepBack').addEventListener('click',()=>movePlanStep(-1));
  $('#planStepNext').addEventListener('click',()=>currentPlanStep==='review'?saveNow():movePlanStep(1));
  $('#planResultsAccordion summary').addEventListener('click',()=>{$('#planResultsAccordion').dataset.userToggled='1';});
  $('#planTestNav').addEventListener('click',e=>{
    const tab=e.target.closest('[data-plan-test-index]');
    if(!tab)return;
    activeTestIndex=Number(tab.dataset.planTestIndex);
    renderCards();refreshPlanFeedback();
  });
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
    const add=e.target.closest('[data-add-row]');
    if(add){items[Number(add.dataset.addRow)]?.rows.push({});renderCards();refreshPlanFeedback();markPlanChanged(350);}
  });
  $('#planTestCards').addEventListener('input',e=>{
    const card=e.target.closest('[data-test-index]');if(!card)return;const item=items[Number(card.dataset.testIndex)];if(!item)return;
    if(e.target.dataset.meta){if(e.target.dataset.meta==='status')return;item[e.target.dataset.meta]=e.target.value;refreshPlanFeedback();return;}
    if(!e.target.classList.contains('plan-cell'))return;
    const row=Number(e.target.dataset.row),key=e.target.dataset.col;item.rows[row]=item.rows[row]||{};item.rows[row][key]=e.target.value;
    const nr=normalize(item.code,item.rows[row]);
    if(item.code==='INSULATION_RESISTANCE'&&['reading_30s','reading_1min'].includes(key)){item.rows[row]=nr;const out=card.querySelector('[data-row="'+row+'"][data-col="absorption_index"]');if(out)out.value=nr.absorption_index;}
    if(item.code==='TTR'&&['at','bt','U','V','W'].includes(key)){item.rows[row]=nr;['theoretical','errU','errV','errW','result'].forEach(k=>{const out=card.querySelector('[data-row="'+row+'"][data-col="'+k+'"]');if(out)out.value=nr[k]||'';});}
    if(item.code==='BUSHING'&&['capacitance_plate_pf','capacitance_measured_pf'].includes(key)){item.rows[row]=nr;['variation_percent','result'].forEach(k=>{const out=card.querySelector('[data-row="'+row+'"][data-col="'+k+'"]');if(out)out.value=nr[k]||'';});}
    refreshPlanFeedback();
  });
    $('#planPage').addEventListener('input',e=>{
    if(['planDate','planOperator','planSupervisor'].includes(e.target.id))refreshPlanFeedback();
    markPlanChanged();
  });
  $('#planTestCards').addEventListener('paste',e=>{
    const cell=e.target.closest('.plan-cell');if(!cell||cell.readOnly)return;
    const text=(e.clipboardData||window.clipboardData).getData('text');if(!text.includes('\t')&&!text.includes('\n'))return;
    e.preventDefault();const card=cell.closest('[data-test-index]'),item=items[Number(card.dataset.testIndex)],fields=columns(item.code),r0=Number(cell.dataset.row),c0=fields.findIndex(c=>c[0]===cell.dataset.col);
    text.replace(/\r/g,'').split('\n').filter((v,i,a)=>!(i===a.length-1&&v==='')).forEach((line,ri)=>{while(item.rows.length<=r0+ri)item.rows.push({});line.split('\t').forEach((v,ci)=>{const f=fields[c0+ci];if(f&&!['absorption_index','theoretical','errU','errV','errW'].includes(f[0])&&!(item.code==='TTR'&&f[0]==='result')&&!(item.code==='BUSHING'&&['variation_percent','result'].includes(f[0])))item.rows[r0+ri][f[0]]=v.trim();});item.rows[r0+ri]=normalize(item.code,item.rows[r0+ri]);});
    renderCards();refreshPlanFeedback();markPlanChanged(350);toast('Bloque pegado desde Excel.');
  });
})();
