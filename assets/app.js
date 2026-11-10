(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clone = value => JSON.parse(JSON.stringify(value));
  // Variables de estado declaradas al inicio para evitar accesos durante la TDZ.
  var state = null;
  var localDateTime = function () { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  // Estado de ejecución inicializado antes de registrar eventos globales.
  // var evita la zona temporal muerta si un clic ocurre durante la inicialización.
  var activeExecutionId = null;
  var activeExecutionMode = 'new';
  var activeSpecificCode = '';
  const specificTemplates={
    WINDING_RESISTANCE:{title:'Resistencia de devanados',hint:'Una fila por toma y fase. Incluye corriente, tensión y tiempo DC, resistencia medida, desviación y resistencia referida a 75 °C, como en LAP.',prefix:'WR',cols:[['winding','Bobinado (AT/BT)'],['tap','Tap'],['terminal_pair','Bornes / conexión'],['phase','Fase'],['current','I DC (A)'],['dc_voltage_v','V DC (V)'],['time_s','Tiempo (s)'],['resistance','R medida (Ω)'],['resistance_deviation_percent','Desviación R (%)'],['resistance_referred_75c','R referida 75 °C (Ω)'],['fluctuation_percent','Fluctuación (%)'],['slope_a_s','Pendiente (A/s)'],['temperature','Temperatura (°C)'],['unit','Unidad'],['notes','Observación']]},
    INSULATION_RESISTANCE:{title:'Resistencia de aislamiento',hint:'Registra las tres configuraciones LAP y las lecturas a 15 s, 30 s, 45 s y 1 min. El índice de absorción se calcula como R(1 min) / R(30 s).',prefix:'IR',cols:[['point','Punto de aplicación'],['applied_voltage_kv','Voltaje aplicado (kV)'],['reading_15s','Resistencia a 15 s'],['reading_30s','Resistencia a 30 s'],['reading_45s','Resistencia a 45 s'],['reading_1min','Resistencia a 1 min'],['absorption_index','Índice de absorción'],['reading_unit','Unidad de lectura'],['notes','Observación']]},
    CAPACITANCE:{title:'Capacitancia',hint:'Registra punto de prueba, configuración y capacitancia medida.',prefix:'CAP',cols:[['point','Punto / borne'],['connection','Conexión de prueba'],['test_voltage','Tensión de prueba'],['capacitance','Capacitancia'],['unit','Unidad'],['frequency','Frecuencia'],['temperature','Temperatura °C'],['notes','Observación']]},
    POWER_FACTOR:{title:'Factor de potencia del transformador',hint:'Campos LAP: bloque, modo de prueba, tensión y frecuencia, tensión/corriente de salida, pérdidas, FP medido, FP corregido a 20 °C y capacitancia.',prefix:'PF',cols:[['block','Bloque / sección'],['measurement','Medición (CH+CHL, CH, CHL, CL+CLH...)'],['test_mode','Modo (GST, GSTg-A, UST-A)'],['sweep','Barrido'],['test_voltage_v','Tensión de prueba (V)'],['frequency_hz','Frecuencia (Hz)'],['output_voltage_v','V de salida (V)'],['output_current_a','I de salida (A)'],['power_loss_w','Pérdidas (W)'],['power_factor_measured','FP medido'],['power_factor_corrected_20c','FP corregido a 20 °C'],['capacitance_nf','Capacitancia (nF)'],['global_correction_enabled','Usar factor global de corrección'],['global_correction_factor','Factor de corrección'],['evaluation','Evaluación'],['notes','Observación']]},
    EXCITATION:{title:'Corriente de excitación',hint:'Una fila por tap y fase. LAP registra tensión de salida, corriente, ángulo de fase, pérdidas y reactancia; la hoja de protocolo resume corriente de excitación y pérdidas.',prefix:'EXC',cols:[['tap','Tap'],['phase','Fase (U-0 / V-0 / W-0)'],['test_voltage_kv','Tensión aplicada (kV)'],['frequency_hz','Frecuencia (Hz)'],['voltage','V de salida (V)'],['current','I de salida (A)'],['current_phase_degrees','Ángulo de corriente (°)'],['power','Pérdidas (W)'],['reactance_ohm','Reactancia (Ω)'],['unit','Unidad / referencia'],['notes','Observación']]},
    BUSHING:{title:'Factor de potencia y capacitancia de bushings',hint:'Una fila por borne. Registra serie, tensión, FP de placa y medido, capacitancia de placa y medida, y variación.',prefix:'BUSH',cols:[['terminal','Borne'],['serial','Serie'],['test_voltage','Tensión de prueba (kV)'],['power_factor_plate','FP de placa'],['power_factor','FP medido'],['capacitance_plate','Capacitancia de placa (pF)'],['capacitance','Capacitancia medida (pF)'],['variation_percent','Variación (%)'],['test_mode','Modo de prueba'],['dissipation','Factor de disipación'],['cap_unit','Unidad C'],['notes','Observación']]},
    SFRA:{title:'Análisis de respuesta al barrido de frecuencia (SFRA)',hint:'El protocolo LAP identifica tres conexiones: AT–BT abierto, BT–AT abierto y AT–BT en cortocircuito. Adjunta o referencia la curva exportada y documenta la comparación campo/planta.',prefix:'SFRA',cols:[['connection','Conexión / configuración'],['tap','Tap'],['file_reference','Archivo de curva / referencia'],['comparison_reference','Curva de referencia (fábrica)'],['comparison_result','Resultado de comparación'],['evaluation','Evaluación'],['instrument','Equipo'],['notes','Observación']]},
    ARRESTER:{title:'Prueba de pararrayos (AT / MT)',hint:'LAP separa pararrayos AT y MT. Registra fase, tensión y corriente de salida, modo GST, pérdidas y capacitancia medida.',prefix:'ARR',cols:[['section','Sección (AT/MT)'],['phase','Fase / borne'],['output_voltage_v','V de salida (V)'],['output_current_a','I de salida (A)'],['test_mode','Modo de prueba (GST)'],['losses_measured_w','Pérdidas medidas (W)'],['capacitance_measured_pf','Capacitancia medida (pF)'],['evaluation','Evaluación'],['notes','Observación']]},
    PROTECTIONS:{title:'Verificación de protecciones propias',hint:'Registra cada accesorio y contacto probado, condición (alarma/disparo/ventilación), ajuste, resultado y observación, según el protocolo LAP.',prefix:'PROT',cols:[['accessory','Accesorio'],['terminals','Bornes'],['contact','Contacto'],['condition','Condición'],['setpoint','Ajuste'],['result','Resultado'],['notes','Observación']]}
  };

  var testCatalog = [
    ['TTR','Relación de transformación','Taps, relación teórica/medida y error por fase'],
    ['CAPACITANCE','Capacitancia','Registro de capacitancia por punto de prueba'],
    ['POWER_FACTOR','Factor de potencia del transformador','FP medido/corregido, pérdidas y capacitancia'],
    ['EXCITATION','Corriente de excitación','Corriente, ángulo, pérdidas y reactancia por fase'],
    ['WINDING_RESISTANCE','Resistencia de devanados','Medición DC y resistencia referida a 75 °C'],
    ['INSULATION_RESISTANCE','Resistencia de aislamiento','Lecturas por tiempo e índice de absorción'],
    ['SFRA','SFRA','Tres configuraciones de barrido y comparación de curvas'],
    ['BUSHING','Bushings capacitivos','FP y capacitancia de placa/medidos por borne'],
    ['ARRESTER','Pararrayos AT / MT','Pérdidas y capacitancia por fase'],
    ['PROTECTIONS','Protecciones propias','Accesorios, contactos, ajustes y resultados']
  ];

  const blankTerminal = (code, phase = '', type = 'Fase') => ({code, phase, type, has_capacitive_bushing: false, bushing: {serial_number:'',manufacturer:'',model:'',rated_voltage_kv:'',capacitance_pf:'',power_factor_percent:'',notes:''}});
  const API_URL = PILOT.apiUrl || 'api.php';
  const api = (query = '') => API_URL + (query ? '?' + query : '');

  async function readApiResponse(response) {
    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); }
    catch (_) { throw new Error('El servidor PHP no devolvió JSON. Revisa la ruta /pe/api.php y los errores de PHP en Laragon. Respuesta: ' + raw.slice(0,180)); }
    if (!response.ok || data.ok === false) throw new Error(data.message || ('Error HTTP ' + response.status));
    return data;
  }
  const transformer = {...PILOT.transformer};
  let dirty = false;
  state = normalizeConfig(PILOT.config || {});
  let selectedTab = 'general';

  const editFields = {
    code:'editTrafoCode',name:'editTrafoName',company:'editTrafoCompany',voltage:'editTrafoVoltage',
    power:'editTrafoPower',year:'editTrafoYear',brand:'editTrafoBrand',tap_type:'editTrafoTapType',
    num_taps:'editTrafoNumTaps',vector_group:'editTrafoVector',location:'editTrafoLocation',
    phase_count:'editTrafoPhaseCount',frequency_hz:'editTrafoFrequency',insulation_type:'editTrafoInsulation',cooling_type:'editTrafoCooling',notes:'editTrafoNotes'
  };
  function openTransformerEditor(){
    const vals={code:transformer.code,name:transformer.name||'',company:transformer.company||'',voltage:transformer.voltage??'',power:transformer.power??'',year:transformer.year??'',brand:transformer.brand||'',tap_type:transformer.tap_type||'',num_taps:transformer.num_taps??'',vector_group:transformer.vector_group||'',location:transformer.location||'',phase_count:transformer.phase_count??'',frequency_hz:transformer.frequency_hz??'',insulation_type:transformer.insulation_type||'',cooling_type:transformer.cooling_type||'',notes:transformer.notes||''};
    Object.entries(editFields).forEach(([k,id])=>$('#'+id).value=vals[k]??'');
    $('#editTransformerStatus').textContent='';
    $('#transformerEditModal').classList.remove('hidden');
    $('#editTrafoCode').focus();
  }
  function closeTransformerEditor(){$('#transformerEditModal').classList.add('hidden');}
  $('#editTransformerBtn')?.addEventListener('click',openTransformerEditor);
  $('#closeTransformerModal')?.addEventListener('click',closeTransformerEditor);
  $('#cancelTransformerEdit')?.addEventListener('click',closeTransformerEditor);
  $('#transformerEditModal')?.addEventListener('click',e=>{if(e.target.id==='transformerEditModal')closeTransformerEditor();});
  $('#transformerEditForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const payload={transformer_key:transformer.key};
    Object.entries(editFields).forEach(([k,id])=>payload[k]=$('#'+id).value.trim());
    const btn=$('#saveTransformerEdit');btn.disabled=true;btn.textContent='Guardando...';
    try{
      if(PILOT.demo)throw new Error('No se puede editar en modo demostración. Conecta MySQL y selecciona un transformador existente.');
      const response=await fetch(api('action=transformer-update'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await readApiResponse(response);
      const t=result.transformer;
      Object.assign(transformer,t);
      updateTransformerDisplay();
      if(result.unsupported_fields?.length){
        const labels={phase_count:'número de fases',frequency_hz:'frecuencia',insulation_type:'aislamiento',cooling_type:'refrigeración',notes:'observaciones'};
        toast('Guardado parcial. Tu tabla no tiene columnas para: '+result.unsupported_fields.map(k=>labels[k]||k).join(', ')+'.',true);
      }else toast('Datos de placa del transformador actualizados.');
      closeTransformerEditor();
    }catch(err){$('#editTransformerStatus').textContent=err.message;toast(err.message,true);}
    finally{btn.disabled=false;btn.innerHTML='Guardar cambios';}
  });


  function normalizeConfig(config) {
    // La API puede devolver config=null cuando el transformador aún no tiene configuración.
    // Normalizar siempre contra un objeto evita acceder a null.windings.
    config = config && typeof config === 'object' ? config : {};
    const windingRows = Array.isArray(config.windings) ? config.windings : [];
    const tapChangerRows = Array.isArray(config.tap_changers) ? config.tap_changers : [];
    const windings = windingRows.map(w => ({
      id: w.id || null,
      name: w.winding_name || w.name || '',
      code: w.winding_code || w.code || '',
      voltage_kv: w.voltage_kv ?? '',
      connection_type: w.connection_type || '',
      has_neutral: Number(w.has_neutral || 0) === 1 || w.has_neutral === true,
      conductor_material: w.conductor_material || '',
      notes: w.notes || '',
      terminals: (w.terminals || []).map(t => ({
        code: t.terminal_code || t.code || '', phase: t.phase_code || t.phase || '', type: t.terminal_type || t.type || 'Fase',
        has_capacitive_bushing: Number(t.has_capacitive_bushing || 0) === 1 || t.has_capacitive_bushing === true,
        bushing: {serial_number:t.serial_number || '',manufacturer:t.bushing_manufacturer || '',model:t.bushing_model || '',rated_voltage_kv:t.rated_voltage_kv ?? '',capacitance_pf:t.capacitance_pf ?? '',power_factor_percent:t.power_factor_percent ?? '',notes:t.bushing_notes || ''}
      }))
    }));
    const tapChangers = tapChangerRows.map(c => ({
      name:c.changer_name || c.name || 'Conmutador', type:c.changer_type || c.type || 'DETC', operation_type:c.operation_type || 'Manual',
      winding_index: Math.max(0, windings.findIndex(w => String(w.id) === String(c.winding_id))),
      min_position:c.min_position ?? '', max_position:c.max_position ?? '', neutral_position:c.neutral_position ?? '', current_position:c.current_position ?? '', notes:c.notes || '',
      positions:(c.positions || []).map(p => ({position_no:p.position_no,label:p.label || '',voltage_kv:p.voltage_kv ?? '',percent_change:p.percent_change ?? '',is_neutral:Number(p.is_neutral || 0)===1,notes:p.notes || ''}))
    }));
    return {phase_count:Number(config.phase_count || 3),vector_group:config.vector_group || transformer.vector_group || 'Yd11',frequency_hz:config.frequency_hz ?? 60,notes:config.notes || '',version_no:Number(config.version_no || 0),windings,tap_changers:tapChangers,versions:Array.isArray(config.versions) ? config.versions : []};
  }


  function markDirty() {
    dirty = true;
    const badge = $('#saveStatus');
    badge.classList.remove('saved');
    badge.innerHTML = '<i></i>Cambios sin guardar';
  }
  function toast(message, bad = false) {
    const el = $('#toast'); el.textContent = message; el.style.background = bad ? '#a32b2b' : '#24394e';
    el.classList.add('show'); window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => el.classList.remove('show'), 3100);
  }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function showPanel(tab) {
    selectedTab = tab;
    $$('.config-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    $$('.config-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== tab));
    if (tab === 'review') renderReview();
  }
  function openConfig() {
    showOnlyMain('configPage');
    showPanel('general');
    updateCounts();
  }
  function backOverview() { showOnlyMain('overviewPage'); }

  $('#openConfig').addEventListener('click', e => {e.preventDefault();openConfig();});
  $('#backOverview').addEventListener('click', backOverview);
  $$('.config-tab').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.tab)));
  $$('[data-prev]').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.prev)));
  $('#phaseCount').value = String(state.phase_count || 3);
  $('#vectorGroup').value = state.vector_group || 'Yd11';
  $('#frequency').value = state.frequency_hz ?? 60;
  $('#generalNotes').value = state.notes || '';
  ['phaseCount','vectorGroup','frequency','generalNotes'].forEach(id => $('#'+id).addEventListener('input', () => {state.phase_count=Number($('#phaseCount').value);state.vector_group=$('#vectorGroup').value;state.frequency_hz=$('#frequency').value;state.notes=$('#generalNotes').value;markDirty();}));

  function addWinding(data = {}) {
    const suffix = state.windings.length + 1;
    const prefix = data.code || ('W'+suffix);
    const phases = Number(state.phase_count) === 1 ? [['A'+suffix,'A','Fase']] : [['U'+suffix,'U','Fase'],['V'+suffix,'V','Fase'],['W'+suffix,'W','Fase']];
    if (data.has_neutral) phases.push(['N'+suffix,'N','Neutro']);
    state.windings.push({name:data.name || ('Bobinado '+suffix),code:prefix,voltage_kv:data.voltage_kv || '',connection_type:data.connection_type || '',has_neutral:!!data.has_neutral,conductor_material:data.conductor_material || '',notes:data.notes || '',terminals:data.terminals || phases.map(p=>blankTerminal(...p))});
    const newIndex=state.windings.length-1;
    markDirty(); renderWindings(); updateCounts();
    requestAnimationFrame(()=>{
      const card=$('#windingsContainer [data-winding="'+newIndex+'"]');
      if(!card)return;
      card.scrollIntoView({behavior:'smooth',block:'start'});
      card.querySelector('[data-wfield="name"]')?.focus({preventScroll:true});
    });
  }
  $('#addWinding').addEventListener('click', () => addWinding());
  $('#copyWindings')?.addEventListener('click',()=>copyGrid([
    ['Bobinado','Código','Tensión kV','Conexión','Material','¿Tiene neutro?','Notas'],
    ...state.windings.map(w=>[w.name,w.code,w.voltage_kv,w.connection_type,w.conductor_material,w.has_neutral?'Sí':'No',w.notes])
  ].map(r=>r.join('\t')).join('\n')));
  function renderWindings() {
    const host = $('#windingsContainer');
    if (!state.windings.length) {
      host.innerHTML = `<div class="empty-state"><div style="font-size:22px;margin-bottom:6px">＋</div><b>No hay bobinados configurados</b><p>Agrega un bobinado o carga un ejemplo basado en tu Excel.</p><button class="btn primary" id="loadExample">Cargar estructura de ejemplo</button></div>`;
      $('#loadExample').addEventListener('click', loadExample); return;
    }
    host.innerHTML = state.windings.map((w,wi)=>`
      <article class="winding-card" data-winding="${wi}">
        <div class="winding-card-head"><span class="winding-index">${String(wi+1).padStart(2,'0')}</span><div class="winding-head-fields">
          <input aria-label="Nombre bobinado" data-wfield="name" value="${esc(w.name)}" placeholder="Nombre bobinado">
          <input aria-label="Código" data-wfield="code" value="${esc(w.code)}" placeholder="Código">
          <input class="w-voltage" aria-label="Tensión kV" data-wfield="voltage_kv" type="text" inputmode="decimal" value="${esc(w.voltage_kv)}" placeholder="kV">
          <select aria-label="Conexión" data-wfield="connection_type">${['','Estrella (Y)','Estrella con neutro (YN)','Triángulo (D)','Zig-zag (Z)','Monofásico','Autotransformador'].map(v=>`<option ${w.connection_type===v?'selected':''} value="${esc(v)}">${v || 'Conexión...'}</option>`).join('')}</select>
          <select aria-label="Material" data-wfield="conductor_material"><option value="">Material...</option><option ${w.conductor_material==='Cobre'?'selected':''}>Cobre</option><option ${w.conductor_material==='Aluminio'?'selected':''}>Aluminio</option><option ${w.conductor_material==='Otro'?'selected':''}>Otro</option></select>
          <input aria-label="Notas del bobinado" data-wfield="notes" value="${esc(w.notes)}" placeholder="Notas del bobinado">
          <label class="check-inline">¿Tiene neutro?<select data-wfield="has_neutral"><option value="0" ${!w.has_neutral?'selected':''}>No</option><option value="1" ${w.has_neutral?'selected':''}>Sí</option></select></label>
        </div><button class="delete-btn" data-remove-winding="${wi}" title="Eliminar bobinado"><svg><use href="#i-trash"/></svg></button></div>
        <div class="winding-body"><div class="table-caption"><strong>Bornes / terminales <small data-winding-stats="${wi}">${w.terminals.length} registros · ${w.terminals.filter(t=>t.has_capacitive_bushing).length} bushings capacitivos</small></strong><div class="sheet-tools"><button data-add-terminal="${wi}">+ Fila</button><button data-copy-terminals="${wi}">Copiar bornes</button></div></div><div class="sheet-wrap" id="terminal-grid-${wi}"></div><div class="sheet-hint">Copia la tabla con «Copiar tabla» o pega desde Excel con Ctrl+V en la primera celda. Se admiten bloques con tabulaciones y saltos de línea. Incluye la ficha del bushing: serie, fabricante, modelo, tensión, capacitancia, FP y notas. Desplázate horizontalmente para ver todas las columnas.</div></div>
      </article>`).join('');
    host.querySelectorAll('[data-wfield]').forEach(el=>el.addEventListener('change', e=>{const card=e.target.closest('[data-winding]');const i=Number(card.dataset.winding);const key=e.target.dataset.wfield;state.windings[i][key]=key==='has_neutral'?e.target.value==='1':(key==='voltage_kv'?normalizeNumeric(e.target.value):e.target.value);if(key==='voltage_kv')e.target.value=state.windings[i][key];markDirty();}));
    host.querySelectorAll('[data-remove-winding]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.removeWinding);if(!confirm('¿Eliminar este bobinado y sus bornes de la configuración actual?'))return;state.windings.splice(i,1);state.tap_changers=state.tap_changers.filter(c=>c.winding_index!==i).map(c=>({...c,winding_index:c.winding_index>i?c.winding_index-1:c.winding_index}));renderWindings();renderTapChangers();updateCounts();markDirty();}));
    host.querySelectorAll('[data-add-terminal]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.addTerminal);state.windings[i].terminals.push(blankTerminal(''));renderWindings();markDirty();}));
    host.querySelectorAll('[data-copy-terminals]').forEach(b=>b.addEventListener('click',()=>copyGrid([['Borne','Fase','Tipo','¿Bushing capacitivo?','Serie bushing','Fabricante','Modelo','Tensión (kV)','Capacitancia (pF)','FP (%)','Notas'],...state.windings[Number(b.dataset.copyTerminals)].terminals.map(t=>[t.code,t.phase,t.type,t.has_capacitive_bushing?'Sí':'No',t.bushing.serial_number,t.bushing.manufacturer,t.bushing.model,t.bushing.rated_voltage_kv,t.bushing.capacitance_pf,t.bushing.power_factor_percent,t.bushing.notes])].map(r=>r.join('\t')).join('\n'))));
    state.windings.forEach((w,i)=>buildGrid($('#terminal-grid-'+i),w.terminals,[
      {key:'code',label:'Borne',type:'text'},{key:'phase',label:'Fase',type:'select',options:['','U','V','W','A','B','C','N','T']},{key:'type',label:'Tipo',type:'select',options:['Fase','Neutro','Terciario','Tierra','Otro']},{key:'has_capacitive_bushing',label:'¿Tiene bushing capacitivo?',type:'yesno'},
      {key:'serial_number',label:'Serie bushing',type:'bushing'},{key:'manufacturer',label:'Fabricante',type:'bushing'},{key:'model',label:'Modelo',type:'bushing'},
      {key:'rated_voltage_kv',label:'Tensión placa (kV)',type:'bushing-number'},{key:'capacitance_pf',label:'Cap. placa (pF)',type:'bushing-number'},
      {key:'power_factor_percent',label:'FP placa (%)',type:'bushing-number'},{key:'notes',label:'Notas bushing',type:'bushing'}
    ],(row,key,value)=>{if(key==='has_capacitive_bushing'){row[key]=!!value;if(!row[key])row.bushing={serial_number:'',manufacturer:'',model:'',rated_voltage_kv:'',capacitance_pf:'',power_factor_percent:'',notes:''};}else if(['serial_number','manufacturer','model','rated_voltage_kv','capacitance_pf','power_factor_percent','notes'].includes(key)){if(String(value).trim()!=='')row.has_capacitive_bushing=true;row.bushing[key]=value;}else row[key]=value;markDirty();refreshWindingCounters();}));
  }
  function loadExample() {
    state.windings = [
      {name:'Bobinado AT',code:'AT',voltage_kv:'220',connection_type:'Estrella con neutro (YN)',has_neutral:true,conductor_material:'Cobre',notes:'Ejemplo de la hoja creacion de bornes.',terminals:[blankTerminal('U1','U'),blankTerminal('V1','V'),blankTerminal('W1','W'),blankTerminal('N1','N','Neutro')]},
      {name:'Bobinado BT',code:'BT',voltage_kv:'138',connection_type:'Triángulo (D)',has_neutral:false,conductor_material:'Cobre',notes:'Ejemplo de la hoja creacion de bornes.',terminals:[blankTerminal('U2','U'),blankTerminal('V2','V'),blankTerminal('W2','W')]}
    ];
    state.windings[0].terminals.slice(0,3).forEach(t=>t.has_capacitive_bushing=true);
    state.windings[1].terminals.forEach(t=>t.has_capacitive_bushing=true);
    renderWindings();updateCounts();markDirty();toast('Estructura de ejemplo cargada. Reemplaza los datos por los de placa.');
  }

  function normalizeNumeric(value){
    let text=String(value??'').trim().replace(/\s+/g,'');
    if(text.includes(',')&&text.includes('.')){if(text.lastIndexOf(',')>text.lastIndexOf('.'))text=text.replace(/\./g,'').replace(',', '.');else text=text.replace(/,/g,'');}
    else if(text.includes(','))text=text.replace(',', '.');
    return text;
  }

  // Excel-like grid: paste TSV blocks, navigate by arrows/Enter/Tab and grow rows as needed.
  function buildGrid(container, rows, columns, onChange) {
    if (!rows.length) rows.push({});
    const render = () => {
      const head = columns.map(c=>`<th>${esc(c.label)}</th>`).join('');
      const body = rows.map((row,ri)=>`<tr data-grid-row="${ri}"><td>${ri+1}</td>${columns.map((col,ci)=>`<td>${renderCell(row,col,ri,ci)}</td>`).join('')}</tr>`).join('');
      container.innerHTML = `<table class="sheet-table"><thead><tr><th>#</th>${head}</tr></thead><tbody>${body}</tbody></table>`;
      container.querySelectorAll('.sheet-cell').forEach(cell=>{
        cell.addEventListener('change',()=>{const r=Number(cell.dataset.row),c=Number(cell.dataset.col),key=columns[c].key,col=columns[c],raw=cell.type==='checkbox'?cell.checked:cell.value,val=['number','bushing-number'].includes(col.type)?normalizeNumeric(raw):raw;if(['number','bushing-number'].includes(col.type))cell.value=val;onChange(rows[r],key,val);});
      });
      container.querySelectorAll('.sheet-cell').forEach(cell=>cell.addEventListener('keydown',e=>navigateGrid(e,container,rows,columns,render)));
      const table=container.querySelector('table');
      table.addEventListener('paste',e=>handlePaste(e,container,rows,columns,onChange,render));
    };
    function renderCell(row,col,ri,ci){
      let val = col.type==='bushing'||col.type==='bushing-number' ? (row.bushing?.[col.key] ?? '') : (row[col.key] ?? '');
      if(col.type==='check') return `<div style="display:grid;place-items:center;height:32px"><input class="sheet-cell sheet-check" type="checkbox" data-row="${ri}" data-col="${ci}" ${val?'checked':''} aria-label="${esc(col.label)}"></div>`;
      if(col.type==='yesno') return `<select class="sheet-cell sheet-select" data-row="${ri}" data-col="${ci}" aria-label="${esc(col.label)}"><option value="0" ${!val?'selected':''}>No</option><option value="1" ${val?'selected':''}>Sí</option></select>`;
      if(col.type==='select') return `<select class="sheet-cell sheet-select" data-row="${ri}" data-col="${ci}">${col.options.map(o=>`<option value="${esc(o)}" ${String(val)===o?'selected':''}>${esc(o || '—')}</option>`).join('')}</select>`;
      return `<input class="sheet-cell" data-row="${ri}" data-col="${ci}" type="text" ${['number','bushing-number'].includes(col.type)?'inputmode="decimal" data-numeric="1"':''} value="${esc(val)}" aria-label="${esc(col.label)}">`;
    }
    function navigateGrid(e,host,allRows,cols,rerender){
      if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Tab'].includes(e.key))return;
      const cell=e.target.closest('.sheet-cell');if(!cell)return;
      const r=Number(cell.dataset.row),c=Number(cell.dataset.col);let nr=r,nc=c;
      if(e.key==='ArrowUp')nr=Math.max(0,r-1);
      if(e.key==='ArrowDown'||e.key==='Enter')nr=r+1;
      if(e.key==='ArrowLeft'){
        if(cell.type==='text' && cell.selectionStart>0)return;
        nc=c-1;
      }
      if(e.key==='ArrowRight'){
        if(cell.type==='text' && cell.selectionStart<cell.value.length)return;
        nc=c+1;
      }
      if(e.key==='Tab'){
        e.preventDefault();let linear=r*cols.length+c+(e.shiftKey?-1:1);
        linear=Math.max(0,linear);nr=Math.floor(linear/cols.length);nc=linear%cols.length;
      }else e.preventDefault();
      if(nc<0){nc=cols.length-1;nr=Math.max(0,nr-1);}
      if(nc>=cols.length){nc=0;nr+=1;}
      if(nr>=allRows.length){allRows.push({});rerender();}
      nr=Math.min(nr,allRows.length-1);
      const next=host.querySelector(`[data-row="${nr}"][data-col="${nc}"]`);
      if(next){next.focus();if(next.select&&next.type!=='checkbox')next.select();}
    }
    render();
  }
  function handlePaste(e,container,rows,columns,onChange,rerender){
    const target=e.target.closest('.sheet-cell');if(!target)return;
    const text=(e.clipboardData||window.clipboardData).getData('text');if(!text||(!text.includes('\t')&&!text.includes('\n')))return;
    e.preventDefault();
    const matrix=text.replace(/\r/g,'').split('\n').filter((line,i,a)=>line!==''||i<a.length-1).map(line=>line.split('\t'));
    let startR=Number(target.dataset.row),startC=Number(target.dataset.col);
    matrix.forEach((vals,ri)=>{
      const rowIndex=startR+ri;while(rowIndex>=rows.length)rows.push({});
      vals.forEach((value,ci)=>{
        const colIndex=startC+ci;if(colIndex>=columns.length)return;
        const col=columns[colIndex],row=rows[rowIndex];let parsed=value.trim();
        if(['number','bushing-number'].includes(col.type))parsed=normalizeNumeric(parsed);
        if(col.type==='check'||col.type==='yesno'){parsed=['si','sí','yes','1','true','x'].includes(parsed.toLowerCase());onChange(row,col.key,parsed);}
        else onChange(row,col.key,parsed);
      });
    });
    rerender();markDirty();toast('Bloque pegado en la tabla.');
  }
  async function copyGrid(text){
    try{
      if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);}
      else{
        const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();
        const ok=document.execCommand('copy');area.remove();if(!ok)throw new Error('El navegador bloqueó el portapapeles.');
      }
      toast('Datos copiados. Puedes pegarlos en Excel o en otra tabla.');
    }catch(e){toast('No se pudo copiar. Revisa los permisos del portapapeles del navegador.',true);}
  }

  function addTapChanger() {
    if(!state.windings.length){toast('Primero configura al menos un bobinado en el paso 02.',true);showPanel('windings');return;}
    const count = Number(transformer.num_taps || 0);
    const positions = Array.from({length:Math.max(0,Math.min(1000,count))},(_,i)=>({position_no:i+1,label:'Tap '+(i+1),voltage_kv:'',percent_change:'',is_neutral:false,notes:''}));
    state.tap_changers.push({name:'Conmutador '+(state.tap_changers.length+1),type:(transformer.tap_type||'DETC').toUpperCase().includes('OLTC')?'OLTC':'DETC',operation_type:'Manual',winding_index:0,min_position:positions.length?1:'',max_position:positions.length?positions.length:'',neutral_position:'',current_position:'',notes:'',positions});
    renderTapChangers();updateCounts();markDirty();
  }
  $('#addTapChanger').addEventListener('click', addTapChanger);
  function renderTapChangers(){
    const host=$('#tapChangersContainer');
    if(!state.tap_changers.length){host.innerHTML=`<div class="empty-state"><div style="font-size:22px;margin-bottom:6px">＋</div><b>No hay conmutadores configurados</b><p>Agrega el conmutador asociado al bobinado que regula la tensión.</p><button class="btn primary" id="addFirstChanger">Agregar conmutador</button></div>`;$('#addFirstChanger').addEventListener('click',addTapChanger);return;}
    host.innerHTML=state.tap_changers.map((c,ci)=>`<article class="tap-card" data-changer="${ci}"><div class="tap-card-head"><div><strong>${esc(c.name||'Conmutador')}</strong><br><small>${esc(c.type)} · ${c.positions.length} posiciones</small></div><button class="delete-btn" data-remove-changer="${ci}" title="Eliminar conmutador"><svg><use href="#i-trash"/></svg></button></div><div class="tap-meta">
      <label>Nombre<input data-cfield="name" value="${esc(c.name)}"></label>
      <label>Bobinado asociado<select data-cfield="winding_index">${state.windings.map((w,i)=>`<option value="${i}" ${Number(c.winding_index)===i?'selected':''}>${esc(w.name||w.code||'Bobinado '+(i+1))}</option>`).join('')}</select></label>
      <label>Tipo<select data-cfield="type"><option ${c.type==='DETC'?'selected':''}>DETC</option><option ${c.type==='OLTC'?'selected':''}>OLTC</option></select></label>
      <label>Accionamiento<select data-cfield="operation_type"><option ${c.operation_type==='Manual'?'selected':''}>Manual</option><option ${c.operation_type==='Motorizado'?'selected':''}>Motorizado</option><option ${c.operation_type==='Automático'?'selected':''}>Automático</option></select></label>
      <label>Posición mínima<input data-cfield="min_position" type="number" value="${esc(c.min_position)}"></label><label>Posición máxima<input data-cfield="max_position" type="number" value="${esc(c.max_position)}"></label><label>Neutro<input data-cfield="neutral_position" type="number" value="${esc(c.neutral_position)}"></label><label>Actual<input data-cfield="current_position" type="number" value="${esc(c.current_position)}"></label>
    </div><div class="tap-card-body"><div class="table-caption"><strong>Posiciones de tap / datos de placa</strong><div class="sheet-tools"><button data-generate-taps="${ci}">Generar filas</button><button data-add-tap-row="${ci}">+ Fila</button><button data-copy-taps="${ci}">Copiar tabla</button></div></div><div class="sheet-wrap" id="tap-grid-${ci}"></div><div class="sheet-hint">El número de posiciones se ajusta a la placa. Puedes pegar las columnas Posición, Etiqueta, Tensión kV, Variación %, Neutro y Observaciones.</div></div></article>`).join('');
    host.querySelectorAll('[data-cfield]').forEach(el=>el.addEventListener('change',e=>{const ci=Number(e.target.closest('[data-changer]').dataset.changer),key=e.target.dataset.cfield;state.tap_changers[ci][key]=key==='winding_index'?Number(e.target.value):e.target.value;markDirty();}));
    host.querySelectorAll('[data-remove-changer]').forEach(b=>b.addEventListener('click',()=>{if(!confirm('¿Eliminar este conmutador y todas sus posiciones?'))return;state.tap_changers.splice(Number(b.dataset.removeChanger),1);renderTapChangers();updateCounts();markDirty();}));
    host.querySelectorAll('[data-generate-taps]').forEach(b=>b.addEventListener('click',()=>openTapGenerator(Number(b.dataset.generateTaps))));
    host.querySelectorAll('[data-add-tap-row]').forEach(b=>b.addEventListener('click',()=>{const c=state.tap_changers[Number(b.dataset.addTapRow)];c.positions.push({position_no:c.positions.length+1,label:'Tap '+(c.positions.length+1),voltage_kv:'',percent_change:'',is_neutral:false,notes:''});renderTapChangers();updateCounts();markDirty();}));
    host.querySelectorAll('[data-copy-taps]').forEach(b=>b.addEventListener('click',()=>copyGrid(state.tap_changers[Number(b.dataset.copyTaps)].positions.map(p=>[p.position_no,p.label,p.voltage_kv,p.percent_change,p.is_neutral?'Sí':'No',p.notes].join('\t')).join('\n'))));
    state.tap_changers.forEach((c,i)=>buildGrid($('#tap-grid-'+i),c.positions,[{key:'position_no',label:'Posición',type:'number'},{key:'label',label:'Etiqueta',type:'text'},{key:'voltage_kv',label:'Tensión (kV)',type:'number'},{key:'percent_change',label:'Variación (%)',type:'number'},{key:'is_neutral',label:'Neutro',type:'check'},{key:'notes',label:'Observaciones',type:'text'}],(row,key,value)=>{row[key]=value;markDirty();updateCounts();}));
  }

  let tapGeneratorIndex=null;
  function openTapGenerator(index){
    tapGeneratorIndex=index;
    const changer=state.tap_changers[index];
    $('#tapRowsCount').value=String(changer.positions.length||transformer.num_taps||27);
    $('#tapRowsModal').classList.remove('hidden');
    $('#tapRowsCount').focus();$('#tapRowsCount').select();
  }
  function closeTapGenerator(){tapGeneratorIndex=null;$('#tapRowsModal').classList.add('hidden');}
  $('#cancelTapRows').addEventListener('click',closeTapGenerator);
  $('#cancelTapRowsAlt').addEventListener('click',closeTapGenerator);
  $('#tapRowsModal').addEventListener('click',e=>{if(e.target===$('#tapRowsModal'))closeTapGenerator();});
  $('#confirmTapRows').addEventListener('click',()=>{
    const n=Number($('#tapRowsCount').value);
    if(!Number.isInteger(n)||n<1||n>1000){toast('Ingresa una cantidad entera entre 1 y 1000.',true);return;}
    const c=state.tap_changers[tapGeneratorIndex];if(!c)return;
    if(n<c.positions.length){const removed=c.positions.slice(n).some(p=>p.voltage_kv!==''||p.percent_change!==''||p.is_neutral||String(p.notes||'').trim()||String(p.label||'').trim()!==('Tap '+(c.positions.indexOf(p)+1)));if(removed&&!confirm('Al reducir la cantidad se eliminarán las filas posteriores al nuevo límite. ¿Deseas continuar?'))return;}
    c.positions=Array.from({length:n},(_,i)=>c.positions[i]||({position_no:i+1,label:'Tap '+(i+1),voltage_kv:'',percent_change:'',is_neutral:false,notes:''}));
    c.min_position=1;c.max_position=n;
    renderTapChangers();updateCounts();markDirty();closeTapGenerator();toast(n+' posiciones preparadas. Completa los valores de placa.');
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#tapRowsModal').classList.contains('hidden'))closeTapGenerator();});

  function refreshWindingCounters(){
    $$('[data-winding-stats]').forEach(el=>{
      const i=Number(el.dataset.windingStats),w=state.windings[i];
      if(w)el.textContent=`${w.terminals.length} registros · ${w.terminals.filter(t=>t.has_capacitive_bushing).length} bushings capacitivos`;
    });
  }

  function updateCounts(){
    $('#windingCount').textContent=state.windings.length;
    refreshWindingCounters();
    $('#tapCount').textContent=state.tap_changers.reduce((sum,c)=>sum+c.positions.length,0);

  }
  function renderReview(){
    const terminals=state.windings.reduce((n,w)=>n+w.terminals.length,0),bushings=state.windings.reduce((n,w)=>n+w.terminals.filter(t=>t.has_capacitive_bushing).length,0),taps=state.tap_changers.reduce((n,c)=>n+c.positions.length,0);
    $('#reviewSummary').innerHTML=`<div class="review-stat"><small>Bobinados</small><strong>${state.windings.length}</strong><span>Configurados</span></div><div class="review-stat"><small>Bornes</small><strong>${terminals}</strong><span>Terminales</span></div><div class="review-stat"><small>Bushings capacitivos</small><strong>${bushings}</strong><span>Identificados</span></div><div class="review-stat"><small>Conmutadores</small><strong>${state.tap_changers.length}</strong><span>Configurados</span></div><div class="review-stat"><small>Posiciones de tap</small><strong>${taps}</strong><span>Registradas</span></div><div class="review-stat"><small>Grupo vectorial</small><strong>${esc(state.vector_group||'—')}</strong><span>${esc(state.phase_count)} fase(s) · ${esc(state.frequency_hz)} Hz</span></div>`+
      state.windings.map((w,i)=>`<div class="review-winding"><h4>${i+1}. ${esc(w.name)} · ${esc(w.voltage_kv||'—')} kV · ${esc(w.connection_type||'Conexión pendiente')}</h4><p>${esc(w.terminals.length)} bornes · Material: ${esc(w.conductor_material||'No indicado')}</p><div class="review-tags">${w.terminals.map(t=>`<span>${esc(t.code||'Sin código')} · ${esc(t.phase||'—')}${t.has_capacitive_bushing?' · C1':''}</span>`).join('')}</div></div>`).join('');
    $('#versionBadge').textContent='Versión '+(state.version_no||0);
    $('#versionList').innerHTML=(state.versions||[]).length?state.versions.map(v=>`<div class="version-row"><b>Versión ${v.version_no}</b><span>${esc(v.created_at||'')}</span></div>`).join(''):'<div class="empty-history">Todavía no hay versiones guardadas.</div>';
  }

  function collectPayload(){
    return {transformer_key:transformer.key,phase_count:Number($('#phaseCount').value||3),vector_group:$('#vectorGroup').value.trim(),frequency_hz:$('#frequency').value,notes:$('#generalNotes').value,windings:state.windings.map(w=>({...w,terminals:w.terminals.filter(t=>String(t.code||'').trim()!=='').map(t=>({...t,bushing:t.bushing||{}}))})),tap_changers:state.tap_changers};
  }
  function validateConfiguration(){
    const errors=[];const codes=new Set();
    state.windings.forEach((w,wi)=>{
      const code=(w.code||'').trim().toUpperCase();
      if(!w.name.trim())errors.push(`El bobinado ${wi+1} necesita un nombre.`);
      if(!code)errors.push(`El bobinado ${wi+1} necesita un código.`);
      else if(codes.has(code))errors.push(`El código de bobinado ${code} está repetido.`);else codes.add(code);
      const terminalCodes=new Set();
      w.terminals.forEach((t,ti)=>{
        const terminal=(t.code||'').trim().toUpperCase();
        const b=t.bushing||{};
        const hasBushingData=!!(t.has_capacitive_bushing||b.serial_number||b.manufacturer||b.model||b.rated_voltage_kv||b.capacitance_pf||b.power_factor_percent||b.notes);
        if(!terminal&&!t.phase&&!hasBushingData)return; // Fila vacía de trabajo: no impide guardar.
        if(!terminal)errors.push(`Falta el código del borne ${ti+1} en ${w.name||'el bobinado '+(wi+1)}.`);
        else if(terminalCodes.has(terminal))errors.push(`El borne ${terminal} está repetido en ${w.name||'el bobinado '+(wi+1)}.`);else terminalCodes.add(terminal);
      });
    });
    state.tap_changers.forEach((c,ci)=>{
      if(!state.windings[c.winding_index])errors.push(`El conmutador ${ci+1} debe estar asociado a un bobinado.`);
      const seen=new Set();
      c.positions.forEach((p,pi)=>{
        const n=Number(p.position_no);
        if(p.position_no===null||String(p.position_no).trim()==='')return;
        if(!Number.isInteger(n)||n<1)errors.push(`Hay una posición sin número entero positivo en ${c.name||'el conmutador '+(ci+1)}.`);
        else if(seen.has(n))errors.push(`La posición ${n} está duplicada en ${c.name||'el conmutador '+(ci+1)}.`);else seen.add(n);
      });
    });
    return errors;
  }

  async function saveConfig(){
    if(!state.windings.length){toast('Debes configurar al menos un bobinado.',true);showPanel('windings');return;}
    const validationErrors=validateConfiguration();if(validationErrors.length){toast(validationErrors[0],true);showPanel(validationErrors[0].includes('posición')?'taps':'windings');return;}
    if(PILOT.demo){toast('Estás en modo demostración. Conecta MySQL y selecciona un registro real de transformers para guardar.',true);return;}
    if(!PILOT.schemaReady){toast('Importa database/schema.sql en la base de datos del sistema.',true);return;}
    const btns=[$('#saveConfig'),$('#saveConfigBottom')].filter(Boolean);btns.forEach(b=>{b.disabled=true;b.textContent='Guardando...';});
    try{
      const response=await fetch(api('action=save'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(collectPayload())});
      const result=await readApiResponse(response);
      state.version_no=result.result.version_no;state.versions.unshift({version_no:state.version_no,created_at:new Date().toLocaleString('es-PE')});dirty=false;$('#saveStatus').classList.add('saved');$('#saveStatus').innerHTML='<i></i>Guardado';$('#versionBadge').textContent='Versión '+state.version_no;renderReview();toast('Configuración guardada como versión '+state.version_no+'.');
    }catch(error){toast(error.message,true);}finally{btns.forEach(b=>{b.disabled=false;b.innerHTML='<svg><use href="#i-check"/></svg>Guardar configuración';});}
  }
  $('#saveConfig').addEventListener('click',saveConfig);$('#saveConfigBottom').addEventListener('click',saveConfig);

  // Search the existing transformers table; the displayed code is not assumed to be its PK.
  let searchTimer=null;
  $('#globalSearch').addEventListener('input',()=>{clearTimeout(searchTimer);const q=$('#globalSearch').value.trim();if(q.length<2){$('#searchResults').classList.remove('open');return;}searchTimer=setTimeout(()=>searchTransformers(q),250);});
  async function searchTransformers(q){
    try{const r=await fetch(api('action=search&q='+encodeURIComponent(q)));const d=await readApiResponse(r);const box=$('#searchResults');box.innerHTML=d.items.length?d.items.map(t=>`<div class="search-item" data-key="${esc(t.key)}"><strong>${esc(t.code)}</strong><small>${esc(t.company)} · ${esc(t.name)}</small></div>`).join(''):'<div class="search-item"><strong>Sin resultados</strong><small>No se encontraron coincidencias en transformers.</small></div>';box.classList.add('open');box.querySelectorAll('[data-key]').forEach(item=>item.addEventListener('click',()=>selectTransformer(item.dataset.key)));}
    catch(e){toast(e.message,true);}
  }
  async function selectTransformer(key){
    try{const r=await fetch(api('action=load&key='+encodeURIComponent(key)));const d=await readApiResponse(r);Object.assign(transformer,d.transformer);state=normalizeConfig(d.config||{});PILOT.demo=false;PILOT.transformerFound=true;PILOT.schemaReady=!!d.schemaReady;PILOT.testsSchemaReady=!!d.testsSchemaReady;updateTransformerDisplay();const status=$('#pilotStatus');if(status){status.className='pilot-status '+(PILOT.schemaReady&&PILOT.testsSchemaReady?'ready':'warning');status.querySelector('strong').textContent=PILOT.schemaReady&&PILOT.testsSchemaReady?'Base de datos conectada':'Faltan tablas del piloto';status.querySelector('span').textContent='BD: '+(PILOT.dbName||'configurada')+' · Transformador: '+transformer.code;}$('#globalSearch').value='';$('#searchResults').classList.remove('open');renderWindings();renderTapChangers();updateCounts();const dbAlert=$('#dbAlert');if(dbAlert){const message=!PILOT.dbConnected?'No hay conexión con la base de datos. Revisa la configuración de conexión.':(!PILOT.schemaReady?'Falta preparar el almacenamiento de la configuración eléctrica.':'');dbAlert.querySelector('span').textContent=message;dbAlert.classList.toggle('hidden',!message);}markDirty();toast('Transformador '+transformer.code+' seleccionado.');backOverview();}
    catch(e){toast(e.message,true);}
  }
  function updateTransformerDisplay(){
    $('#transformerCode').textContent=transformer.code;$('#summaryCode').textContent=transformer.code;$('#companyName').textContent=transformer.company;$('#summaryCompany').textContent=transformer.company;
    $('#summaryTag').textContent='TAG '+(transformer.tag||'—');$('#summaryVoltage').textContent=transformer.voltage||'—';$('#summaryPower').textContent=transformer.power||'—';$('#summaryYear').textContent=transformer.year||'—';$('#summaryBrand').textContent=transformer.brand||'—';$('#summaryTapType').textContent=transformer.tap_type||'—';$('#summaryVector').textContent=transformer.vector_group||'—';$('#summaryLocation').textContent=transformer.location||'—';$('#summaryTechnicalDetails').textContent=[transformer.phase_count?transformer.phase_count+' fases':'',transformer.frequency_hz?transformer.frequency_hz+' Hz':'',transformer.insulation_type||'',transformer.cooling_type||''].filter(Boolean).join(' · ');
  }
  document.addEventListener('click',e=>{if(!e.target.closest('.global-search'))$('#searchResults').classList.remove('open');});
  $('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Escape')$('#searchResults').classList.remove('open');});
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});

  

  // ---------------- Fechas e historial de ejecuciones de pruebas eléctricas ----------------
  // testCatalog se declara al inicio para que el manejador de clics temprano pueda usarlo.

  let testExecutions = [];
  let testCatalogLoaded = false;
  const testPage=$('#testPage'), executionPage=$('#executionPage');
  function showOnlyMain(which){['overviewPage','configPage','testPage','executionPage'].forEach(id=>$('#'+id).classList.toggle('hidden',id!==which));}
  function openTests(){showOnlyMain('testPage');loadTestHistory();}
  $('#openElectricalTests').addEventListener('click',e=>{e.preventDefault();openTests();});
  $('#backFromTests').addEventListener('click',()=>showOnlyMain('overviewPage'));
  $('#cancelExecution').addEventListener('click',()=>{showOnlyMain('testPage');loadTestHistory();});

  function typeName(code){return (testCatalog.find(x=>x[0]===code)||[])[1]||code||'Prueba';}
  function formatExecutionDate(value){if(!value)return '—';const d=new Date(String(value).replace(' ','T'));return Number.isNaN(d.getTime())?value:d.toLocaleString('es-PE',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}
  function testStats(){
    const total=testExecutions.length, completed=testExecutions.filter(x=>x.status==='COMPLETADA').length;
    const last=testExecutions[0]?.executed_at;
    $('#testStats').innerHTML=`<div class="test-stat"><small>Ejecuciones registradas</small><strong>${total}</strong><span>Historial de este transformador</span></div><div class="test-stat"><small>Completadas</small><strong>${completed}</strong><span>Con estado completado</span></div><div class="test-stat"><small>Tipos con registros</small><strong>${new Set(testExecutions.map(x=>x.test_code)).size}</strong><span>De ${testCatalog.length} pruebas disponibles</span></div><div class="test-stat"><small>Última ejecución</small><strong class="test-stat-date">${last?esc(formatExecutionDate(last)):'Sin registros'}</strong><span>Fecha de realización</span></div>`;
  }
  function renderTestTypes(){
    $('#testTypeGrid').innerHTML=testCatalog.map(t=>{
      const items=testExecutions.filter(x=>x.test_code===t[0]);
      const last=items[0]?.executed_at;
      return `<button class="test-type-card" type="button" data-new-test="${t[0]}"><span class="test-type-icon"><svg><use href="#i-zap"/></svg></span><span class="test-type-copy"><b>${esc(t[1])}</b><small>${esc(t[2])}</small><em>${items.length?items.length+' registro(s) · último '+esc(formatExecutionDate(last)):'Sin registros todavía'}</em></span><span class="test-type-arrow">＋</span></button>`;
    }).join('');
    $$('[data-new-test]').forEach(b=>b.addEventListener('click',()=>startExecution(b.dataset.newTest)));
  }

  function renderHistoricalAnalytics(){
    const monthly=new Map(),types=new Map();
    testExecutions.forEach(x=>{
      const d=new Date(String(x.executed_at||'').replace(' ','T'));
      if(!Number.isNaN(d.getTime())){const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');monthly.set(k,(monthly.get(k)||0)+1);}
      const name=x.test_name||typeName(x.test_code);types.set(name,(types.get(name)||0)+1);
    });
    const keys=[...monthly.keys()].sort().slice(-8),max=Math.max(1,...keys.map(k=>monthly.get(k)));
    $('#analyticsPeriod').textContent=keys.length?keys[0]+' — '+keys[keys.length-1]:'Sin datos';
    const chart=$('#monthlyExecutionChart');
    if(!keys.length)chart.innerHTML='<div class="analytics-empty">Registra ejecuciones para visualizar la evolución mensual.</div>';
    else{
      const width=560,height=190,left=30,bottom=32,top=16,plotH=height-top-bottom,slot=(width-left-12)/keys.length,barW=Math.min(42,slot*.58);
      const bars=keys.map((k,i)=>{const val=monthly.get(k),h=val/max*plotH,x=left+i*slot+(slot-barW)/2,y=top+plotH-h;const label=k.slice(5)+'/'+k.slice(2,4);return `<g><rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="#3985c8"/><text x="${x+barW/2}" y="${Math.max(11,y-5)}" text-anchor="middle" font-size="10" fill="currentColor">${val}</text><text x="${x+barW/2}" y="${height-9}" text-anchor="middle" font-size="10" fill="currentColor">${label}</text></g>`;}).join('');
      chart.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Ejecuciones por mes">${[0,.5,1].map(v=>`<line x1="${left}" x2="${width-8}" y1="${top+plotH*(1-v)}" y2="${top+plotH*(1-v)}" stroke="#dfe6ee" stroke-dasharray="3 4"/>`).join('')}${bars}</svg>`;
    }
    const list=$('#testTypeAnalytics');
    const total=[...types.values()].reduce((a,b)=>a+b,0);
    list.innerHTML=total?[...types.entries()].sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<div class="type-analytics-row"><div><span>${esc(name)}</span><b>${count}</b></div><div class="type-analytics-track"><i style="width:${Math.round(count/total*100)}%"></i></div></div>`).join(''):'<div class="analytics-empty">Todavía no hay pruebas registradas.</div>';
  }
  function renderTestHistory(){
    testStats();renderTestTypes();renderHistoricalAnalytics();
    const q=($('#testHistoryFilter')?.value||'').trim().toLocaleLowerCase();
    const filtered=testExecutions.filter(x=>(x.test_name||typeName(x.test_code)).toLocaleLowerCase().includes(q)||(x.operator_name||'').toLocaleLowerCase().includes(q));
    $('#testHistoryBody').innerHTML=filtered.length?filtered.map(x=>`<tr><td><b>${esc(formatExecutionDate(x.executed_at))}</b><small>ID #${esc(x.id)}</small></td><td>${esc(x.test_name||typeName(x.test_code))}</td><td>${esc(x.operator_name||'—')}</td><td>${Number(x.measurement_count||0)} fila(s)</td><td><span class="execution-status ${x.status==='COMPLETADA'?'done':'draft'}">${x.status==='COMPLETADA'?'Completada':'Borrador'}</span></td><td><button class="btn small" data-open-execution="${x.id}" title="Editar esta ejecución">Editar</button></td></tr>`).join(''):'<tr><td colspan="6" class="test-empty">'+(testExecutions.length?'No hay registros que coincidan con el filtro.':'Aún no hay registros. Selecciona una prueba para registrar la primera ejecución.')+'</td></tr>';
    $$('[data-open-execution]').forEach(b=>b.addEventListener('click',()=>openExistingExecution(Number(b.dataset.openExecution))));
  }
  $('#testHistoryFilter').addEventListener('input',renderTestHistory);
  async function loadTestHistory(){
    if(PILOT.demo){testExecutions=[];renderTestHistory();return;}
    if(!PILOT.testsSchemaReady){testExecutions=[];renderTestHistory();toast('Importa database/schema.sql para habilitar el historial de ejecuciones.',true);return;}
    try{
      const [r,ct]=await Promise.all([fetch(api('action=test-list&key='+encodeURIComponent(transformer.key))),fetch(api('action=test-types'))]);
      const d=await readApiResponse(r), c=await readApiResponse(ct);
      testExecutions=d.items||[];if(ct.ok&&c.ok&&c.items?.length){testCatalog.splice(0,testCatalog.length,...c.items.filter(x=>x.code!=='PLAN').map(x=>[x.code,x.name,'Formato LAP']));}
      renderTestHistory();
    }catch(e){testExecutions=[];renderTestHistory();toast(e.message,true);}
  }
  function clearExecutionForm(){
    activeExecutionId=null;activeExecutionMode='new';activeSpecificCode='';if($('#specificTestRows'))$('#specificTestRows').innerHTML='';
    ['executionOperator','executionSupervisor','executionStandard','executionEquipment','executionEquipmentBrand','executionEquipmentModel','executionEquipmentSerial','executionOilTemp','executionAmbientTemp','executionHumidity','executionObservations'].forEach(id=>$('#'+id).value='');
    $('#executionStatus').value='BORRADOR';$('#executionDate').value=localDateTime();
    renderMeasurementRows([{parameter:'',value:'',unit:'',notes:''},{parameter:'',value:'',unit:'',notes:''},{parameter:'',value:'',unit:'',notes:''}]);renderTtrRows([]);
    $('#executionTitle').textContent='Nueva ejecución de prueba';
    const saveButton=$('#saveExecution');if(saveButton)saveButton.innerHTML='<svg><use href="#i-check"/></svg>Guardar registro';
  }
  function fillTypeOptions(selected){$('#executionType').innerHTML=testCatalog.map(t=>'<option value="'+esc(t[0])+'" '+(t[0]===selected?'selected':'')+'>'+esc(t[1])+'</option>').join('');}
  function startExecution(code){
    clearExecutionForm();fillTypeOptions(code);toggleTestTemplate();
    $('#executionTitle').textContent='Nueva ejecución · '+typeName(code);
    showOnlyMain('executionPage');
  }
  function renderMeasurementRows(rows){
    $('#measurementRows').innerHTML=(rows||[]).map((r,i)=>`<tr><td class="measurement-row-number">${i+1}</td><td><input class="measurement-cell" data-r="${i}" data-c="0" value="${esc(r.parameter||'')}" placeholder="Ej. Tap 1 / U-N"></td><td><input class="measurement-cell numeric" data-r="${i}" data-c="1" value="${esc(r.value??'')}" placeholder="Valor"></td><td><input class="measurement-cell" data-r="${i}" data-c="2" value="${esc(r.unit||'')}" placeholder="Unidad"></td><td><input class="measurement-cell" data-r="${i}" data-c="3" value="${esc(r.notes||'')}" placeholder="Observación"></td><td><button type="button" class="measurement-delete" data-delete-row="${i}" title="Eliminar fila">×</button></td></tr>`).join('');
    $$('#measurementRows [data-delete-row]').forEach(b=>b.addEventListener('click',()=>{const a=collectMeasurementRows();a.splice(Number(b.dataset.deleteRow),1);renderMeasurementRows(a);}));
  }
  function collectMeasurementRows(){return $$('#measurementRows tr').map(tr=>{const a=$$('.measurement-cell',tr);return {parameter:a[0]?.value||'',value:a[1]?.value||'',unit:a[2]?.value||'',notes:a[3]?.value||''};});}
  $('#addMeasurementRow').addEventListener('click',()=>{const a=collectMeasurementRows();a.push({parameter:'',value:'',unit:'',notes:''});renderMeasurementRows(a);const n=$$('#measurementRows .measurement-cell').length;$('#measurementRows .measurement-cell')[n-4]?.focus();});
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
      fillTypeOptions(x.test_code);$('#executionType').value=x.test_code;toggleTestTemplate();
      if(x.test_code==='TTR')renderTtrRows(ttrRowsFromMeasurements(x.measurements||[]));
      else if(specificTemplates[x.test_code])renderSpecificRows(specificRowsFromMeasurements(x.measurements||[],x.test_code),x.test_code);
      else renderMeasurementRows(x.measurements||[]);
      $('#executionDate').value=String(x.executed_at||'').replace(' ','T').slice(0,16);
      $('#executionStatus').value=x.status||'BORRADOR';
      $('#executionOperator').value=x.operator_name||'';$('#executionSupervisor').value=x.supervisor_name||'';
      $('#executionStandard').value=x.standard_reference||'';$('#executionEquipment').value=x.equipment_name||'';
      $('#executionEquipmentBrand').value=x.equipment_brand||'';$('#executionEquipmentModel').value=x.equipment_model||'';
      $('#executionEquipmentSerial').value=x.equipment_serial||'';$('#executionOilTemp').value=x.oil_temperature_c??'';
      $('#executionAmbientTemp').value=x.ambient_temperature_c??'';$('#executionHumidity').value=x.relative_humidity_percent??'';
      $('#executionObservations').value=x.observations||'';
      $('#executionTitle').textContent='Editar ejecución #'+activeExecutionId+' · '+(x.test_name||typeName(x.test_code));
      $('#saveExecution').innerHTML='<svg><use href="#i-check"/></svg>Actualizar registro';
      showOnlyMain('executionPage');
    }catch(e){toast(e.message,true);}
  }
  // TTR: fórmulas reproducidas del protocolo LAP, hoja protocolos.
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
      <td><input class="ttr-cell" data-r="${i}" data-c="0" value="${esc(r.tap||i+1)}"></td>
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
    return $$('#ttrRows tr').map(tr=>{const a=$$('.ttr-cell',tr);return {tap:a[0]?.value||'',at:a[1]?.value||'',bt:a[2]?.value||'',theoretical:a[3]?.value||'',U:a[4]?.value||'',errU:a[5]?.value||'',V:a[6]?.value||'',errV:a[7]?.value||'',W:a[8]?.value||'',errW:a[9]?.value||'',notes:a[10]?.value||''};}).filter(r=>Object.values(r).some(v=>String(v).trim()!==''));
  }
  function ttrToMeasurements(){
    const out=[];collectTtrRows().map(ttrCalc).forEach(r=>['at','bt','theoretical','U','errU','V','errV','W','errW','notes'].forEach(k=>{const value=r[k]||'';if(value!=='')out.push({parameter:`TTR|${r.tap}|${k}`,value,unit:k.startsWith('err')?'%':(k==='notes'?'':(k==='at'||k==='bt'?'kV':'ratio')),notes:''});}));return out;
  }
  function normalizeSpecificRow(code,row){
    const out={...(row||{})};
    if(code==='INSULATION_RESISTANCE'){
      const raw30=String(out.reading_30s??'').trim().replace(',','.');
      const raw1=String(out.reading_1min??'').trim().replace(',','.');
      const n30=raw30===''?NaN:Number(raw30);
      const n1=raw1===''?NaN:Number(raw1);
      out.absorption_index=raw30!==''&&raw1!==''&&Number.isFinite(n30)&&n30!==0&&Number.isFinite(n1)?String(n1/n30):'';
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
    if(code==='POWER_FACTOR')list=list.map(r=>({...r,measurement:r.measurement||r.point||'',test_mode:r.test_mode||r.mode||'',test_voltage_v:r.test_voltage_v||r.test_voltage||'',capacitance_nf:r.capacitance_nf||r.capacitance||'',power_factor_measured:r.power_factor_measured||r.power_factor||'',output_current_a:r.output_current_a||r.current||'',notes:r.notes||''}));
    if(code==='BUSHING')list=list.map(r=>({...r,power_factor:r.power_factor||r.power_factor_measured||'',capacitance:r.capacitance||r.capacitance_measured||'',test_voltage:r.test_voltage||r.test_voltage_kv||'',serial:r.serial||r.serial_number||''}));
    return list.map(r=>normalizeSpecificRow(code,r));
  }
  function renderSpecificRows(rows,code){
    const cfg=specificTemplates[code];if(!cfg)return;
    $('#specificTestHead').innerHTML='<tr>'+cfg.cols.map(c=>'<th>'+esc(c[1])+'</th>').join('')+'</tr>';
    $('#specificTestRows').innerHTML=(rows||[]).map((raw,i)=>{
      const row=normalizeSpecificRow(code,raw);
      return '<tr>'+cfg.cols.map(([key],c)=>{
        const readonly=key==='absorption_index'?' readonly title="R a 1 min / R a 30 s"':'';
        return '<td><input class="specific-cell" data-r="'+i+'" data-c="'+c+'" value="'+esc(row[key]??'')+'"'+readonly+'></td>';
      }).join('')+'</tr>';
    }).join('');
  }
  function collectSpecificRows(){
    const cfg=specificTemplates[activeSpecificCode];if(!cfg)return[];
    return $$('#specificTestRows tr').map(tr=>{const o={};$$('.specific-cell',tr).forEach((e,i)=>o[cfg.cols[i][0]]=e.value);return normalizeSpecificRow(activeSpecificCode,o);}).filter(r=>Object.entries(r).some(([k,v])=>k!=='absorption_index'&&String(v).trim()!==''));
  }
  function specificToMeasurements(){
    const cfg=specificTemplates[activeSpecificCode],out=[];if(!cfg)return out;
    collectSpecificRows().forEach((r,i)=>cfg.cols.forEach(([k])=>{if(r[k]!==''&&r[k]!==null&&r[k]!==undefined)out.push({parameter:cfg.prefix+'|'+(i+1)+'|'+k,value:String(r[k]),unit:'',notes:''});}));
    return out;
  }
  function toggleTestTemplate(){
    const code=$('#executionType')?.value,isTtr=code==='TTR',isSpecific=!!specificTemplates[code];
    $('#ttrEditor')?.classList.toggle('hidden',!isTtr);
    $('#specificTestEditor')?.classList.toggle('hidden',!isSpecific);
    $('#measurementGenericCard')?.classList.toggle('hidden',isTtr||isSpecific);
    if(activeSpecificCode!==code && $('#specificTestRows'))$('#specificTestRows').innerHTML='';
    activeSpecificCode=isSpecific?code:'';
    if(isSpecific){const cfg=specificTemplates[code];$('#specificTestTitle').textContent=cfg.title;$('#specificTestHint').textContent=cfg.hint;if(!$('#specificTestRows').children.length)renderSpecificRows(Array.from({length:Math.max(3,(state.windings||[]).length)},()=>({})),code);}

    if(isTtr && !$('#ttrRows').children.length){
      const configured=(state.tap_changers||[]).reduce((n,c)=>Math.max(n,(c.positions||[]).length),0);const count=Math.max(5,configured,Number(transformer.num_taps||0));
      renderTtrRows(Array.from({length:Math.min(count,100)},(_,i)=>({tap:i+1})));
    }
  }

  $('#specificAddRows')?.addEventListener('click',()=>renderSpecificRows([...collectSpecificRows(),{},{},{},{},{}],activeSpecificCode));
  $('#specificTestRows')?.addEventListener('input',e=>{
    if(activeSpecificCode!=='INSULATION_RESISTANCE'||!e.target.matches('.specific-cell'))return;
    const tr=e.target.closest('tr');if(!tr)return;
    const raw30=String(tr.querySelector('[data-c="3"]')?.value||'').trim().replace(',','.');
    const raw1=String(tr.querySelector('[data-c="5"]')?.value||'').trim().replace(',','.');
    const r30=raw30===''?NaN:Number(raw30),r1=raw1===''?NaN:Number(raw1);
    const target=tr.querySelector('[data-c="6"]');
    if(target)target.value=raw30!==''&&raw1!==''&&Number.isFinite(r30)&&r30!==0&&Number.isFinite(r1)?String(r1/r30):'';
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
    if(e.key==='Enter'||e.key==='ArrowDown'){e.preventDefault();r++;}else if(e.key==='ArrowUp'){e.preventDefault();r--;}else if(e.key==='Tab'){e.preventDefault();c+=e.shiftKey?-1:1;if(c>=max){c=0;r++;}if(c<0){c=max-1;r=Math.max(0,r-1);}}else return;
    const rows=collectSpecificRows();while(r>=rows.length)rows.push({});renderSpecificRows(rows,activeSpecificCode);$(`#specificTestRows [data-r="${r}"][data-c="${c}"]`)?.focus();
  });
  $('#executionType').addEventListener('change',()=>{toggleTestTemplate();});
  $('#ttrAddRows').addEventListener('click',()=>{
    const rows=collectTtrRows();const start=rows.length?Math.max(...rows.map(r=>Number(r.tap)||0))+1:1;
    for(let i=0;i<5;i++)rows.push({tap:start+i});
    renderTtrRows(rows);
  });
  $('#ttrRows').addEventListener('input',e=>{if(!e.target.matches('.ttr-cell')||[3,5,7,9].includes(Number(e.target.dataset.c)))return;const rows=collectTtrRows();renderTtrRows(rows);const r=Number(e.target.dataset.r),c=Number(e.target.dataset.c);$(`#ttrRows [data-r="${r}"][data-c="${c}"]`)?.focus();});
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
    else if(e.key==='Tab'){e.preventDefault();c+=e.shiftKey?-1:1;if(c>10){c=0;r++;}if(c<0){c=10;r=Math.max(0,r-1);}while([3,5,7,9].includes(c)){c+=e.shiftKey?-1:1;}}
    else return;
    const rows=collectTtrRows();while(r>=rows.length)rows.push({tap:rows.length+1});renderTtrRows(rows);
    $(`#ttrRows [data-r="${r}"][data-c="${c}"]`)?.focus();
  });

  async function saveExecution(){
    const date=$('#executionDate').value;if(!date){toast('Selecciona la fecha y hora en que se realizó la prueba.',true);$('#executionDate').focus();return;}
    const isEditing=activeExecutionId!==null;
    const code=$('#executionType').value;
    const measurements=code==='TTR'?ttrToMeasurements():(specificTemplates[code]?specificToMeasurements():collectMeasurementRows());
    const payload={id:activeExecutionId,transformer_key:transformer.key,test_code:code,executed_at:date,status:$('#executionStatus').value,operator_name:$('#executionOperator').value,supervisor_name:$('#executionSupervisor').value,standard_reference:$('#executionStandard').value,equipment_name:$('#executionEquipment').value,equipment_brand:$('#executionEquipmentBrand').value,equipment_model:$('#executionEquipmentModel').value,equipment_serial:$('#executionEquipmentSerial').value,oil_temperature_c:$('#executionOilTemp').value,ambient_temperature_c:$('#executionAmbientTemp').value,relative_humidity_percent:$('#executionHumidity').value,observations:$('#executionObservations').value,measurements};
    const btn=$('#saveExecution');btn.disabled=true;btn.textContent=isEditing?'Actualizando...':'Guardando...';
    try{
      if(PILOT.demo)throw new Error('Selecciona un transformador real antes de guardar.');
      if(!PILOT.testsSchemaReady)throw new Error('Prepara las tablas de pruebas eléctricas antes de guardar ejecuciones.');
      const r=await fetch(api('action=test-save'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const d=await readApiResponse(r);
      toast((isEditing?'Ejecución actualizada':'Prueba guardada')+' · Registro #'+d.result.id+' · '+formatExecutionDate(d.result.executed_at));
      showOnlyMain('testPage');await loadTestHistory();
    }catch(e){toast(e.message,true);}
    finally{btn.disabled=false;btn.innerHTML=activeExecutionMode==='edit'?'<svg><use href="#i-check"/></svg>Actualizar registro':'<svg><use href="#i-check"/></svg>Guardar registro';}
  }
  $('#saveExecution').addEventListener('click',saveExecution);

  // Navegación global habilitada después de inicializar el estado y las plantillas.
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!target) return;
    const next = target.closest('[data-next]');
    const newExecution = target.closest('#newTestExecution');
    try {
      if (next) {
        event.preventDefault();
        showPanel(next.dataset.next);
        return;
      }
      if (newExecution) {
        event.preventDefault();
        startExecution('TTR');
      }
    } catch (error) {
      console.error('No se pudo abrir la pantalla solicitada:', error);
      const status = document.querySelector('#pilotStatus');
      if (status) {
        status.className = 'pilot-status warning';
        const strong = status.querySelector('strong');
        const span = status.querySelector('span');
        if (strong) strong.textContent = 'No se pudo abrir la pantalla';
        if (span) span.textContent = error.message || 'Error de interfaz';
      } else {
        window.alert('No se pudo abrir la pantalla: ' + (error.message || error));
      }
    }
  });
    renderWindings();renderTapChangers();updateCounts();
  if(state.version_no>0){$('#saveStatus').classList.add('saved');$('#saveStatus').innerHTML='<i></i>Guardado';}
  window.addEventListener('error', function(ev){ const msg='Error de interfaz: '+(ev.message||'JavaScript'); const s=$('#pilotStatus'); if(s){s.className='pilot-status warning';s.querySelector('strong').textContent='Error al iniciar la interfaz';s.querySelector('span').textContent=msg;} });
  window.ELEC_PLAN_BRIDGE = {
    getTransformer: function(){ return transformer; },
    api: function(query){ return api(query); },
    readApiResponse: function(response){ return readApiResponse(response); },
    showPage: function(pageId){
      ['overviewPage','configPage','testPage','executionPage','planPage'].forEach(function(id){
        const node=document.getElementById(id);if(node)node.classList.toggle('hidden',id!==pageId);
      });
    },
    notify: function(message,isError){ toast(message,!!isError); },
    demo: function(){ return !!PILOT.demo; },
    testsReady: function(){ return !!PILOT.testsSchemaReady; }
  };

})()
