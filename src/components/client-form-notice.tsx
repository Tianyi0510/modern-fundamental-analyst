import type { Locale } from "@/lib/i18n";

const notice = {
  en: "Enable JavaScript to use this form. Your information has not been sent.",
  "zh-tw": "請啟用 JavaScript 以使用此表單。你的資料尚未送出。",
  "zh-cn": "请启用 JavaScript 以使用此表单。你的资料尚未发送。",
};

export function ClientFormNotice({ locale }: { locale: Locale }) {
  return (
    <noscript>
      <p className="col-span-full m-0 text-small-body">{notice[locale]}</p>
    </noscript>
  );
}
