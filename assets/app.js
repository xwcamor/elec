(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const queryAll = (s, root = document) => [...root.querySelectorAll(s)];
  const clone = value => JSON.parse(JSON.stringify(value));
  // Indicador uniforme para cualquier campo marcado como obligatorio.
  function decorateRequiredLabels(root=document){
    const labels=[];
    if(root.matches?.('label'))labels.push(root);
    labels.push(...(root.querySelectorAll?.('label:has(input[required],select[required],textarea[required])')||[]));
    labels.forEach(label=>{
      const controls=label.querySelectorAll('input[required],select[required],textarea[required]');
      if(!controls.length||label.querySelector('.required-mark'))return;
      const marker=document.createElement('i');
      marker.className='required-mark';
      marker.textContent='*';
      marker.setAttribute('aria-hidden','true');
      const textSpan=[...label.children].find(el=>el.tagName==='SPAN'&&!el.classList.contains('required-mark'));
      if(textSpan){
        const clean=textSpan.textContent.replace(/\s*\*\s*$/,'').trimEnd();
        textSpan.textContent=clean+' ';
        textSpan.appendChild(marker);
      }else{
        const firstControl=controls[0];
        const leadingText=[...label.childNodes].find(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim());
        if(leadingText)leadingText.textContent=leadingText.textContent.replace(/\s*\*\s*$/,' ');
        label.insertBefore(marker,firstControl);
      }
    });
  }
  decorateRequiredLabels();
  const requiredLabelObserver=new MutationObserver(records=>{
    records.forEach(record=>record.addedNodes.forEach(node=>{
      if(node.nodeType===Node.ELEMENT_NODE)decorateRequiredLabels(node);
    }));
  });
  requiredLabelObserver.observe(document.documentElement,{childList:true,subtree:true});
  // Variables de estado declaradas al inicio para evitar accesos durante la TDZ.
  var state = null;
  // Estado de ejecución inicializado antes de registrar eventos globales.
  // var evita la zona temporal muerta si un clic ocurre durante la inicialización.
  const blankTerminal = (code, phase = '', type = 'Fase') => ({code, phase, type, has_capacitive_bushing: false, bushing: {serial_number:'',manufacturer:'',model:'',rated_voltage_kv:'',capacitance_pf:'',power_factor_percent:'',notes:''}});
  const API_URL = PILOT.apiUrl || 'api.php';
  const api = (query = '') => API_URL + (query ? '?' + query : '');

  async function readApiResponse(response) {
    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); }
    catch (_) { throw new Error('El servidor PHP no devolvió JSON. Revisa la ruta /pe/api.php y los errores de PHP en Laragon. Respuesta: ' + raw.slice(0,180)); }
    if (!response.ok || data.ok === false) {
      const message = data.message || ('Error HTTP ' + response.status);
      const detail = data.detail ? '\nDetalle técnico: ' + data.detail : '';
      throw new Error(message + detail);
    }
    return data;
  }
  const transformer = {...PILOT.transformer};
  let dirty = false;
  state = normalizeConfig(PILOT.config || {});
  let selectedTab = 'windings';

  const editFields = {
    code:'editTrafoCode',name:'editTrafoName',company:'editTrafoCompany',voltage:'editTrafoVoltage',
    power:'editTrafoPower',year:'editTrafoYear',brand:'editTrafoBrand',tap_type:'editTrafoTapType',
    num_taps:'editTrafoNumTaps',vector_group:'editTrafoVector',location:'editTrafoLocation',
    phase_count:'editTrafoPhaseCount',frequency_hz:'editTrafoFrequency',insulation_type:'editTrafoInsulation',cooling_type:'editTrafoCooling',notes:'editTrafoNotes'
  };
  let transformerFormMode='edit';
  function setTransformerFormMode(mode){
    transformerFormMode=mode;
    $('#editTransformerTitle').textContent=mode==='create'?'Crear transformador':(mode==='tap'?'Actualizar cantidad de TAP':'Editar transformador');
    $('#editTransformerSubtitle').textContent=mode==='create'?'Registra un nuevo equipo en la tabla de transformadores.':(mode==='tap'?'Actualiza únicamente la cantidad de posiciones TAP de la ficha técnica.':'Modifica los datos principales de la ficha.');
    $('#saveTransformerEdit').textContent=mode==='create'?'Crear transformador':(mode==='tap'?'Actualizar TAP':'Guardar cambios');
  }
  function openTransformerEditor(){
    setTransformerFormMode('edit');
    $('#transformerEditModal').classList.remove('tap-count-only');
    const vals={code:transformer.code,name:transformer.name||'',company:transformer.company||'',voltage:transformer.voltage??'',power:transformer.power??'',year:transformer.year??'',brand:transformer.brand||'',tap_type:transformer.tap_type||'',num_taps:transformer.num_taps??'',vector_group:transformer.vector_group||'',location:transformer.location||'',phase_count:transformer.phase_count??'',frequency_hz:transformer.frequency_hz??'',insulation_type:transformer.insulation_type||'',cooling_type:transformer.cooling_type||'',notes:transformer.notes||''};
    Object.entries(editFields).forEach(([key,id])=>$('#'+id).value=vals[key]??'');
    $('#editTransformerStatus').textContent='';$('#transformerEditModal').classList.remove('hidden');$('#editTrafoCode').focus();
  }
  function openTapCountEditor(){
    openTransformerEditor();
    setTransformerFormMode('tap');
    $('#editTrafoNumTaps').value=transformer.num_taps??'';
    $('#editTransformerStatus').textContent='';
    $('#transformerEditModal').classList.add('tap-count-only');
    $('#editTrafoNumTaps').focus();
  }
  function openTransformerCreate(){
    setTransformerFormMode('create');
    Object.values(editFields).forEach(id=>$('#'+id).value='');
    $('#editTrafoPhaseCount').value='3';$('#editTrafoFrequency').value='60';
    $('#editTransformerStatus').textContent='';$('#transformerEditModal').classList.remove('hidden');$('#editTrafoCode').focus();
  }
  function closeTransformerEditor(){$('#transformerEditModal').classList.add('hidden');$('#transformerEditModal').classList.remove('tap-count-only');setTransformerFormMode('edit');}
  $('#editTransformerBtn')?.addEventListener('click',openTransformerEditor);
  $('#closeTransformerModal')?.addEventListener('click',closeTransformerEditor);
  $('#cancelTransformerEdit')?.addEventListener('click',closeTransformerEditor);
  $('#transformerEditModal')?.addEventListener('click',e=>{if(e.target.id==='transformerEditModal')closeTransformerEditor();});
  $('#transformerEditForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const mode=transformerFormMode;
    const payload={};
    if(mode!=='create')payload.transformer_key=transformer.key;
    if(mode==='tap'){
      const count=$('#editTrafoNumTaps').value.trim();
      if(!Number.isInteger(Number(count))||Number(count)<1||Number(count)>150){$('#editTransformerStatus').textContent='La cantidad de TAP debe ser un entero entre 1 y 150.';return;}
      payload.num_taps=count;
    }else Object.entries(editFields).forEach(([key,id])=>payload[key]=$('#'+id).value.trim());
    const btn=$('#saveTransformerEdit');btn.disabled=true;btn.textContent=mode==='create'?'Creando...':'Guardando...';
    try{
      if(PILOT.demo)throw new Error('No hay conexión con MySQL. Conecta la base de datos para registrar transformadores.');
      const action=mode==='create'?'transformer-create':'transformer-update';
      const response=await fetch(api('action='+action),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await readApiResponse(response);
      if(mode==='edit'||mode==='tap'){
        Object.assign(transformer,result.transformer);
        updateTransformerDisplay();
        updateTapSourceSummary();
        await loadTransformerSwitcher(transformer.key);
        if(mode==='tap'){
          toast('Cantidad de TAP actualizada en la ficha técnica.');
        }else if(result.unsupported_fields?.length){
          const labels={phase_count:'número de fases',frequency_hz:'frecuencia',insulation_type:'aislamiento',cooling_type:'refrigeración',notes:'observaciones'};
          toast('Guardado parcial. Tu tabla no tiene columnas para: '+result.unsupported_fields.map(k=>labels[k]||k).join(', ')+'.',true);
        }else toast('Datos de placa del transformador actualizados.');
        closeTransformerEditor();
      }else{
        const createdKey=result.transformer.key;
        closeTransformerEditor();
        await loadTransformerSwitcher(createdKey);
        const switched=await selectTransformer(createdKey);
        if(!switched)await loadTransformerSwitcher(transformer.key);
        toast('Transformador '+result.transformer.code+(switched?' creado y seleccionado.':' creado. No se cambió el transformador activo.'));
      }
    }catch(err){$('#editTransformerStatus').textContent=err.message;toast(err.message,true);}
    finally{btn.disabled=false;btn.textContent=transformerFormMode==='create'?'Crear transformador':(transformerFormMode==='tap'?'Actualizar TAP':'Guardar cambios');}
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
      terminals: (w.terminals || []).filter(t => String(t.terminal_code || t.code || '').trim() !== '').map(t => ({
        code: t.terminal_code || t.code || '', phase: t.phase_code || t.phase || '', type: (t.terminal_type || t.type || 'Fase') === 'Terciario' ? 'Fase' : (t.terminal_type || t.type || 'Fase'),
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
    const phaseSource=transformer.phase_count!==null&&transformer.phase_count!==undefined&&transformer.phase_count!==''?transformer.phase_count:(config.phase_count||3);
    const frequencySource=transformer.frequency_hz!==null&&transformer.frequency_hz!==undefined&&transformer.frequency_hz!==''?transformer.frequency_hz:(config.frequency_hz??60);
    return {phase_count:Number(phaseSource),vector_group:String(transformer.vector_group||config.vector_group||''),frequency_hz:frequencySource,notes:config.notes || '',version_no:Number(config.version_no || 0),windings,tap_changers:tapChangers,versions:Array.isArray(config.versions) ? config.versions : []};
  }

  function hasSavedElectricalConfiguration(){
    return Number(state?.version_no || 0) > 0 && Array.isArray(state?.windings) && state.windings.length > 0;
  }
  function electricalTestsBlockReason(){
    if(PILOT.demo || !PILOT.transformerFound) return 'Selecciona un transformador real para habilitar las pruebas eléctricas.';
    if(!PILOT.schemaReady) return 'Falta preparar el almacenamiento de la configuración eléctrica.';
    if(!hasSavedElectricalConfiguration()) return 'No podrás entrar mientras no exista una configuración eléctrica guardada.';
    if(!PILOT.testsSchemaReady) return 'Faltan las tablas del módulo de pruebas eléctricas.';
    return '';
  }
  function refreshSidebarAccess(){
    const configured=hasSavedElectricalConfiguration();
    PILOT.configReady=configured;
    const configButton=$('#openConfig'),configState=$('#configNavState');
    if(configButton){
      configButton.classList.remove('is-unconfigured','is-configured');
      configButton.title=configured?'Configuración eléctrica guardada':'Falta completar la configuración eléctrica.';
    }
    if(configState && !configState.dataset.state){
      configState.dataset.state=configured?'partial':'missing';
    }
    const testsButton=$('#openElectricalTests'),lockIcon=$('#testsNavLock');
    const reason=electricalTestsBlockReason(),allowed=!reason;
    if(testsButton){
      testsButton.disabled=!allowed;
      testsButton.setAttribute('aria-disabled',allowed?'false':'true');
      testsButton.classList.toggle('is-locked',!allowed);
      testsButton.title=reason||'Abrir pruebas eléctricas';
    }
    if(lockIcon) lockIcon.classList.toggle('hidden',allowed);
  }
  refreshSidebarAccess();

  function markDirty() {
    dirty = true;
    const badge = $('#saveStatus');
    badge.classList.remove('saved');
    badge.innerHTML = '<i></i>Cambios sin guardar';
    refreshConfigStepIndicators();
  }
  function toast(message, bad = false) {
    const el = $('#toast'); if(!el)return;
    el.textContent = String(message||'');
    el.dataset.kind = bad ? 'error' : 'success';
    el.setAttribute('role',bad?'alert':'status');
    el.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => el.classList.remove('show'), 4200);
  }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function getWindingProgress(){
    const issues=validateConfiguration().filter(message=>/bobinado|borne/i.test(message));
    const complete=state.windings.length>0&&state.windings.every(w=>{
      const name=String(w.name||'').trim(),code=String(w.code||'').trim();
      const voltage=Number(w.voltage_kv);
      const terminals=(Array.isArray(w.terminals)?w.terminals:[]).filter(t=>!(t._draft&&!String(t.code||'').trim()&&!t.has_capacitive_bushing));
      return name!==''&&code!==''&&Number.isFinite(voltage)&&voltage>0&&
        terminals.length>0&&terminals.every(t=>String(t.code||'').trim()!=='');
    })&&issues.length===0;
    return {complete,issues};
  }
  function getTapProgress(){
    const tapData=state.tap_changers.length>0;
    const expectedCount=Number(transformer.num_taps||0);
    const issues=validateConfiguration().filter(message=>/conmutador|posición/i.test(message));
    const complete=tapData&&state.tap_changers.every(c=>{
      const positions=Array.isArray(c.positions)?c.positions:[];
      const numbers=positions.map(p=>Number(p.position_no));
      return !!state.windings[c.winding_index]&&positions.length>0&&
        positions.every(p=>String(p.position_no??'').trim()!==''&&Number.isInteger(Number(p.position_no))&&Number(p.position_no)>0)&&
        new Set(numbers).size===numbers.length;
    })&&issues.length===0;
    const expected=String(transformer.tap_type||'').trim()!==''||Number(transformer.num_taps||0)>0;
    return {complete,expected,optional:!tapData&&!expected,issues};
  }
  function showPanel(tab) {
    if(!['windings','taps','review'].includes(tab))return;
    const winding=getWindingProgress(),tap=getTapProgress();
    if(tab!=='windings'&&!winding.complete){
      toast(winding.issues[0]||'Completa los datos obligatorios de bobinados y bornes antes de continuar.',true);
      tab='windings';
    }else if(tab==='review'&&!tap.complete&&!tap.optional){
      toast(tap.issues[0]||'Completa los conmutadores y sus posiciones de TAP antes de revisar.',true);
      tab='taps';
    }
    selectedTab = tab;
    queryAll('.config-view-tab').forEach(b => {
      const active=b.dataset.tab===tab;
      b.classList.toggle('active',active);
      if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
    });
    queryAll('.config-panel').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== tab));
    if (tab === 'review') renderReview();
  }
  function syncTransformerNominals(){
    // Los datos nominales pertenecen a la ficha del transformador, no a esta configuración.
    if(transformer.phase_count!==null&&transformer.phase_count!==undefined&&transformer.phase_count!=='')state.phase_count=Number(transformer.phase_count);
    if(transformer.vector_group!==undefined)state.vector_group=String(transformer.vector_group||'');
    if(transformer.frequency_hz!==null&&transformer.frequency_hz!==undefined&&transformer.frequency_hz!=='')state.frequency_hz=transformer.frequency_hz;
  }
  function openConfig() {
    const tapCount=Number(transformer.num_taps||0);
    if(!Number.isInteger(tapCount)||tapCount<=0){
      toast('Antes de configurar eléctricamente, registra una cantidad de TAP mayor que cero en la ficha del transformador.',true);
      openTapCountEditor();
      return false;
    }
    syncTransformerNominals();
    updateTapSourceSummary();
    showOnlyMain('configPage');
    showPanel('windings');
    updateCounts();
    refreshConfigStepIndicators();
    return true;
  }
  function backOverview() { showOnlyMain('overviewPage'); }

  $('#openConfig').addEventListener('click', e => {e.preventDefault();openConfig();});
  $('#backOverview').addEventListener('click', backOverview);
  queryAll('.config-view-tab').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.tab)));
  queryAll('[data-prev]').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.prev)));
  syncTransformerNominals();

  function addWinding(data = {}) {
    const suffix = state.windings.length + 1;
    const prefix = data.code || ('W'+suffix);
    const phases = Number(state.phase_count) === 1 ? [['A'+suffix,'A','Fase']] : [['U'+suffix,'U','Fase'],['V'+suffix,'V','Fase'],['W'+suffix,'W','Fase']];
    if (data.has_neutral) phases.push(['N'+suffix,'N','Neutro']);
    state.windings.push({name:data.name || ('Bobinado '+suffix),code:prefix,voltage_kv:data.voltage_kv || '',connection_type:data.connection_type || '',has_neutral:!!data.has_neutral,conductor_material:data.conductor_material || '',notes:data.notes || '',terminals:data.terminals || phases.map(p=>blankTerminal(...p))});
    const newIndex=state.windings.length-1;
    markDirty(); renderWindings({openIndex:newIndex}); updateCounts();
    requestAnimationFrame(()=>{
      const card=$('#windingsContainer [data-winding="'+newIndex+'"]');
      if(!card)return;
      card.scrollIntoView({behavior:'smooth',block:'start'});
      card.querySelector('[data-wfield="name"]')?.focus({preventScroll:true});
    });
  }
  $('#addWinding').addEventListener('click', () => addWinding());
  function renderWindings(options = {}) {
    const host = $('#windingsContainer');
    const previouslyOpen = new Set([...host.querySelectorAll('[data-winding]')].filter(card=>card.open).map(card=>Number(card.dataset.winding)));
    if (Number.isInteger(options.openIndex)) previouslyOpen.add(options.openIndex);
    if (!state.windings.length) {
      host.innerHTML = `<div class="empty-state"><div style="font-size:22px;margin-bottom:6px">＋</div><b>No hay bobinados configurados</b><p>Agrega un bobinado o carga un ejemplo basado en tu Excel.</p><button class="btn primary" id="loadExample">Cargar estructura de ejemplo</button></div>`;
      $('#loadExample').addEventListener('click', loadExample); return;
    }
    host.innerHTML = state.windings.map((w,wi)=>`
      <details class="winding-card winding-accordion" data-winding="${wi}" data-state="${isWindingComplete(w)?'complete':'incomplete'}" ${(previouslyOpen.size?previouslyOpen.has(wi):wi===0)?'open':''}>
        <summary class="winding-accordion-summary">
          <span class="winding-index">${String(wi+1).padStart(2,'0')}</span>
          <span class="winding-summary-main"><strong>${esc(w.name||'Bobinado sin nombre')}</strong><small>${esc(w.voltage_kv||'—')} kV</small></span>
          <strong class="winding-summary-status" data-winding-status="${wi}" data-state="${isWindingComplete(w)?'complete':'incomplete'}">${isWindingComplete(w)?'Completo':'Faltan datos'}</strong><span class="accordion-chevron">⌄</span>
        </summary>
        <div class="winding-accordion-body">
          <section class="winding-data-section plan-test-meta-card">
            <div class="plan-test-meta-card-head"><b>Datos del bobinado</b></div>
            <div class="plan-test-meta-grid winding-head-fields">
              <label class="config-field"><span>Nombre del bobinado <i class="required-mark">*</i></span><input aria-label="Nombre bobinado" data-wfield="name" value="${esc(w.name)}" placeholder="Ej. Bobinado AT" required></label>
              <label class="config-field"><span>Tensión del bobinado (kV) <i class="required-mark">*</i></span><input class="w-voltage" aria-label="Tensión kV" data-wfield="voltage_kv" type="text" inputmode="decimal" value="${esc(w.voltage_kv)}" placeholder="Ej. 220" required></label>
            </div>
          </section>
          <section class="terminal-section">
            <div class="terminal-section-heading">
              <div class="terminal-section-title"><strong>Bornes y terminales</strong><small data-winding-stats="${wi}">${w.terminals.filter(t=>!(t._draft&&!String(t.code||'').trim()&&!t.has_capacitive_bushing)).length} bornes · ${w.terminals.filter(t=>t.has_capacitive_bushing).length} capacitivos</small></div>
              <div class="sheet-tools"><button type="button" data-add-terminal="${wi}">+ Fila</button></div>
            </div>
            <div class="terminal-section-content">
              <div class="sheet-wrap" id="terminal-grid-${wi}"></div>
              <div class="sheet-hint">Pega bloques desde Excel con Ctrl+V en la primera celda. Los datos del elemento capacitivo se registran por borne.</div>
            </div>
          </section>
          <div class="winding-card-actions"><hr><button type="button" class="text-remove" data-remove-winding="${wi}">Quitar bobinado</button></div>
        </div>
      </details>`).join('');
    host.querySelectorAll('[data-wfield]').forEach(el=>{el.addEventListener('input',e=>{const card=e.target.closest('[data-winding]'),i=Number(card.dataset.winding),key=e.target.dataset.wfield;if(key==='name'||key==='voltage_kv'){state.windings[i][key]=e.target.value;const summary=card.querySelector('.winding-summary-main');if(summary)summary.innerHTML='<strong>'+esc(state.windings[i].name||'Bobinado sin nombre')+'</strong><small>'+esc(state.windings[i].voltage_kv||'—')+' kV</small>';refreshWindingCounters();markDirty();}});el.addEventListener('change',e=>{const card=e.target.closest('[data-winding]');const i=Number(card.dataset.winding);const key=e.target.dataset.wfield;state.windings[i][key]=key==='has_neutral'?e.target.value==='1':(key==='voltage_kv'?normalizeNumeric(e.target.value):e.target.value);if(key==='voltage_kv')e.target.value=state.windings[i][key];const summary=card.querySelector('.winding-summary-main');if(summary)summary.innerHTML='<strong>'+esc(state.windings[i].name||'Bobinado sin nombre')+'</strong><small>'+esc(state.windings[i].voltage_kv||'—')+' kV</small>';refreshWindingCounters();markDirty();});});
    host.querySelectorAll('[data-remove-winding]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.removeWinding);if(!confirm('¿Eliminar este bobinado y sus bornes de la configuración actual?'))return;state.windings.splice(i,1);state.tap_changers=state.tap_changers.filter(c=>c.winding_index!==i).map(c=>({...c,winding_index:c.winding_index>i?c.winding_index-1:c.winding_index}));renderWindings();renderTapChangers();updateCounts();markDirty();}));
    host.querySelectorAll('[data-add-terminal]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.addTerminal),row=blankTerminal('');row._draft=true;state.windings[i].terminals.push(row);renderWindings({openIndex:i});refreshWindingCounters();}));
    state.windings.forEach((w,i)=>buildGrid($('#terminal-grid-'+i),w.terminals,[
      {key:'code',label:'Borne',type:'text',maxLength:20,uppercase:true,required:true},{key:'has_capacitive_bushing',label:'¿Capacitivo?',type:'yesno'},{key:'_delete',label:'',type:'delete'}
    ],(row,key,value)=>{if(key==='has_capacitive_bushing'){row[key]=!!value;if(!row[key])row.bushing={serial_number:'',manufacturer:'',model:'',rated_voltage_kv:'',capacitance_pf:'',power_factor_percent:'',notes:''};}else if(['serial_number','manufacturer','model','rated_voltage_kv','capacitance_pf','power_factor_percent','notes'].includes(key)){if(String(value).trim()!=='')row.has_capacitive_bushing=true;row.bushing[key]=value;}else if(key==='code'){row.code=String(value||'').trim().toUpperCase();const match=row.code.match(/^([UVWABC])(?:[-/]?\d+)?$/);if(match){row.phase=match[1];row.type='Fase';}else if(/^N(?:[-/]?\d+)?$/.test(row.code)){row.phase='N';row.type='Neutro';}else row.code=row.code;}else row[key]=value;row._draft=false;markDirty();refreshWindingCounters();},removed=>{const hasContent=!!(String(removed?.code||'').trim()||removed?.has_capacitive_bushing);if(hasContent)markDirty();refreshWindingCounters();}));
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
  function buildGrid(container, rows, columns, onChange, onRowsChanged) {
    if (!rows.length) rows.push({});
    const render = () => {
      const head = columns.map(c=>`<th>${esc(c.label)}${c.required?'<i class="required-mark" aria-hidden="true">*</i>':''}</th>`).join('');
      const body = rows.map((row,ri)=>`<tr data-grid-row="${ri}"><td>${ri+1}</td>${columns.map((col,ci)=>`<td>${renderCell(row,col,ri,ci)}</td>`).join('')}</tr>`).join('');
      container.innerHTML = `<table class="sheet-table"><thead><tr><th>#</th>${head}</tr></thead><tbody>${body}</tbody></table>`;
      container.querySelectorAll('[data-delete-row]').forEach(button=>button.addEventListener('click',()=>{if(rows.length<=1){toast('Debe mantenerse al menos una fila.',true);return;}const removed=rows.splice(Number(button.dataset.deleteRow),1)[0];render();if(typeof onRowsChanged==='function')onRowsChanged(removed);}));
      container.querySelectorAll('.sheet-cell').forEach(cell=>{
        cell.addEventListener('change',()=>{const r=Number(cell.dataset.row),c=Number(cell.dataset.col),key=columns[c].key,col=columns[c],raw=cell.type==='checkbox'?cell.checked:cell.value,val=['number','bushing-number'].includes(col.type)?normalizeNumeric(raw):(col.uppercase?String(raw).trim().toUpperCase():raw);if(['number','bushing-number'].includes(col.type)||col.uppercase)cell.value=val;if(col.required)cell.classList.toggle('is-required-missing',!String(val??'').trim());onChange(rows[r],key,val);if(key==='code')render();});
      });
      container.querySelectorAll('.sheet-cell').forEach(cell=>cell.addEventListener('keydown',e=>navigateGrid(e,container,rows,columns,render)));
      const table=container.querySelector('table');
      table.addEventListener('paste',e=>handlePaste(e,container,rows,columns,onChange,render));
    };
    function renderCell(row,col,ri,ci){
      if(col.type==='delete')return `<button type="button" class="delete-btn sheet-row-delete" data-delete-row="${ri}" title="Eliminar fila" aria-label="Eliminar fila"><svg><use href="#i-trash"/></svg></button>`;
      let val = col.type==='bushing'||col.type==='bushing-number' ? (row.bushing?.[col.key] ?? '') : (row[col.key] ?? '');
      if(col.type==='check') return `<div style="display:grid;place-items:center;height:32px"><input class="sheet-cell sheet-check" type="checkbox" data-row="${ri}" data-col="${ci}" ${val?'checked':''} aria-label="${esc(col.label)}"></div>`;
      if(col.type==='yesno') return `<select class="sheet-cell sheet-select" data-row="${ri}" data-col="${ci}" aria-label="${esc(col.label)}"><option value="0" ${!val?'selected':''}>No</option><option value="1" ${val?'selected':''}>Sí</option></select>`;
      if(col.type==='select') return `<select class="sheet-cell sheet-select" data-row="${ri}" data-col="${ci}">${col.options.map(o=>`<option value="${esc(o)}" ${String(val)===o?'selected':''}>${esc(o || '—')}</option>`).join('')}</select>`;
      return `<input class="sheet-cell${col.required&&!String(val??'').trim()?' is-required-missing':''}" data-row="${ri}" data-col="${ci}" type="text" maxlength="${col.maxLength||120}" ${col.required?'required':''} ${col.uppercase?'style="text-transform:uppercase"':''} ${['number','bushing-number'].includes(col.type)?'inputmode="decimal" data-numeric="1"':''} value="${esc(val)}" aria-label="${esc(col.label)}">`;
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
  function addTapChanger() {
    if(!state.windings.length){toast('Primero configura al menos un bobinado.',true);showPanel('windings');return;}
    const count = Number(transformer.num_taps || 0);
    if(!Number.isInteger(count)||count<=0){toast('Registra primero una cantidad de TAP mayor que cero en la ficha técnica.',true);openTapCountEditor();return;}
    if(!Number.isInteger(count)||count<1||count>150){toast('La ficha técnica debe indicar entre 1 y 150 posiciones TAP.',true);return;}
    const positions = Array.from({length:count},(_,i)=>({position_no:i+1,label:'Tap '+(i+1),voltage_kv:'',percent_change:'',is_neutral:false,notes:''}));
    state.tap_changers.push({name:'Conmutador '+(state.tap_changers.length+1),type:(transformer.tap_type||'DETC').toUpperCase().includes('OLTC')?'OLTC':'DETC',operation_type:'Manual',winding_index:0,min_position:positions.length?1:'',max_position:positions.length?positions.length:'',neutral_position:'',current_position:'',notes:'',positions});
    renderTapChangers();updateCounts();markDirty();
  }
  $('#addTapChanger').addEventListener('click', addTapChanger);
  function updateTapSourceSummary(){
    const type=String(transformer.tap_type||'').trim().toUpperCase();
    const count=Number(transformer.num_taps||0);
    const typeLabel=type==='OLTC'?'OLTC · Bajo carga':type==='DETC'?'DETC · Desenergizado':(type||'No definido');
    const typeNode=$('#tapSourceType'),countNode=$('#tapSourceCount'),note=$('#tapSourceNote');
    if(typeNode)typeNode.textContent=typeLabel;
    if(countNode)countNode.textContent=Number.isInteger(count)&&count>0?count+' posiciones':'Pendiente';
    const mismatched=count>0&&state.tap_changers.some(c=>(c.positions||[]).length!==count);
    const syncButton=$('#syncTapPositions');
    if(syncButton)syncButton.classList.toggle('hidden',!mismatched);
    if(note)note.textContent=count>0?(mismatched?'La ficha indica '+count+' posiciones, pero hay conmutadores con una cantidad diferente. Sincroniza las filas para preparar una nueva versión; se conservarán las posiciones existentes cuando sea posible.':'Las posiciones de los conmutadores coinciden con la cantidad indicada en la ficha técnica.'):'Debes registrar una cantidad de TAP mayor que cero en la ficha del transformador.';
  }
  function syncTapPositionsToFicha(){
    const count=Number(transformer.num_taps||0);
    if(!Number.isInteger(count)||count<1||count>150){toast('La ficha técnica debe indicar entre 1 y 150 posiciones TAP.',true);return;}
    const affected=state.tap_changers.filter(c=>(c.positions||[]).length>count);
    const hasData=affected.some(c=>c.positions.slice(count).some(p=>p.is_neutral||String(p.notes||'').trim()||String(p.label||'').trim()!==('Tap '+(c.positions.indexOf(p)+1))||String(p.position_no??'')!==String(c.positions.indexOf(p)+1)||String(p.voltage_kv??'').trim()||String(p.percent_change??'').trim()));
    if(hasData&&!confirm('Al sincronizar se quitarán las posiciones que superen '+count+'. Hay datos en esas filas. Las versiones guardadas no se modificarán. ¿Deseas continuar?'))return;
    state.tap_changers.forEach(c=>{
      const previous=Array.isArray(c.positions)?c.positions:[];
      c.positions=Array.from({length:count},(_,i)=>previous[i]||({position_no:i+1,label:'Tap '+(i+1),voltage_kv:'',percent_change:'',is_neutral:false,notes:''}));
      c.min_position=1;c.max_position=count;
      if(Number(c.neutral_position)>count)c.neutral_position='';
      if(Number(c.current_position)>count)c.current_position='';
    });
    renderTapChangers();updateCounts();markDirty();updateTapSourceSummary();refreshConfigStepIndicators();
    toast('Conmutadores sincronizados a '+count+' posiciones. Guarda para crear una nueva versión.');
  }
  $('#syncTapPositions')?.addEventListener('click',syncTapPositionsToFicha);
  $('#editTapMetadata')?.addEventListener('click',()=>openTapCountEditor());
  updateTapSourceSummary();
  function renderTapChangers(){
    const host=$('#tapChangersContainer');
    if(!state.tap_changers.length){host.innerHTML=`<div class="empty-state"><div style="font-size:22px;margin-bottom:6px">＋</div><b>No hay conmutadores configurados</b><p>Agrega el conmutador asociado al bobinado que regula la tensión.</p><button class="btn primary" id="addFirstChanger">Agregar conmutador</button></div>`;$('#addFirstChanger').addEventListener('click',addTapChanger);return;}
    host.innerHTML=state.tap_changers.map((c,ci)=>`
      <details class="tap-card tap-accordion" data-changer="${ci}" ${ci===0?'open':''}>
        <summary class="tap-accordion-summary">
          <span class="winding-index">${String(ci+1).padStart(2,'0')}</span>
          <span class="tap-summary-main"><strong>${esc(c.name||'Conmutador sin nombre')}</strong><small>${esc(state.windings[Number(c.winding_index)]?.name||'Bobinado sin asignar')} · ${c.positions.length} posiciones</small></span>
          <span class="winding-summary-count">${c.positions.length} TAP</span><span class="accordion-chevron">⌄</span>
        </summary>
        <div class="tap-accordion-body">
          <div class="tap-card-head"><div class="tap-meta">
            <label><span>Nombre del conmutador</span><input data-cfield="name" value="${esc(c.name)}" placeholder="Ej. CTC / DETC"></label>
            <label><span>Bobinado asociado</span><select data-cfield="winding_index">${state.windings.map((w,i)=>`<option value="${i}" ${Number(c.winding_index)===i?'selected':''}>${esc(w.name||w.code||'Bobinado '+(i+1))}</option>`).join('')}</select></label>
            <label><span>Posición mínima</span><input data-cfield="min_position" type="number" value="${esc(c.min_position)}"></label><label><span>Posición máxima</span><input data-cfield="max_position" type="number" value="${esc(c.max_position)}"></label><label><span>Posición neutra</span><input data-cfield="neutral_position" type="number" value="${esc(c.neutral_position)}"></label><label><span>Posición actual</span><input data-cfield="current_position" type="number" value="${esc(c.current_position)}"></label>
          </div><button type="button" class="text-remove" data-remove-changer="${ci}">Quitar conmutador</button></div>
          <details class="tap-positions-accordion" open>
            <summary><span>Posiciones de TAP</span><small>${c.positions.length} posiciones registradas</small><span class="accordion-chevron">⌄</span></summary>
            <div class="tap-card-body"><div class="table-caption"><strong>Posiciones de tap / datos de placa</strong><div class="sheet-tools"><button data-generate-taps="${ci}">Generar filas</button><button data-add-tap-row="${ci}">+ Fila</button></div></div><div class="sheet-wrap" id="tap-grid-${ci}"></div><div class="sheet-hint">Puedes pegar una columna con las posiciones desde Excel.</div></div>
          </details>
        </div>
      </details>`).join('');
    host.querySelectorAll('[data-cfield]').forEach(el=>el.addEventListener('change',e=>{const ci=Number(e.target.closest('[data-changer]').dataset.changer),key=e.target.dataset.cfield;state.tap_changers[ci][key]=key==='winding_index'?Number(e.target.value):e.target.value;const card=e.target.closest('.tap-accordion');const summary=card?.querySelector('.tap-summary-main');const changer=state.tap_changers[ci];if(summary)summary.innerHTML='<strong>'+esc(changer.name||'Conmutador sin nombre')+'</strong><small>'+esc(state.windings[Number(changer.winding_index)]?.name||'Bobinado sin asignar')+' · '+esc(changer.type)+' · '+changer.positions.length+' posiciones</small>';markDirty();}));
    host.querySelectorAll('[data-remove-changer]').forEach(b=>b.addEventListener('click',()=>{if(!confirm('¿Eliminar este conmutador y todas sus posiciones?'))return;state.tap_changers.splice(Number(b.dataset.removeChanger),1);renderTapChangers();updateCounts();markDirty();}));
    host.querySelectorAll('[data-generate-taps]').forEach(b=>b.addEventListener('click',()=>openTapGenerator(Number(b.dataset.generateTaps))));
    host.querySelectorAll('[data-add-tap-row]').forEach(b=>b.addEventListener('click',()=>{const c=state.tap_changers[Number(b.dataset.addTapRow)];if(c.positions.length>=150){toast('Cada conmutador admite como máximo 150 posiciones TAP.',true);return;}c.positions.push({position_no:c.positions.length+1,label:'Tap '+(c.positions.length+1),voltage_kv:'',percent_change:'',is_neutral:false,notes:''});renderTapChangers();updateCounts();markDirty();}));
    state.tap_changers.forEach((c,i)=>{if(!Array.isArray(c.positions)||!c.positions.length)c.positions=[{position_no:1,label:'Tap 1',is_neutral:false,notes:''}];buildGrid($('#tap-grid-'+i),c.positions,[{key:'position_no',label:'Posición',type:'number',required:true},{key:'_delete',label:'',type:'delete'}],(row,key,value)=>{row[key]=value;markDirty();updateCounts();},()=>{markDirty();updateCounts();});});
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
    if(!Number.isInteger(n)||n<1||n>150){toast('Ingresa una cantidad entera entre 1 y 150.',true);return;}
    const c=state.tap_changers[tapGeneratorIndex];if(!c)return;
    if(n<c.positions.length){const removed=c.positions.slice(n).some(p=>p.voltage_kv!==''||p.percent_change!==''||p.is_neutral||String(p.notes||'').trim()||String(p.label||'').trim()!==('Tap '+(c.positions.indexOf(p)+1)));if(removed&&!confirm('Al reducir la cantidad se eliminarán las filas posteriores al nuevo límite. ¿Deseas continuar?'))return;}
    c.positions=Array.from({length:n},(_,i)=>c.positions[i]||({position_no:i+1,label:'Tap '+(i+1),voltage_kv:'',percent_change:'',is_neutral:false,notes:''}));
    c.min_position=1;c.max_position=n;
    renderTapChangers();updateCounts();markDirty();closeTapGenerator();toast(n+' posiciones preparadas. Completa los valores de placa.');
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#tapRowsModal').classList.contains('hidden'))closeTapGenerator();});

  function isWindingComplete(w){
    if(!w)return false;
    const terminals=(Array.isArray(w.terminals)?w.terminals:[]).filter(t=>!(t._draft&&!String(t.code||'').trim()&&!t.has_capacitive_bushing));
    return String(w.name||'').trim()!==''&&String(w.code||'').trim()!==''&&Number.isFinite(Number(w.voltage_kv))&&Number(w.voltage_kv)>0&&terminals.length>0&&terminals.every(t=>String(t.code||'').trim()!=='');
  }
  function refreshWindingOverview(){
    const el=$('#windingOverviewMeta');
    if(!el)return;
    const total=state.windings.length;
    const complete=state.windings.filter(isWindingComplete).length;
    const pending=total-complete;
    el.textContent=pending?`${total} ${total===1?'bobinado':'bobinados'} · ${complete} ${complete===1?'completo':'completos'} · faltan datos en ${pending}`:`${total} ${total===1?'bobinado':'bobinados'} · todos los datos completos`;
  }
  function refreshWindingCounters(){
    queryAll('[data-winding-stats]').forEach(el=>{
      const i=Number(el.dataset.windingStats),w=state.windings[i];
      if(w)el.textContent=`${w.terminals.filter(t=>!(t._draft&&!String(t.code||'').trim()&&!t.has_capacitive_bushing)).length} bornes · ${w.terminals.filter(t=>t.has_capacitive_bushing).length} capacitivos`;
    });
    queryAll('[data-winding-status]').forEach(el=>{
      const w=state.windings[Number(el.dataset.windingStatus)];
      if(!w)return;
      const complete=isWindingComplete(w);
      el.dataset.state=complete?'complete':'incomplete';
      el.textContent=complete?'Completo':'Faltan datos';
      const card=el.closest('.winding-accordion');
      if(card)card.dataset.state=complete?'complete':'incomplete';
    });
    refreshWindingOverview();
    refreshConfigStepIndicators();
  }

  function updateCounts(){
    $('#windingCount').textContent=state.windings.length+' '+(state.windings.length===1?'bobinado':'bobinados');
    refreshWindingCounters();
    const positions=state.tap_changers.reduce((sum,c)=>sum+c.positions.length,0);
    $('#tapCount').textContent=positions+' '+(positions===1?'posición':'posiciones');
    refreshConfigStepIndicators();
  }

  function refreshConfigStepIndicators(){
    const winding=getWindingProgress();
    const tap=getTapProgress();
    const reviewComplete=winding.complete&&(tap.complete||tap.optional);
    const configHasProgress=state.windings.length>0||state.tap_changers.length>0;
    const configNavState=reviewComplete?'complete':(configHasProgress?'partial':'missing');
    const configNavIndicator=$('#configNavState');
    if(configNavIndicator){
      configNavIndicator.dataset.state=configNavState;
      configNavIndicator.hidden=configNavState==='complete';
      configNavIndicator.setAttribute('aria-label',configNavState==='missing'?'Configuración sin configurar':configNavState==='partial'?'Configuración incompleta':'Configuración completa');
    }
    const steps=[
      ['windings',winding.complete?'complete':(state.windings.length?'partial':'missing'),winding.complete?'Completo':(state.windings.length?'Revisar datos':'Agregar bobinados')],
      ['taps',tap.optional?'optional':(tap.complete?'complete':(state.tap_changers.length?'partial':'missing')),tap.optional?'No aplica':(tap.complete?'Completo':(state.tap_changers.length?'Revisar posiciones':'Agregar conmutador'))],
      ['review',reviewComplete?'complete':(configHasProgress?'partial':'missing'),reviewComplete?'Listo para guardar':'Pendiente']
    ];
    steps.forEach(([key,status,label],index)=>{
      const button=document.querySelector('.config-view-tab[data-tab="'+key+'"]');
      if(!button)return;
      button.dataset.state=status;
      if(button.dataset.tab===selectedTab)button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
      const statusText=button.querySelector('.config-step-status');
      if(statusText)statusText.textContent=label;
      const title=button.querySelector('.ui-step-copy b')?.textContent||key;
      button.setAttribute('aria-label',title+' · '+label);
      button.title=label;
    });
  }

  function renderReview(){
    const terminals=state.windings.reduce((n,w)=>n+w.terminals.length,0),bushings=state.windings.reduce((n,w)=>n+w.terminals.filter(t=>t.has_capacitive_bushing).length,0),taps=state.tap_changers.reduce((n,c)=>n+c.positions.length,0);
    $('#reviewSummary').innerHTML=`<div class="review-stat"><small>Bobinados</small><strong>${state.windings.length}</strong><span>Configurados</span></div><div class="review-stat"><small>Bornes</small><strong>${terminals}</strong><span>Terminales</span></div><div class="review-stat"><small>Bushings capacitivos</small><strong>${bushings}</strong><span>Identificados</span></div><div class="review-stat"><small>Conmutadores</small><strong>${state.tap_changers.length}</strong><span>Configurados</span></div><div class="review-stat"><small>Posiciones de tap</small><strong>${taps}</strong><span>Registradas</span></div><div class="review-stat"><small>Datos de placa · referencia</small><strong>${esc(state.vector_group||'—')}</strong><span>${esc(state.phase_count)} fase(s) · ${esc(state.frequency_hz)} Hz</span></div>`+
      state.windings.map((w,i)=>`<div class="review-winding"><h4>${i+1}. ${esc(w.name)} · ${esc(w.voltage_kv||'—')} kV</h4><p>${esc(w.terminals.length)} bornes</p><div class="review-tags">${w.terminals.map(t=>`<span>${esc(t.code||'Sin código')} · ${t.has_capacitive_bushing?'Capacitivo':'No capacitivo'}</span>`).join('')}</div></div>`).join('');
    $('#versionBadge').textContent='Versión '+(state.version_no||0);
    $('#versionList').innerHTML=(state.versions||[]).length?state.versions.map(v=>`<div class="version-row"><b>Versión ${v.version_no}</b><span>${esc(v.created_at||'')}</span></div>`).join(''):'<div class="empty-history">Todavía no hay versiones guardadas.</div>';
  }

  function collectPayload(){
    return {transformer_key:transformer.key,phase_count:Number(state.phase_count||3),vector_group:String(state.vector_group||''),frequency_hz:state.frequency_hz??'',notes:state.notes||'',windings:state.windings.map(w=>({...w,terminals:w.terminals.filter(t=>String(t.code||'').trim()!=='').map(({_draft,...t})=>({...t,bushing:t.bushing||{}}))})),tap_changers:state.tap_changers};
  }
  function validateConfiguration(){
    const errors=[];const codes=new Set();
    state.windings.forEach((w,wi)=>{
      const code=(w.code||'').trim().toUpperCase();
      if(!String(w.name||'').trim())errors.push(`El bobinado ${wi+1} necesita un nombre.`);
      if(!code)errors.push(`El bobinado ${wi+1} necesita un código.`);
      else if(codes.has(code))errors.push(`El código de bobinado ${code} está repetido.`);else codes.add(code);
      const voltage=Number(w.voltage_kv);
      if(!Number.isFinite(voltage)||voltage<=0)errors.push(`Indica una tensión nominal válida para el bobinado ${w.name||wi+1}.`);
      
      const terminalCodes=new Set();
      if(!(w.terminals||[]).length)errors.push(`Agrega al menos un borne al bobinado ${w.name||wi+1}.`);
      w.terminals.forEach((t,ti)=>{
        const terminal=(t.code||'').trim().toUpperCase();
        if(t._draft&&!terminal&&!t.has_capacitive_bushing)return;
        if(!terminal){errors.push(`Completa el nombre del borne en la fila ${ti+1} de ${w.name||'el bobinado '+(wi+1)}.`);return;}
        if(terminalCodes.has(terminal))errors.push(`El borne ${terminal} está repetido en ${w.name||'el bobinado '+(wi+1)}.`);else terminalCodes.add(terminal);
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
    const windingProgress=getWindingProgress(),tapProgress=getTapProgress();
    if(!windingProgress.complete){toast(windingProgress.issues[0]||'Completa los datos obligatorios de todos los bobinados y bornes.',true);showPanel('windings');return;}
    if(!tapProgress.complete&&!tapProgress.optional){toast(tapProgress.issues[0]||'Completa los conmutadores y sus posiciones de TAP.',true);showPanel('taps');return;}
    const validationErrors=validateConfiguration();if(validationErrors.length){toast(validationErrors[0],true);showPanel(validationErrors[0].includes('posición')?'taps':'windings');return;}
    if(PILOT.demo){toast('Estás en modo demostración. Conecta MySQL y selecciona un registro real de transformers para guardar.',true);return;}
    if(!PILOT.schemaReady){toast('Importa database/schema.sql en la base de datos del sistema.',true);return;}
    const btns=[$('#saveConfig')].filter(Boolean);btns.forEach(b=>{b.disabled=true;b.textContent='Guardando...';});
    try{
      const payload=collectPayload();
      const response=await fetch(api('action=save'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await readApiResponse(response);
      if(!result.result||!result.result.config_id||!result.result.version_no)throw new Error('MySQL no confirmó el identificador y la versión de la configuración.');

      // Lectura inmediata desde MySQL: no mostrar "Guardado" hasta confirmar la persistencia.
      const verifyResponse=await fetch(api('action=load&key='+encodeURIComponent(transformer.key)));
      const persisted=await readApiResponse(verifyResponse);
      const savedConfig=persisted.config;
      if(!savedConfig||Number(savedConfig.version_no)!==Number(result.result.version_no)
        ||(savedConfig.windings||[]).length!==payload.windings.length
        ||(savedConfig.tap_changers||[]).length!==payload.tap_changers.length){
        throw new Error('El servidor aceptó la operación, pero la lectura de verificación no coincide. Revisa la conexión y las tablas eh_ antes de continuar.');
      }

      state.version_no=Number(savedConfig.version_no);
      state.versions=savedConfig.versions||state.versions||[];
      dirty=false;refreshSidebarAccess();refreshConfigStepIndicators();
      $('#saveStatus').classList.add('saved');$('#saveStatus').innerHTML='<i></i>Guardado';
      $('#versionBadge').textContent='Versión '+state.version_no;renderReview();
      toast('Configuración guardada · versión '+state.version_no+'.');
    }catch(error){toast(error.message,true);}finally{btns.forEach(b=>{b.disabled=false;b.innerHTML='<svg><use href="#i-check"/></svg>Guardar configuración';});}
  }
  $('#saveConfig')?.addEventListener('click',saveConfig);

  // Search the existing transformers table; the displayed code is not assumed to be its PK.
  let searchTimer=null;
  $('#globalSearch').addEventListener('input',()=>{clearTimeout(searchTimer);const q=$('#globalSearch').value.trim();if(q.length<2){$('#searchResults').classList.remove('open');return;}searchTimer=setTimeout(()=>searchTransformers(q),250);});
  async function searchTransformers(q){
    try{const r=await fetch(api('action=search&q='+encodeURIComponent(q)));const d=await readApiResponse(r);const box=$('#searchResults');box.innerHTML=d.items.length?d.items.map(t=>`<div class="search-item" data-key="${esc(t.key)}"><strong>${esc(t.code)}</strong><small>${esc(t.company)} · ${esc(t.name)}</small></div>`).join(''):'<div class="search-item"><strong>Sin resultados</strong><small>No se encontraron coincidencias en transformers.</small></div>';box.classList.add('open');box.querySelectorAll('[data-key]').forEach(item=>item.addEventListener('click',()=>selectTransformer(item.dataset.key)));}
    catch(e){toast(e.message,true);}
  }
  async function loadTransformerSwitcher(selectedKey=transformer.key){
    const select=$('#transformerSwitcher');if(!select)return;
    try{
      const response=await fetch(api('action=transformer-list'));
      const data=await readApiResponse(response);
      const options=data.items||[];
      select.innerHTML='';
      options.forEach(item=>{
        const option=document.createElement('option');
        option.value=String(item.key);
        option.textContent=[item.code||item.key,item.name,item.company].filter(Boolean).join(' · ');
        select.appendChild(option);
      });
      if(selectedKey&&!options.some(item=>String(item.key)===String(selectedKey))){
        const option=document.createElement('option');
        option.value=String(transformer.key);
        option.textContent=[transformer.code||transformer.key,transformer.name,transformer.company].filter(Boolean).join(' · ');
        select.appendChild(option);
      }
      if(selectedKey)select.value=String(selectedKey);
      select.disabled=options.length===0;
    }catch(error){
      select.innerHTML='<option value="">No se pudo cargar la lista</option>';
      select.disabled=true;
      console.warn('No se pudo cargar el selector de transformadores:',error);
    }
  }
  async function selectTransformer(key){
    if(!key||String(key)===String(transformer.key))return false;
    if(dirty&&!window.confirm('Hay cambios de configuración sin guardar. ¿Deseas descartarlos y cambiar de transformador?')){
      $('#transformerSwitcher').value=String(transformer.key);
      return false;
    }
    try{
      const r=await fetch(api('action=load&key='+encodeURIComponent(key)));
      const d=await readApiResponse(r);
      Object.assign(transformer,d.transformer);state=normalizeConfig(d.config||{});
      PILOT.demo=false;PILOT.transformerFound=true;PILOT.schemaReady=!!d.schemaReady;PILOT.testsSchemaReady=!!d.testsSchemaReady;
      syncTransformerNominals();
      refreshSidebarAccess();updateTransformerDisplay();
      const status=$('#pilotStatus');
      if(status){status.className='pilot-status '+(PILOT.schemaReady&&PILOT.testsSchemaReady?'ready':'warning');status.querySelector('strong').textContent=PILOT.schemaReady&&PILOT.testsSchemaReady?'Base de datos conectada':'Faltan tablas del piloto';status.querySelector('span').textContent='BD: '+(PILOT.dbName||'configurada')+' · Transformador: '+transformer.code;}
      $('#globalSearch').value='';$('#searchResults').classList.remove('open');
      renderWindings();renderTapChangers();updateCounts();
      const dbAlert=$('#dbAlert');
      if(dbAlert){const message=!PILOT.dbConnected?'No hay conexión con la base de datos. Revisa la configuración de conexión.':(!PILOT.schemaReady?'Falta preparar el almacenamiento de la configuración eléctrica.':'');dbAlert.querySelector('span').textContent=message;dbAlert.classList.toggle('hidden',!message);}
      dirty=false;
      const saveStatus=$('#saveStatus');
      if(saveStatus){saveStatus.classList.toggle('saved',Number(state.version_no)>0);saveStatus.innerHTML=Number(state.version_no)>0?'<i></i>Guardado':'<i></i>Sin configurar';}
      await loadTransformerSwitcher(transformer.key);
      toast('Transformador '+transformer.code+' seleccionado.');
      backOverview();
      return true;
    }catch(e){
      $('#transformerSwitcher').value=String(transformer.key);
      toast(e.message,true);
      return false;
    }
  }
  $('#transformerSwitcher')?.addEventListener('change',event=>selectTransformer(event.target.value));
  $('#createTransformerBtn')?.addEventListener('click',()=>openTransformerCreate());
  loadTransformerSwitcher();
  function updateTransformerDisplay(){
    $('#transformerCode').textContent=transformer.code;$('#summaryCode').textContent=transformer.code;$('#companyName').textContent=transformer.company;$('#summaryCompany').textContent=transformer.company;
    $('#summaryTag').textContent='TAG '+(transformer.tag||'—');$('#summaryVoltage').textContent=transformer.voltage||'—';$('#summaryPower').textContent=transformer.power||'—';$('#summaryYear').textContent=transformer.year||'—';$('#summaryBrand').textContent=transformer.brand||'—';$('#summaryTapType').textContent=transformer.tap_type||'—';$('#summaryVector').textContent=transformer.vector_group||'—';$('#summaryLocation').textContent=transformer.location||'—';$('#summaryTechnicalDetails').textContent=[transformer.phase_count?transformer.phase_count+' fases':'',transformer.frequency_hz?transformer.frequency_hz+' Hz':'',transformer.insulation_type||'',transformer.cooling_type||''].filter(Boolean).join(' · ');
  }
  document.addEventListener('click',e=>{if(!e.target.closest('.global-search'))$('#searchResults').classList.remove('open');});
  $('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Escape')$('#searchResults').classList.remove('open');});
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});

  


  function showOnlyMain(which){
    document.body.classList.toggle('config-focus',which==='configPage');
    document.body.classList.toggle('test-page-focus',which==='testPage');
    document.body.classList.toggle('test-form-focus',which==='executionPage'||which==='planPage');
    ['overviewPage','configPage','testPage','executionPage','planPage'].forEach(id=>$('#'+id).classList.toggle('hidden',id!==which));
  }
  document.addEventListener('click', event => {
    const next = event.target instanceof Element ? event.target.closest('[data-next]') : null;
    if (!next) return;
    event.preventDefault();
    showPanel(next.dataset.next);
  });
  renderWindings();renderTapChangers();updateCounts();
  if(state.version_no>0){$('#saveStatus').classList.add('saved');$('#saveStatus').innerHTML='<i></i>Guardado';}
  window.addEventListener('error', function(ev){ const msg='Error de interfaz: '+(ev.message||'JavaScript'); const s=$('#pilotStatus'); if(s){s.className='pilot-status warning';s.querySelector('strong').textContent='Error al iniciar la interfaz';s.querySelector('span').textContent=msg;} });
  window.ELEC_CONFIG_BRIDGE = {
    getTransformer: function(){ return {...transformer}; },
    getElectricalConfig: function(){ return clone(state); },
    normalizeConfig: normalizeConfig, clone: clone, api: api, readApiResponse: readApiResponse,
    toast: toast, esc: esc, electricalTestsBlockReason: electricalTestsBlockReason,
    refreshSidebarAccess: refreshSidebarAccess, showOnlyMain: showOnlyMain, showPanel: showPanel,
    openConfig: openConfig, backOverview: backOverview
  };

})();
