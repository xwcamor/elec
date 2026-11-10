(() => {
  const bridge=window.ELEC_PLAN_BRIDGE;if(!bridge)return;
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const catalog=[
    ['TTR','Relación de transformación','TAP, relación teórica y error por fase'],
    ['POWER_FACTOR','Factor de potencia y capacitancia','Seis modos LAP, FP medido/corregido y capacitancia'],
    ['EXCITATION','Corriente de excitación','Tensión, corriente, fase, pérdidas y reactancia'],
    ['WINDING_RESISTANCE','Resistencia de devanados','AT/BT, corriente DC y resistencia referida a 75 °C'],
    ['INSULATION_RESISTANCE','Resistencia de aislamiento','Tres configuraciones y lecturas por tiempo'],
    ['BUSHING','FP y capacitancia de bushings','Placa y medición individual por borne'],
    ['SFRA','SFRA','Tres configuraciones y comparación de curvas'],
    ['ARRESTER','Pararrayos AT / MT','Tensión, corriente, pérdidas y capacitancia'],
    ['PROTECTIONS','Protecciones propias','Accesorios, contactos y verificación'],
    ['CAPACITANCE','Capacitancia complementaria','Puntos y conexiones adicionales']
  ];
  const templates={
    WINDING_RESISTANCE:{prefix:'WR',cols:[['section','Devanado (AT / BT)'],['tap','TAP'],['phase','Fase / conexión'],['test_current_a','I de prueba (A)'],['dc_current_a','I DC medida (A)'],['dc_voltage_v','V DC (V)'],['time_s','Tiempo (s)'],['resistance_measured_ohm','Resistencia medida (Ω)'],['resistance_referred_75c_ohm','Resistencia referida 75 °C (Ω)'],['deviation_percent','Desviación (%)'],['fluctuation_percent','Fluctuación (%)'],['slope_a_s','Pendiente (A/s)'],['temperature_c','Temperatura (°C)'],['notes','Observación']]},
    INSULATION_RESISTANCE:{prefix:'IR',cols:[['point','Configuración / punto'],['applied_voltage_kv','Voltaje aplicado (kV)'],['reading_15s','R a 15 s'],['reading_30s','R a 30 s'],['reading_45s','R a 45 s'],['reading_1min','R a 1 min'],['absorption_index','Índice de absorción'],['reading_unit','Unidad de resistencia'],['notes','Observación']]},
    POWER_FACTOR:{prefix:'PF',cols:[['measurement','Modo de medición'],['test_mode','Modo del equipo (GST / GSTg-A / UST-A)'],['sweep','Barrido'],['test_voltage_v','Tensión de prueba (V)'],['frequency_hz','Frecuencia (Hz)'],['output_voltage_v','V de salida (V)'],['output_current_a','I de salida (A)'],['power_loss_w','Pérdidas (W)'],['power_factor_measured','FP medido (%)'],['power_factor_corrected_20c','FP corregido a 20 °C (%)'],['capacitance_nf','Capacitancia (nF)'],['evaluation','Evaluación'],['notes','Observación']]},
    EXCITATION:{prefix:'EXC',cols:[['tap','TAP'],['phase','Fase'],['test_voltage_kv','Tensión de prueba (kV)'],['frequency_hz','Frecuencia (Hz)'],['output_voltage_v','V de salida (V)'],['output_current_a','I de salida (A)'],['current_phase_deg','Ángulo de corriente (°)'],['losses_w','Pérdidas (W)'],['reactance_ohm','Reactancia (Ω)'],['notes','Observación']]},
    BUSHING:{prefix:'BUSH',cols:[['terminal','Borne'],['serial','Serie'],['test_voltage_kv','Tensión de prueba (kV)'],['power_factor_plate','FP de placa (%)'],['power_factor_measured','FP medido (%)'],['capacitance_plate_pf','Capacitancia de placa (pF)'],['capacitance_measured_pf','Capacitancia medida (pF)'],['variation_percent','Variación (%)'],['notes','Observación']]},
    SFRA:{prefix:'SFRA',cols:[['connection','Configuración'],['tap','TAP'],['file_reference','Archivo / curva de campo'],['reference_curve','Curva de referencia (fábrica)'],['comparison_result','Resultado de comparación'],['notes','Observación']]},
    ARRESTER:{prefix:'ARR',cols:[['section','Sección (AT / MT)'],['phase','Fase'],['output_voltage_kv','V de salida (kV)'],['output_current_ma','I de salida (mA)'],['test_mode','Modo de prueba'],['losses_w','Pérdidas medidas (W)'],['capacitance_pf','Capacitancia medida (pF)'],['notes','Observación']]},
    PROTECTIONS:{prefix:'PROT',cols:[['item','Ítem'],['accessory','Accesorio'],['terminals','Bornes'],['contact','Contacto'],['condition','Condición'],['setpoint','Ajuste'],['result','Resultado'],['notes','Observación']]},
    CAPACITANCE:{prefix:'CAP',cols:[['point','Punto / borne'],['connection','Conexión de prueba'],['test_voltage_kv','Tensión de prueba (kV)'],['capacitance_nf','Capacitancia (nF)'],['frequency_hz','Frecuencia (Hz)'],['temperature_c','Temperatura (°C)'],['notes','Observación']]}
  };
  let items=[],editingId=null,sessionId=null;
  function typeName(code){return (catalog.find(x=>x[0]===code)||[])[1]||code;}
  function api(q){return bridge.api(q);}
  async function json(response){return bridge.readApiResponse(response);}
  function toast(message,bad){bridge.notify(message,!!bad);}
  function transformer(){return bridge.getTransformer();}
  function columns(code){return code==='TTR'?[['tap','TAP'],['at','AT (kV)'],['bt','BT (kV)'],['theoretical','Relación teórica'],['U','Medida U-0 / w-u'],['errU','Error U (%)'],['V','Medida V-0 / u-v'],['errV','Error V (%)'],['W','Medida W-0 / v-w'],['errW','Error W (%)'],['result','Resultado'],['notes','Observación']]:(templates[code]?.cols||[]);}
  function number(v){const s=String(v??'').trim().replace(',','.');if(!s)return null;const n=Number(s);return Number.isFinite(n)?n:null;}
  function normalize(code,row){
    const r={...(row||{})};
    if(code==='INSULATION_RESISTANCE'){const a=number(r.reading_30s),b=number(r.reading_1min);r.absorption_index=a!==null&&a!==0&&b!==null?String(b/a):'';}
    if(code==='TTR'){const a=number(r.at),b=number(r.bt),theo=a!==null&&b!==null&&b!==0?a/(b*Math.sqrt(3)):number(r.theoretical);r.theoretical=theo===null?'':String(theo);['U','V','W'].forEach(k=>{const m=number(r[k]);r['err'+k]=theo!==null&&m!==null&&m!==0?String((m-theo)*100/m):'';});}
    return r;
  }
  function defaults(code){
    if(code==='TTR'){const t=transformer(),n=Math.max(5,Number(t.num_taps||0));return Array.from({length:Math.min(n,100)},(_,i)=>({tap:String(i+1)}));}
    if(code==='POWER_FACTOR')return [{measurement:'CH+CHL',test_voltage_v:'10000'},{measurement:'CH',test_voltage_v:'10000'},{measurement:'CHL',test_voltage_v:'10000'},{measurement:'CL+CLH',test_voltage_v:'5000'},{measurement:'CL',test_voltage_v:'5000'},{measurement:'CLH',test_voltage_v:'5000'}];
    if(code==='INSULATION_RESISTANCE')return ['AT-BT','AT-Masa','BT-Masa'].map(point=>({point}));
    if(code==='WINDING_RESISTANCE')return [{section:'AT',phase:'U-0',test_current_a:'5'},{section:'AT',phase:'V-0',test_current_a:'5'},{section:'AT',phase:'W-0',test_current_a:'5'},{section:'BT',phase:'u-v',test_current_a:'16'},{section:'BT',phase:'v-w',test_current_a:'16'},{section:'BT',phase:'w-u',test_current_a:'16'}];
    if(code==='EXCITATION')return [1,14,27].flatMap(tap=>['U-0','V-0','W-0'].map(phase=>({tap:String(tap),phase})));
    if(code==='BUSHING'){
      const config=bridge.getElectricalConfig();
      const terminals=(config?.windings||[]).flatMap(w=>w.terminals||[]).filter(t=>t.has_capacitive_bushing).map(t=>({terminal:t.code||'',serial:t.bushing?.serial_number||''}));
      return terminals.length?terminals:['1U','1V','1W','1N'].map(terminal=>({terminal}));
    }
    if(code==='SFRA')return [{connection:'AT vs BT (abierto)',tap:'1'},{connection:'BT vs AT (abierto)',tap:'1'},{connection:'AT vs BT (cortocircuito)',tap:'1'}];
    if(code==='ARRESTER')return [...['1U','1V','1W'].map(phase=>({section:'AT',phase,test_mode:'GST'})),...['2U','2V','2W','2N'].map(phase=>({section:'MT',phase,test_mode:'GST'}))];
    if(code==='PROTECTIONS')return [
      {item:'1',accessory:'RELÉ BUCHHOLZ DEL TRANSFORMADOR',terminals:'D',contact:'1 - 22',condition:'N.C. - ALARMA'},
      {item:'1',accessory:'RELÉ BUCHHOLZ DEL TRANSFORMADOR',terminals:'D',contact:'11 - 12',condition:'N.C. - DISPARO'},
      {item:'2',accessory:'VÁLVULA DE SEGURIDAD DEL TRANSFORMADOR',terminals:'D',contact:'17 - 18',condition:'N.C. - DISPARO'},
      {item:'3',accessory:'INDICADOR NIVEL DE ACEITE DEL TRANSFORMADOR',terminals:'D',contact:'7 - 8',condition:'N.C. - ALARMA',setpoint:'BAJO'},
      {item:'4',accessory:'RELÉ DE FLUJO DEL OLTC',terminals:'D',contact:'13 - 14',condition:'N.C. - DISPARO'},
      {item:'4',accessory:'RELÉ DE FLUJO DEL OLTC',terminals:'D',contact:'23 - 24',condition:'N.C. - DISPARO'},
      {item:'5',accessory:'INDICADOR NIVEL DE ACEITE OLTC',terminals:'D',contact:'9 - 10',condition:'N.C. - ALARMA',setpoint:'BAJO'},
      {item:'6',accessory:'VÁLVULA DE SEGURIDAD DE OLTC',terminals:'D',contact:'15 - 16',condition:'N.C. - DISPARO'},
      {item:'7',accessory:'INDICADOR DE TEMPERATURA DE ACEITE QUALITROL',terminals:'D',contact:'3 - 4',condition:'N.C. - ALARMA',setpoint:'90 °C'},
      {item:'7',accessory:'INDICADOR DE TEMPERATURA DE ACEITE QUALITROL',terminals:'D',contact:'19 - 20',condition:'DISPARO',setpoint:'100 °C'},
      {item:'8',accessory:'INDICADOR DE TEMPERATURA DE DEVANADO QUALITROL',terminals:'D',contact:'5 - 6',condition:'N.C. - ALARMA',setpoint:'95 °C'},
      {item:'8',accessory:'INDICADOR DE TEMPERATURA DE DEVANADO QUALITROL',terminals:'D',contact:'21 - 22',condition:'DISPARO',setpoint:'105 °C'}
    ];
    return [{},{},{}];
  }
  function rowsFromMeasurements(code,ms){
    const prefix=code==='TTR'?'TTR':(templates[code]?.prefix||code),data={};
    (ms||[]).forEach(m=>{const z=String(m.parameter||'').match(new RegExp('^'+prefix+'\\|(\\d+)\\|(.+)$'));if(z){data[z[1]]=data[z[1]]||{};data[z[1]][z[2]]=m.value??m.notes??'';}});
    let rows=Object.keys(data).sort((a,b)=>Number(a)-Number(b)).map(k=>data[k]);
    if(code==='INSULATION_RESISTANCE'&&rows.some(r=>r.from||r.to||r.time||r.reading)){
      const grouped={};rows.forEach(r=>{const k=[r.from||'',r.to||'',r.voltage||'',r.unit||'',r.reading_unit||''].join('|');const g=grouped[k]||(grouped[k]={point:[r.from,r.to].filter(Boolean).join(' - '),applied_voltage_kv:r.voltage||'',reading_unit:r.reading_unit||r.unit||''});const t=String(r.time||'').toLowerCase().replace(/['’]/g,'');if(t==='15'||t==='15s')g.reading_15s=r.reading||'';if(t==='30'||t==='30s')g.reading_30s=r.reading||'';if(t==='45'||t==='45s')g.reading_45s=r.reading||'';if(t==='1'||t==='1m'||t==='60'||t==='60s')g.reading_1min=r.reading||'';});rows=Object.values(grouped);
    }
    if(code==='POWER_FACTOR')rows=rows.map(r=>({...r,measurement:r.measurement||r.point||'',test_voltage_v:r.test_voltage_v||r.test_voltage||'',power_factor_measured:r.power_factor_measured||r.power_factor||'',capacitance_nf:r.capacitance_nf||r.capacitance||''}));
    if(code==='BUSHING')rows=rows.map(r=>({...r,terminal:r.terminal||r.point||'',serial:r.serial||r.serial_number||'',power_factor_measured:r.power_factor_measured||r.power_factor||'',capacitance_measured_pf:r.capacitance_measured_pf||r.capacitance||''}));
    return rows.map(r=>normalize(code,r));
  }
  function measurementsFromRows(item){
    const prefix=item.code==='TTR'?'TTR':(templates[item.code]?.prefix||item.code),out=[];
    (item.rows||[]).map(r=>normalize(item.code,r)).forEach((row,i)=>columns(item.code).forEach(([key])=>{const v=row[key];if(v!==''&&v!==null&&v!==undefined)out.push({parameter:prefix+'|'+(item.code==='TTR'?(row.tap||i+1):(i+1))+'|'+key,value:String(v),unit:'',notes:''});}));
    return out;
  }
  function makeItem(code,old){old=old||{};return {id:old.id||null,code,name:typeName(code),status:old.status||'BORRADOR',standard_reference:old.standard_reference||'',equipment_name:old.equipment_name||'',equipment_brand:old.equipment_brand||'',equipment_model:old.equipment_model||'',equipment_serial:old.equipment_serial||'',observations:old.observations||'',rows:old.rows||defaults(code)};}
  function renderPicker(){
    $('#planTestPicker').innerHTML=catalog.map(t=>{const on=items.some(x=>x.code===t[0]);return '<button type="button" class="plan-pick-btn '+(on?'active':'')+'" data-pick-test="'+t[0]+'"><span class="plan-pick-check">'+(on?'✓':'＋')+'</span><span><b>'+esc(t[1])+'</b><small>'+esc(t[2])+'</small></span></button>';}).join('');
    $('#planSelectionStatus').textContent=items.length?items.length+' prueba(s) seleccionada(s). Cada una tiene su propio formulario.':'Aún no has añadido pruebas al plan.';
  }
  function renderCards(){
    const host=$('#planTestCards');
    if(!items.length){host.innerHTML='<div class="empty-state">Selecciona pruebas para que aparezcan aquí sus formularios.</div>';return;}
    host.innerHTML=items.map((item,idx)=>{
      const fieldList=columns(item.code),head='<tr>'+fieldList.map(f=>'<th>'+esc(f[1])+'</th>').join('')+'</tr>';
      const body=item.rows.map((raw,ri)=>{const row=normalize(item.code,raw);return '<tr>'+fieldList.map(([key])=>{const calc=['absorption_index','theoretical','errU','errV','errW'].includes(key);return '<td><input class="plan-cell '+(calc?'calculated':'')+'" data-row="'+ri+'" data-col="'+key+'" value="'+esc(row[key]??'')+'" '+(calc?'readonly title="Campo calculado"':'')+'></td>';}).join('')+'</tr>';}).join('');
      let hint='';
      if(item.code==='POWER_FACTOR')hint='<div class="plan-reference-note"><b>LAP:</b> seis modos CH+CHL, CH, CHL, CL+CLH, CL y CLH. Criterio mostrado: FP menor a 1%. El FP corregido se registra desde el equipo.</div>';
      if(item.code==='INSULATION_RESISTANCE')hint='<div class="plan-reference-note"><b>Fórmula LAP:</b> IA = R a 1 min / R a 30 s.</div>';
      if(item.code==='TTR')hint='<div class="plan-reference-note"><b>Fórmula LAP:</b> relación teórica = AT / (BT × √3); error por fase = (medida − teórica) × 100 / medida. El ejemplo usa ±0.5%.</div>';
      return '<article class="plan-test-card" data-test-index="'+idx+'"><div class="plan-test-card-head"><div><span class="eyebrow">ENSAYO '+String(idx+1).padStart(2,'0')+'</span><h4>'+esc(item.name)+'</h4><small>'+fieldList.length+' campos · '+item.rows.length+' fila(s)</small></div><button type="button" class="delete-btn" data-remove-test="'+idx+'">Quitar</button></div>'+
        '<div class="plan-test-meta-grid"><label>Estado<select data-meta="status"><option value="BORRADOR" '+(item.status==='BORRADOR'?'selected':'')+'>Borrador</option><option value="COMPLETADA" '+(item.status==='COMPLETADA'?'selected':'')+'>Completada</option></select></label>'+
        '<label>Norma / referencia<input data-meta="standard_reference" value="'+esc(item.standard_reference)+'" placeholder="Norma o protocolo"></label><label>Equipo<input data-meta="equipment_name" value="'+esc(item.equipment_name)+'" placeholder="Instrumento"></label>'+
        '<label>Marca<input data-meta="equipment_brand" value="'+esc(item.equipment_brand)+'" placeholder="Marca"></label><label>Modelo<input data-meta="equipment_model" value="'+esc(item.equipment_model)+'" placeholder="Modelo"></label><label>N.º de serie<input data-meta="equipment_serial" value="'+esc(item.equipment_serial)+'" placeholder="Serie"></label></div>'+hint+
        '<div class="plan-table-toolbar"><div><b>Datos del protocolo</b><small>Ctrl+V permite pegar una tabla desde Excel.</small></div><button class="btn small" type="button" data-add-row="'+idx+'">＋ Agregar fila</button></div>'+
        '<div class="measurement-sheet-wrap plan-grid-wrap"><table class="measurement-sheet plan-sheet"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>'+
        '<label class="plan-test-observations">Observaciones del ensayo<textarea data-meta="observations" rows="2" placeholder="Resultados, incidencias y comentarios">'+esc(item.observations)+'</textarea></label></article>';
    }).join('');
  }
  function render(){renderPicker();renderCards();}
  function clear(){
    items=[];editingId=null;sessionId=null;
    const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('#planDate').value=d.toISOString().slice(0,16);
    ['planOperator','planSupervisor','planOilTemp','planAmbientTemp','planHumidity','planObservations'].forEach(id=>$('#'+id).value='');
    $('#planTitle').textContent='Nuevo plan de pruebas';$('#saveTestPlan').textContent='Guardar plan';render();
  }
  function start(code){clear();if(code)items.push(makeItem(code));render();bridge.showPage('planPage');}
  function toggle(code){const i=items.findIndex(x=>x.code===code);if(i>=0)items.splice(i,1);else items.push(makeItem(code));render();}
  async function edit(id){
    if(bridge.demo()){toast('El historial no está disponible en modo demostración.',true);return;}
    try{
      const res=await fetch(api('action=test-get&key='+encodeURIComponent(transformer().key)+'&id='+id)),data=await json(res),x=data.item;
      clear();editingId=Number(x.id||id);sessionId=x.plan?.session_id||null;
      $('#planDate').value=String(x.executed_at||'').replace(' ','T').slice(0,16);
      $('#planOperator').value=x.operator_name||'';$('#planSupervisor').value=x.supervisor_name||'';
      $('#planOilTemp').value=x.oil_temperature_c??'';$('#planAmbientTemp').value=x.ambient_temperature_c??'';
      $('#planHumidity').value=x.relative_humidity_percent??'';$('#planObservations').value=x.observations||'';
      if(Array.isArray(x.plan?.tests)&&x.plan.tests.length)items=x.plan.tests.map(t=>makeItem(t.code,{...t,rows:rowsFromMeasurements(t.code,t.measurements||[])}));
      else if(x.test_code&&x.test_code!=='PLAN')items=[makeItem(x.test_code,{status:x.status,standard_reference:x.standard_reference,equipment_name:x.equipment_name,equipment_brand:x.equipment_brand,equipment_model:x.equipment_model,equipment_serial:x.equipment_serial,rows:rowsFromMeasurements(x.test_code,x.measurements||[])})];
      render();$('#planTitle').textContent='Editar plan #'+editingId;$('#saveTestPlan').textContent='Actualizar plan';bridge.showPage('planPage');
    }catch(e){toast(e.message,true);}
  }
  async function save(){
    const date=$('#planDate').value;if(!date){toast('Selecciona la fecha de la visita.',true);$('#planDate').focus();return;}
    if(!items.length){toast('Añade al menos una prueba al plan.',true);$('#planTestPicker').scrollIntoView({behavior:'smooth',block:'center'});return;}
    const tests=items.map(t=>({id:t.id,code:t.code,name:t.name,status:t.status,standard_reference:t.standard_reference,equipment_name:t.equipment_name,equipment_brand:t.equipment_brand,equipment_model:t.equipment_model,equipment_serial:t.equipment_serial,observations:t.observations,measurements:measurementsFromRows(t)}));
    const complete=items.every(t=>t.status==='COMPLETADA');
    const payload={id:editingId,transformer_key:transformer().key,test_code:'PLAN',executed_at:date,status:complete?'COMPLETADA':'BORRADOR',operator_name:$('#planOperator').value,supervisor_name:$('#planSupervisor').value,oil_temperature_c:$('#planOilTemp').value,ambient_temperature_c:$('#planAmbientTemp').value,relative_humidity_percent:$('#planHumidity').value,observations:$('#planObservations').value,measurements:[],plan:{version:1,session_id:sessionId,tests}};
    const btn=$('#saveTestPlan');btn.disabled=true;btn.textContent='Guardando...';
    try{
      if(bridge.demo())throw new Error('Selecciona un transformador real antes de guardar.');
      if(!bridge.testsReady())throw new Error('Prepara las tablas de pruebas eléctricas antes de guardar.');
      const res=await fetch(api('action=test-save'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),d=await json(res);
      toast((editingId?'Plan actualizado':'Plan guardado')+' · '+tests.length+' prueba(s) · ID #'+d.result.id);
      bridge.showPage('testPage');
      await bridge.reloadTestHistory();
    }catch(e){toast(e.message,true);}
    finally{btn.disabled=false;btn.textContent=editingId?'Actualizar plan':'Guardar plan';}
  }
  document.addEventListener('click',e=>{
    const target=e.target instanceof Element?e.target:null;if(!target)return;
    const newBtn=target.closest('#newTestExecution'),pick=target.closest('[data-new-test]'),editBtn=target.closest('[data-open-execution]');
    if(!newBtn&&!pick&&!editBtn)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(editBtn)edit(Number(editBtn.dataset.openExecution));else if(pick)start(pick.dataset.newTest);else start(null);
  },true);
  $('#cancelPlan').addEventListener('click',()=>bridge.showPage('testPage'));
  $('#saveTestPlan').addEventListener('click',save);
  $('#planTestPicker').addEventListener('click',e=>{const b=e.target.closest('[data-pick-test]');if(b)toggle(b.dataset.pickTest);});
  $('#planTestCards').addEventListener('click',e=>{
    const del=e.target.closest('[data-remove-test]');if(del){items.splice(Number(del.dataset.removeTest),1);render();return;}
    const add=e.target.closest('[data-add-row]');if(add){items[Number(add.dataset.addRow)]?.rows.push({});renderCards();}
  });
  $('#planTestCards').addEventListener('input',e=>{
    const card=e.target.closest('[data-test-index]');if(!card)return;const item=items[Number(card.dataset.testIndex)];if(!item)return;
    if(e.target.dataset.meta){item[e.target.dataset.meta]=e.target.value;return;}
    if(!e.target.classList.contains('plan-cell'))return;
    const row=Number(e.target.dataset.row),key=e.target.dataset.col;item.rows[row]=item.rows[row]||{};item.rows[row][key]=e.target.value;
    const nr=normalize(item.code,item.rows[row]);
    if(item.code==='INSULATION_RESISTANCE'&&['reading_30s','reading_1min'].includes(key)){item.rows[row]=nr;const out=card.querySelector('[data-row="'+row+'"][data-col="absorption_index"]');if(out)out.value=nr.absorption_index;}
    if(item.code==='TTR'&&['at','bt','U','V','W'].includes(key)){item.rows[row]=nr;['theoretical','errU','errV','errW'].forEach(k=>{const out=card.querySelector('[data-row="'+row+'"][data-col="'+k+'"]');if(out)out.value=nr[k]||'';});}
  });
  $('#planTestCards').addEventListener('paste',e=>{
    const cell=e.target.closest('.plan-cell');if(!cell||cell.readOnly)return;
    const text=(e.clipboardData||window.clipboardData).getData('text');if(!text.includes('\t')&&!text.includes('\n'))return;
    e.preventDefault();const card=cell.closest('[data-test-index]'),item=items[Number(card.dataset.testIndex)],fields=columns(item.code),r0=Number(cell.dataset.row),c0=fields.findIndex(c=>c[0]===cell.dataset.col);
    text.replace(/\r/g,'').split('\n').filter((v,i,a)=>!(i===a.length-1&&v==='')).forEach((line,ri)=>{while(item.rows.length<=r0+ri)item.rows.push({});line.split('\t').forEach((v,ci)=>{const f=fields[c0+ci];if(f&&!['absorption_index','theoretical','errU','errV','errW'].includes(f[0]))item.rows[r0+ri][f[0]]=v.trim();});item.rows[r0+ri]=normalize(item.code,item.rows[r0+ri]);});
    renderCards();toast('Bloque pegado desde Excel.');
  });
})();
