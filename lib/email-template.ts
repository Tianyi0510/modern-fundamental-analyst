export type PreferenceEmailCopy = {
  heading: string;
  body: string;
  action: string;
  note: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export function renderPreferenceEmail(copy: PreferenceEmailCopy, preferencesUrl: string) {
  const heading = escapeHtml(copy.heading);
  const body = escapeHtml(copy.body);
  const action = escapeHtml(copy.action);
  const note = escapeHtml(copy.note);
  const url = escapeHtml(preferencesUrl);

  return `<div style="background:#ededed;padding:32px 16px">
    <div style="background:#ffffff;color:#000000;max-width:600px;margin:0 auto;font-family:Inter,Arial,Helvetica,sans-serif">
      <div style="background:#002991;padding:28px 32px">
        <p style="color:#ffffff;font-size:14px;font-weight:700;margin:0 0 8px">Modern Fundamental Analyst<span style="color:#008cff">.</span></p>
        <h1 style="color:#ffffff;font-size:28px;line-height:36px;margin:0">${heading}</h1>
      </div>
      <div style="padding:32px">
        <p style="font-size:17px;line-height:28px;margin:0 0 24px">${body}</p>
        <a href="${url}" style="background:#5fcdfd;color:#000000;display:inline-block;font-size:15px;font-weight:700;padding:14px 22px;text-decoration:none">${action} →</a>
        <p style="font-size:13px;line-height:20px;margin:28px 0 0">${note}</p>
      </div>
    </div>
  </div>`;
}
