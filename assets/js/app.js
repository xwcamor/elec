(() => {
    'use strict';
    const rows = document.getElementById('measurementRows');
    const add = document.getElementById('addMeasurement');
    if (!rows || !add) return;

    add.addEventListener('click', () => {
        const tr = document.createElement('tr');
        const fields = [
            ['measurement_label[]', 'Ej. Lectura'],
            ['measurement_key[]', 'clave'],
            ['measurement_phase[]', 'A'],
            ['measurement_value[]', ''],
            ['measurement_unit[]', 'V, A, Ω...']
        ];
        for (const [name, placeholder] of fields) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.name = name;
            input.placeholder = placeholder;
            if (name === 'measurement_value[]') input.inputMode = 'decimal';
            td.append(input);
            tr.append(td);
        }
        const action = document.createElement('td');
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove-row';
        remove.setAttribute('aria-label', 'Eliminar fila');
        remove.textContent = '×';
        action.append(remove);
        tr.append(action);
        rows.append(tr);
    });

    rows.addEventListener('click', event => {
        const button = event.target.closest('.remove-row');
        if (!button) return;
        const all = rows.querySelectorAll('tr');
        if (all.length > 1) button.closest('tr').remove();
        else button.closest('tr').querySelectorAll('input').forEach(input => input.value = '');
    });
})();
