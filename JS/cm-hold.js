(() => {
  'use strict';
  const button = document.getElementById('holdRequestBtn');
  if (!button) return;
  const config = window.CMInfiniaConfig;
  let selected = null, busy = false, completed = false;
  const dialog = document.createElement('dialog');
  dialog.setAttribute('aria-label', 'Request to Hold');
  dialog.className = 'cm-hold-dialog';
  dialog.innerHTML = `<form><span class="cm-hold-kicker">CM INFINIA · YOUR NEXT HOME</span><h2>Hold this apartment?</h2><p class="cm-hold-copy">Send a hold request for the apartment you’re viewing. Our team will contact you to confirm.</p><div class="cm-hold-property" id="cmHoldProperty"></div><p id="cmHoldMessage" role="status" aria-live="polite"></p><div class="cm-hold-actions"><button type="button" id="cmHoldCancel">Not now</button><button type="submit" id="cmHoldSubmit">Yes, request to hold</button></div><p class="cm-hold-note">Your apartment is reserved only after our team confirms.</p></form>`;
  const style = document.createElement('style');
  style.textContent = `.cm-hold-dialog{width:min(440px,calc(100% - 32px));max-height:calc(100dvh - 32px);box-sizing:border-box;border:1px solid #e8e1db;border-radius:20px;padding:30px;background:#fffdfa;color:#272522;font:15px/1.6 Arial,sans-serif;box-shadow:0 24px 90px #0005}.cm-hold-dialog::backdrop{background:#111820b8;backdrop-filter:blur(7px)}.cm-hold-kicker{font-size:10px;letter-spacing:.16em;font-weight:bold;color:#a43d37}.cm-hold-dialog h2{font-size:28px;line-height:1.2;letter-spacing:-.03em;margin:14px 0}.cm-hold-copy{color:#716b65;margin:0 0 22px}.cm-hold-property{padding:18px;border:1px solid #e6ddd3;border-radius:12px;background:#f5f1eb;font-size:20px;font-weight:700}.cm-hold-actions{display:flex;gap:10px;margin-top:20px}.cm-hold-actions button{min-height:46px;padding:12px 16px;border-radius:9px;border:1px solid #ddd5cd;font:600 13px Arial,sans-serif;cursor:pointer;background:transparent;color:#5f5750}.cm-hold-actions button[type=submit]{flex:1;background:#a9252b;color:white;border-color:#a9252b}.cm-hold-actions button:disabled{opacity:.5;cursor:default}.cm-hold-actions button:focus-visible{outline:3px solid #c48b54;outline-offset:3px}.cm-hold-note{font-size:11px;color:#8b8177;margin:16px 0 0}#cmHoldMessage{font-size:13px;color:#8b302e;min-height:20px;margin:12px 0 0}@media(max-width:420px){.cm-hold-dialog{padding:23px}.cm-hold-dialog h2{font-size:25px}.cm-hold-actions{flex-direction:column-reverse}}`;
  document.head.append(style); document.body.append(dialog);
  const $ = id => dialog.querySelector('#' + id);
  const message = $('cmHoldMessage'), submit = $('cmHoldSubmit');
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
    selected = null;
    dialog.showModal(); submit.disabled = true;
    const context = window.CMInfiniaContext?.() || {};
    const tower = String(context.tower || '').toUpperCase(), floor = Number(context.floor);
    if (!/^[A-F]$/.test(tower) || !Number.isInteger(floor) || floor < 1 || floor > 33) {
      $('cmHoldProperty').textContent = 'No apartment selected';
      message.textContent = 'Open a floor from the tower view, then return here to request a hold.';
      return;
    }
    $('cmHoldProperty').textContent = `Tower ${tower} · Floor ${floor}`;
    message.textContent = 'Checking availability…';
    try {
      const inventory = await request('rpc/cm_available_apartments', {});
      selected = inventory.find(row => row.tower === tower && row.floor === floor && row.unit === 1) || null;
      submit.disabled = !selected;
      message.textContent = selected ? '' : 'This apartment is not currently available for a hold. Please contact our team.';
    } catch (error) { message.textContent = error.message; }
  }

  button.addEventListener('click', () => {
    if (window.CMInfiniaRequireVisitor?.(open)) void open();
  });
  dialog.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault(); if (busy || completed || !selected) return;
    const visitor = window.CMInfiniaGetSavedLead?.();
    if (!visitor) { dialog.close(); window.CMInfiniaRequireVisitor?.(open); return; }
    busy = true; submit.disabled = true; $('cmHoldCancel').disabled = true;
    message.textContent = 'Sending request…';
    try {
      await request('hold_requests', {
        visitor_name:visitor.fullName, visitor_mobile:visitor.mobile,
        visitor_email:visitor.email || '', visitor_city:visitor.city,
        tower:selected.tower, floor:selected.floor, unit:selected.unit,
        apartment_detail:`Tower ${selected.tower} • Floor ${selected.floor} • Unit ${selected.unit}`, status:'pending'
      });
      message.textContent = 'Your hold request has been sent for approval.';
      completed = true;
      submit.hidden = true; $('cmHoldCancel').textContent = 'Close';
    } catch (error) { message.textContent = error.message; }
    finally { busy = false; submit.disabled = false; $('cmHoldCancel').disabled = false; }
  });
  dialog.addEventListener('close', () => { completed = false; submit.hidden = false; $('cmHoldCancel').textContent = 'Not now'; });
})();
