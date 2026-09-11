import React from 'react';

// Tiny shared form primitives used by EmployeeFormPage/ProjectFormPage/
// DataEntry/BulkUploadPanel — kept in one place instead of copy-pasted
// per file now that Data Entry spans multiple pages.
export const label = { fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase', letterSpacing: '0.4px' };
export const inputStyle = { width: '100%', marginTop: '6px', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-primary)' };
const fieldStyle = { flex: '1 1 200px', minWidth: 0 };

export const SECTION_STYLE = { background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' };
export const BTN_PRIMARY = { background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '9px 18px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#FFFFFF' };
export const BTN_GHOST = { border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '9px 16px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-text-secondary)' };

export function Field({ children }) {
  return <div style={fieldStyle}>{children}</div>;
}

export function TextInput({ labelText, hint, ...props }) {
  return (
    <Field>
      <label style={label}>{labelText}</label>
      <input {...props} style={inputStyle} />
      {hint && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '3px' }}>{hint}</p>}
    </Field>
  );
}

export function SelectInput({ labelText, options, ...props }) {
  return (
    <Field>
      <label style={label}>{labelText}</label>
      <select {...props} style={inputStyle}>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.text ?? o}</option>
        ))}
      </select>
    </Field>
  );
}

export function Banner({ tone = 'info', children }) {
  const colors = { info: 'var(--w-accent-blue)', success: 'var(--w-green)', error: 'var(--w-red)' };
  const c = colors[tone];
  return (
    <div style={{ background: `color-mix(in srgb, ${c} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`, borderRadius: '8px', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: c }}>
      {children}
    </div>
  );
}
