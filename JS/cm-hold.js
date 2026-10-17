(() => {
  'use strict';
  const button = document.getElementById('holdRequestBtn');
  if (!button) return;
  const config = window.CMInfiniaConfig;
  let inventory = [], busy = false, completed = false;
  const dialog = document.createElement('dialog');
  dialog.setAttribute('aria-label', 'Request to Hold');
  dialog.style.cssText = 'width:min(400px,calc(100% - 32px));box-sizing:border-box;border:0;border-radius:12px;padding:24px;font:15px/1.5 Arial,sans-serif;color:#292929;background:#fff';
  dialog.innerHTML = `<form><h2 style="margin-top:0">Request to Hold</h2><p>Select your apartment. This sends a request to our team for approval.</p><label>Tower<select id="cmHoldTower" required></select></label><label>Floor<select id="cmHoldFloor" required></select></label><label>Apartment<select id="cmHoldUnit" required></select></label><p id="cmHoldMessage" role="status" aria-live="polite"></p><div style="display:flex;gap:12px"><button type="button" id="cmHoldCancel">Cancel</button><button type="submit" id="cmHoldSubmit">Send Request</button></div></form>`;
  const style = document.createElement('style');
  style.textContent = 'dialog[aria-label="Request to Hold"]::backdrop{background:#0009}dialog[aria-label="Request to Hold"] label{display:block;margin:12px 0}dialog[aria-label="Request to Hold"] select{display:block;width:100%;padding:10px;margin-top:4px}dialog[aria-label="Request to Hold"] button{padding:10px;cursor:pointer}';
  document.head.append(style); document.body.append(dialog);
  const $ = id => dialog.querySelector('#' + id);
  const tower = $('cmHoldTower'), floor = $('cmHoldFloor'), unit = $('cmHoldUnit');
  const message = $('cmHoldMessage'), submit = $('cmHoldSubmit');
  function options(select, values, selected, prefix = '') {
    select.replaceChildren(...values.map(value => new Option(prefix + value, value)));
    if (values.map(String).includes(String(selected))) select.value = String(selected);
  }
  function units(selected) {
    options(unit, inventory.filter(row => row.tower === tower.value && row.floor === Number(floor.value)).map(row => row.unit), selected, 'Unit ');
    submit.disabled = !unit.value;
  }
  function floors(selected, selectedUnit) {
    options(floor, [...new Set(inventory.filter(row => row.tower === tower.value).map(row => row.floor))].sort((a,b)=>a-b), selected);
    units(selectedUnit);
  }
  tower.onchange = () => floors(); floor.onchange = () => units();
  $('cmHoldCancel').onclick = () => { if (!busy) dialog.close(); };
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  async function request(path, data) {
    if (!config?.supabaseUrl || !config.publishableKey) throw new Error('Registration is not configured yet.');
    const response = await fetch(config.supabaseUrl + '/rest/v1/' + path, {
      method: 'POST', headers: {'Content-Type':'application/json', apikey:config.publishableKey, Prefer:'return=minimal'}, body:JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Unable to load or submit this request. Please try again or contact our team.');
    return path.startsWith('rpc/') ? response.json() : null;
  }
  async function open() {
    if (dialog.open) return;
    dialog.showModal(); message.textContent = 'Loading available apartments…'; submit.disabled = true;
    tower.replaceChildren(); floor.replaceChildren(); unit.replaceChildren();
    try {
      inventory = await request('rpc/cm_available_apartments', {});
      const context = window.CMInfiniaContext?.() || {};
      options(tower, [...new Set(inventory.map(row => row.tower))].sort(), context.tower);
      floors(context.floor, context.unit);
      message.textContent = inventory.length ? '' : 'No available apartments are listed yet. Please contact our team.';
    } catch (error) { message.textContent = error.message; }
  }
  button.addEventListener('click', () => {
    if (window.CMInfiniaRequireVisitor?.(open)) void open();
  });
  dialog.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault(); if (busy || completed || !unit.value) return;
    const visitor = window.CMInfiniaGetSavedLead?.();
    if (!visitor) { dialog.close(); window.CMInfiniaRequireVisitor?.(open); return; }
    busy = true; submit.disabled = true; $('cmHoldCancel').disabled = true;
    message.textContent = 'Sending request…';
    try {
      await request('hold_requests', {
        visitor_name:visitor.fullName, visitor_mobile:visitor.mobile,
        visitor_email:visitor.email || '', visitor_city:visitor.city,
        tower:tower.value, floor:Number(floor.value), unit:Number(unit.value),
        apartment_detail:`Tower ${tower.value} • Floor ${floor.value} • Unit ${unit.value}`, status:'pending'
      });
      message.textContent = 'Your hold request has been sent for approval.';
      completed = true;
      submit.hidden = true; $('cmHoldCancel').textContent = 'Close';
    } catch (error) { message.textContent = error.message; }
    finally { busy = false; submit.disabled = false; $('cmHoldCancel').disabled = false; }
  });
  dialog.addEventListener('close', () => { completed = false; submit.hidden = false; $('cmHoldCancel').textContent = 'Cancel'; });
})();
