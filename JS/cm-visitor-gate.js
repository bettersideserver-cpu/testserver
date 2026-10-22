/* CM INFINIA — REQUIRED VISITOR GATE + HOLD REQUESTS */
(function () {
  'use strict';
  const SUPABASE_URL = window.CMInfiniaConfig?.supabaseUrl || '';
  const SUPABASE_KEY = window.CMInfiniaConfig?.publishableKey || '';
  const VISITOR_KEY = 'cmInfiniaVisitor';
  const gateScript = document.currentScript || document.querySelector('script[src*="cm-visitor-gate.js"]');
  const imageBase = new URL('../images/', gateScript ? gateScript.src : new URL('../../JS/cm-visitor-gate.js', location.href)).href;
  let pendingNavigation = null;

  let memoryVisitor = null;
  const saved = () => { try { return memoryVisitor || JSON.parse(sessionStorage.getItem(VISITOR_KEY) || 'null') } catch (e) { return memoryVisitor } };
  const save = v => { memoryVisitor = v; try { sessionStorage.setItem(VISITOR_KEY, JSON.stringify(v)); } catch {} window.CMInfiniaVisitor = v; window.dispatchEvent(new Event('cm-infinia:visitor-ready')) };
  const params = new URLSearchParams(location.search);
  const context = () => ({
    tower: params.get('tower') || sessionStorage.getItem('cmInfiniaTower') || '',
    floor: parseInt(params.get('floor') || sessionStorage.getItem('cmInfiniaFloor') || '', 10) || null,
    unit: parseInt(params.get('unit') || sessionStorage.getItem('cmInfiniaUnit') || '', 10) || null
  });
  const headers = () => ({
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Prefer': 'return=minimal'
  });
  async function post(table, payload) {
    if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('CM Infinia registration is not configured yet. Please contact the site administrator.');
    const r = await fetch(SUPABASE_URL + '/rest/v1/' + table, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
    if (!r.ok) { let m = 'Supabase ' + r.status; try { const x = await r.json(); m = x.message || x.details || x.hint || m } catch (e) { } throw new Error(m) }
    return true;
  }

  function addStyles() {
    if (document.getElementById('hhRequiredGateStyles')) return;
    const s = document.createElement('style'); s.id = 'hhRequiredGateStyles'; s.textContent = `
    #hhRequiredVisitorGate{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72);backdrop-filter:blur(16px);font-family:Arial,sans-serif}

#hhRequiredVisitorGate.open{display:flex}

#hhRequiredVisitorGate .hh-card{position:relative;isolation:isolate;width:min(400px,100%);height:630px;box-sizing:border-box;background:linear-gradient(145deg,#fff 0%,#faf9f7 100%);color:#292929;border:1px solid rgba(181,18,27,.16);border-radius:12px;padding:26px 24px;box-shadow:0 24px 70px rgba(0,0,0,.3),inset 0 1px 0 #fff}

#hhRequiredVisitorGate .hh-card::before{content:"";position:absolute;z-index:1;top:-20px;right:110px;width:192px;height:180px;opacity:.055;pointer-events:none}

#hhRequiredVisitorGate h2{margin:0 0 10px;font-size:clamp(20px,6vw,25px);line-height:1.18;font-weight:700;letter-spacing:-.025em;text-align:center;text-wrap:balance;color:#292929}

#hhRequiredVisitorGate .hh-copy{margin:0 0 28px;color:#74706e;font-size:12px;line-height:1.5;text-align:center;text-wrap:balance}

#hhRequiredVisitorGate label{display:block;margin:18px 0 8px;font-size:11px;line-height:14px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#514b49}

#hhRequiredVisitorGate label:first-child{margin-top:0}

#hhRequiredVisitorGate input{display:block;width:100%;height:44px;box-sizing:border-box;padding:0 12px;border-radius:6px;border:1px solid #dedbd8;background:#ffffff;color:#292929;font-family:inherit;font-size:13px;outline:none;box-shadow:0 1px 2px rgba(40,30,25,.025);transition:border-color .18s,box-shadow .18s}

#hhRequiredVisitorGate input:focus{border-color:#b5121b;box-shadow:0 0 0 2px rgba(181,18,27,.1)}

#hhRequiredVisitorGate #hhReqSubmit{width:100%;height:46px;margin-top:18px;border:0;border-radius:6px;background:linear-gradient(110deg,#bd1823,#a90e18);color:#ffffff;font-family:inherit;font-weight:700;font-size:13px;letter-spacing:.02em;cursor:pointer;box-shadow:0 5px 12px rgba(181,18,27,.14);transition:box-shadow .18s,filter .18s}

#hhRequiredVisitorGate #hhReqSubmit:hover:not(:disabled){filter:brightness(1.06);box-shadow:0 6px 16px rgba(181,18,27,.22)}
#hhRequiredVisitorGate .hh-close{position:absolute;top:10px;right:10px;z-index:2;display:grid;place-items:center;width:32px;height:32px;margin:0;padding:0;border:1px solid #e6e1de;border-radius:50%;background:rgba(255,255,255,.9);color:#74706e;font:24px/1 Arial,sans-serif;cursor:pointer;box-shadow:none}
#hhRequiredVisitorGate .hh-close:hover:not(:disabled){background:#fff1f2;color:#b5121b;border-color:#e6b9bd}
#hhRequiredVisitorGate button:focus-visible{outline:2px solid #b5121b;outline-offset:3px}
#hhRequiredVisitorGate button:disabled{opacity:.6;cursor:wait}#hhRequiredVisitorGate .hh-error{min-height:18px;margin-top:8px;color:#b5121b;font-size:12px;line-height:18px}

#hhHoldConfirm{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.68);backdrop-filter:blur(12px);font-family:Arial,sans-serif}

#hhHoldConfirm.open{display:flex}#hhHoldConfirm .hh-hold-card{width:min(400px,100%);box-sizing:border-box;background:#f4f5f7;color:#292929;border:1px solid rgba(181,18,27,.25);border-radius:2px;padding:26px 24px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
#hhRequiredVisitorGate .hh-logo{
  display:block;
  width:auto;
  height:42px;
  max-width:180px;
  object-fit:contain;
  object-position:center;
  margin:0 auto 22px;
}
.hh-detail{padding:13px;border:1px solid rgba(181,18,27,.18);border-radius:3px;background:rgba(181,18,27,.04);margin:15px 0 18px}.hh-actions{display:flex;gap:8px}.hh-actions button{flex:1;height:42px;border:0;border-radius:3px;font-weight:700;cursor:pointer}.hh-no{background:#eeeeee;color:#292929}.hh-yes{background:#b5121b;color:#ffffff}



@media (max-width:600px){

  #hhRequiredVisitorGate{
    padding:10px;
  }

  #hhRequiredVisitorGate .hh-card{
    width:100%;
    max-width:280px;
    height:auto;
    min-height:0;
    padding:17px 15px;
    border-radius:8px;
    overflow:hidden;
  }

  #hhRequiredVisitorGate .hh-card::before{
    top:-10px;
    right:85px;
    width:105px;
    height:100px;
  }

  #hhRequiredVisitorGate .hh-logo{
    height:25px;
    max-width:115px;
    margin:0 auto 10px;
  }

  #hhRequiredVisitorGate h2{
    margin:0 0 5px;
    font-size:17px;
    line-height:1.15;
  }

  #hhRequiredVisitorGate .hh-copy{
    margin:0 auto 13px;
    max-width:240px;
    font-size:9px;
    line-height:1.35;
  }

  #hhRequiredVisitorGate label{
    margin:8px 0 4px;
    font-size:8px;
    line-height:10px;
  }

  #hhRequiredVisitorGate input{
    height:32px;
    padding:0 8px;
    border-radius:4px;
    font-size:10px;
  }

  #hhRequiredVisitorGate #hhReqSubmit{
    height:34px;
    margin-top:11px;
    border-radius:4px;
    font-size:10px;
  }

  #hhRequiredVisitorGate .hh-error{
    min-height:0;
    margin-top:4px;
    font-size:8px;
    line-height:11px;
  }
}



    `;document.head.appendChild(s);
  }
  function hideOldForms() {
    ['newLeadFormOverlay', 'newLeadCaptureForm', 'hhVisitorOverlay', 'hhVisitorGate'].forEach(id => {
      const el = document.getElementById(id); if (el) { if (id === 'newLeadFormOverlay') { el.classList.remove('active', 'open'); el.style.display = 'none' } else if (id !== 'hhRequiredVisitorGate') el.style.display = 'none'; }
    });
  }

  function ensureGate() {
    addStyles();
    let g = document.getElementById('hhRequiredVisitorGate');
    if (g) return g;
    g = document.createElement('div'); g.id = 'hhRequiredVisitorGate'; g.setAttribute('role','dialog'); g.setAttribute('aria-modal','true'); g.setAttribute('aria-label','CM Infinia visitor details');
g.innerHTML = `<div class="hh-card"><button class="hh-close" id="hhReqClose" type="button" aria-label="Close form and stay in this room" title="Stay in this room"><span aria-hidden="true">&times;</span></button><div class="hh-logo" style="text-align:center;font-weight:bold">CM INFINIA</div><h2>Your Journey Starts Here</h2><p class="hh-copy">Please enter your details to continue to CM Infinia.</p><form id="hhRequiredVisitorForm" novalidate><label for="hhReqName">Full Name *</label><input id="hhReqName" required autocomplete="name"><label for="hhReqPhone">Phone Number *</label><input id="hhReqPhone" required inputmode="numeric" maxlength="10" autocomplete="tel"><label for="hhReqCity">City *</label><input id="hhReqCity" required autocomplete="address-level2"><label for="hhReqEmail">Email <span style="font-weight:400;opacity:.75">(optional)</span></label><input id="hhReqEmail" type="email" autocomplete="email"><div class="hh-error" id="hhReqError" aria-live="polite"></div><button id="hhReqSubmit" type="submit">Continue</button></form></div>`;
    document.body.appendChild(g);
    const closeButton = g.querySelector('#hhReqClose');
    function dismissGate() {
      if (closeButton.disabled || !g.classList.contains('open')) return;
      pendingNavigation = null;
      g.classList.remove('open');
      document.body.style.overflow = '';
      g.querySelector('#hhReqError').textContent = '';
      window.dispatchEvent(new Event('cm-infinia:visitor-dismissed'));
    }
    closeButton.addEventListener('click', dismissGate);
    g.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); dismissGate(); }
    });
    g.querySelector('#hhRequiredVisitorForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      if (g.querySelector('#hhReqSubmit').disabled) return;
      const name = g.querySelector('#hhReqName').value.trim(), phone = g.querySelector('#hhReqPhone').value.replace(/\D/g, ''), email = g.querySelector('#hhReqEmail').value.trim(), city = g.querySelector('#hhReqCity').value.trim();
      const err = g.querySelector('#hhReqError'), btn = g.querySelector('#hhReqSubmit'), c = context(); err.textContent = '';
      if (!name || !city || !/^[0-9]{10}$/.test(phone)) { err.textContent = 'Please enter your name, valid 10-digit phone number and city.'; return }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Please enter a valid email address.'; return }
      btn.disabled = true; closeButton.disabled = true; btn.textContent = 'Submitting...';
      let continueTour = null;
      try {
        await post('visitors', { name, first_name: name.split(/\s+/)[0] || name, last_name: name.split(/\s+/).slice(1).join(' '), mobile: phone, phone: phone, dial_code: '+91', email: email || '', city, source_page: location.href });
        save({ fullName: name, mobile: phone, email, city, submittedAt: new Date().toISOString() });
        g.classList.remove('open'); document.body.style.overflow = '';
        continueTour = pendingNavigation; pendingNavigation = null;
      } catch (ex) { console.error('CM Infinia visitor submit:', ex); err.textContent = 'Could not submit: ' + ex.message }
      finally { btn.disabled = false; closeButton.disabled = false; btn.textContent = 'Continue' }
      if (continueTour) continueTour();
    });
    return g;
  }

  function showGate() {
    hideOldForms();
    if (saved()) return;
    const g = ensureGate(); g.classList.add('open'); document.body.style.overflow = 'hidden';
    g.querySelector('#hhReqClose').focus();
  }

  // Called only by an explicit navigation action, never by tour initialization,
  // image loading or camera movement. Resume the requested view after submission.
  window.CMInfiniaRequireVisitor = function (continueTour) {
    if (document.documentElement.dataset.cmInfiniaVisitorGate !== 'on-navigation' || saved()) return true;
    if (!pendingNavigation) pendingNavigation = continueTour;
    showGate();
    return false;
  };

  function init() {
    window.CMInfiniaVisitor = saved(); window.CMInfiniaContext = context; window.CMInfiniaGetSavedLead = saved; window.CMInfiniaResetVisitor = () => { sessionStorage.removeItem(VISITOR_KEY); location.reload() };
    // Arrival never opens a form. The tour's navigation actions request it.
    hideOldForms();

  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
